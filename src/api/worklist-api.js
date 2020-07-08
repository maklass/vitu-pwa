import { getStringFromHumanName, getIdentifierBySystem } from "@molit/fhir-util";
import { fetchResourcesPost, fetchResources, submitResource, updateResource, fetchPatient, fetchResource, fetchByUrl, mapFhirResponse } from "@molit/fhir-api";
import { cloneDeep, defaultsDeep } from "lodash";
import { convertFileToBase64, generateCheckedId } from "@/util/util";
import {
  transactionPostPatientTemplate,
  transactionPutPatientTemplate,
  compositionTemplate,
  episodeofCareTemplate,
  patientTemplate,
  taskTemplate,
  transactionDeleteTemplate,
  transactionPutTemplate,
  observationTemplate,
  valueCodeableConceptTemplate,
  transactionPostCompostionTemplate,
  reasonCancelledExtension,
  organizationTemplate,
  encounterTemplate,
  conditionTemplate,
  procedureTemplate,
  medicationStatementTemplate,
  commentTemplate,
  binaryTemplate,
  documentReferenceTemplate
} from "@/templates/fhir-templates";
import uuid from "uuid/v4";
import { Base64 } from "js-base64";

/**
 * Fetches all episodes of care by the given ids.
 *
 * @param {String} fhirBaseUrl - the fhir base url
 * @param {String[]} ids - the ids of the episodes of care to fetch
 * @param {String} [token] - the authentication token
 * @returns {Promise} - the web service response as Promise
 */
export const fetchEpisodeOfCares = (fhirBaseUrl, ids, token) => {
  if (!ids || !ids.length) {
    throw new Error("Ids must not be null");
  }

  const params = {
    _id: ids.join(","),
    _count: ids.length
  };

  return fetchResourcesPost(fhirBaseUrl, "EpisodeOfCare", params, token);
};

/**
 * Posts all resources of a clinical case to the fhir server.
 *
 * @param {String} fhirBaseUrl - the fhir base url
 * @param {String} [token] - the authentication token
 * @param {Object} patient - the patient
 * @param {Object} practitioner - the practitioner
 * @param {Object} formData - the form data
 * @returns {Promise} - the web service response as Promise
 */
export const editClinicalCase = async (
  fhirBaseUrl,
  token,
  patient,
  practitioner,
  { icd10, subType, uicc, t, n, m, currentStatus, ecog, dateOfDiagnosis, additionalDiagnosis, biomarkerList, inclusionCriteriaResponse, therapies, dischargeSummary, report, additionalDocuments, comment }
) => {
  if (!patient || !patient.id || !patient.name) {
    throw new Error("Patient must not be null");
  }
  let transaction = cloneDeep(transactionPostCompostionTemplate);

  let url = fhirBaseUrl + "/EpisodeOfCare?patient=Patient/" + patient.id;
  let responseEpisodeOfCare = await fetchByUrl(url);
  let entries = mapFhirResponse(responseEpisodeOfCare);

  if (!entries || !entries[0]) {
    throw new Error("Episode of care not found");
  }
  const compositionId = "urn:uuid:" + uuid();
  const diagnoseConditionId = "urn:uuid:" + uuid();

  let episodeOfCare = entries[0];
  episodeOfCare = defaultsDeep(episodeOfCare, episodeofCareTemplate);
  setAttributesOnEpisodeOfCare(episodeOfCare, patient, icd10, null, null, diagnoseConditionId);
  addResourceToTransaction(transaction, "EpisodeOfCare/" + episodeOfCare.id, episodeOfCare, "PUT", "EpisodeOfCare/" + episodeOfCare.id);
  const episodeOfCareId = episodeOfCare.id;

  let composition = cloneDeep(compositionTemplate);
  composition.title = "MTB Anmeldeformular";
  composition.type.coding[1] = {
    system: "http://loinc.org",
    code: "78482-7",
    display: "Oncology Progress note"
  };
  composition.date = new Date().toISOString();
  if (practitioner) {
    composition.author[0].reference = "PractitionerRole/" + practitioner.id;
  }
  composition.subject.reference = "Patient/" + patient.id;

  const encounterId = "urn:uuid:" + uuid();
  let encounter = cloneDeep(encounterTemplate);
  composition.encounter.reference = encounterId;
  addResourceToTransaction(transaction, encounterId, encounter, "POST", "Encounter");

  addInclusionCriteriaResponse(composition, transaction, inclusionCriteriaResponse);

  addDiagnosis(composition, transaction, patient, icd10, subType, dateOfDiagnosis, uicc, t, n, m, currentStatus, ecog, encounterId, additionalDiagnosis, diagnoseConditionId, episodeOfCareId);

  addBiomarkers(composition, transaction, biomarkerList, patient);

  therapies = therapies.filter(t => t.therapyOption);

  addTherapies(composition, transaction, therapies, patient, episodeOfCareId, diagnoseConditionId);

  await addDocuments(composition, transaction, patient, dischargeSummary, report, additionalDocuments);
  //Consent
  addCommentToClinicalCase(composition, transaction, comment, patient);
  addResourceToTransaction(transaction, compositionId, composition, "POST", "Composition");
  return submitResource(fhirBaseUrl, transaction, token);
};

const addCommentToClinicalCase = (composition, transaction, comment, patient) => {
  if (!patient || !comment) {
    return;
  }

  const documentReferenceId = "urn:uuid:" + uuid();
  const fileBinaryId = "urn:uuid:" + uuid();
  const patientReference = "Patient/" + patient.id;
  const data = Base64.encode(comment);

  let documentReference = cloneDeep(documentReferenceTemplate);
  let furtherInformation = {
    title: "weitere Informationen",
    entry: []
  };

  documentReference.subject.reference = patientReference;
  documentReference.content[0].attachment.id = fileBinaryId;
  documentReference.content[0].attachment.contentType = "text/plain";
  documentReference.content[0].attachment.data = data;
  documentReference.type.coding[0].system = "http://molit.eu/fhir/CodeSystem/vitu-observation-note-types";
  documentReference.type.coding[0].code = "registration-form";
  documentReference.type.coding[0].display = "Anmeldeformular";
  documentReference.type.coding.push({});
  documentReference.type.coding[1].system = "http://ncit.nci.nih.gov";
  documentReference.type.coding[1].code = "C42619";
  documentReference.type.coding[1].display = "Note";
  furtherInformation.entry.push({
    reference: documentReferenceId,
    display: "Notizen"
  });
  addResourceToTransaction(transaction, documentReferenceId, documentReference, "POST", "DocumentReference");
  composition.section.push(furtherInformation);
};

/**
 *
 * @param {*} composition
 * @param {*} transaction
 * @param {*} patient
 * @param {*} dischargeSummary
 * @param {*} report
 * @param {*} additionalDocuments
 */
const addDocuments = async (composition, transaction, patient, dischargeSummary, report, additionalDocuments) => {
  let documentsObject = {
    title: "Arztbrief & Befunde",
    entry: []
  };
  if (dischargeSummary) {
    await createDocument(transaction, documentsObject, dischargeSummary, "application/pdf", "Patient/" + patient.id, "http://loinc.org", "11490-0", "Discharge summarization note [physician]", "Aktueller Arztbrief");
  }
  if (report) {
    await createDocument(transaction, documentsObject, report, "application/pdf", "Patient/" + patient.id, "http://ncit.nci.nih.gov", "C28277", "Pathology Report", "Pathologischer Befund");
  }
  if (additionalDocuments) {
    for (const element of additionalDocuments) {
      if (element) {
        await createDocument(transaction, documentsObject, element, "application/pdf", "Patient/" + patient.id, "http://ncit.nci.nih.gov", "C19498", "Document", "Sonstiges Dokument");
      }
    }
  }
  composition.section.push(documentsObject);
};

/**
 *
 * @param {*} transaction
 * @param {*} documentsObject
 * @param {*} file
 * @param {*} contentType
 * @param {*} patientReference
 */
const createDocument = async (transaction, documentsObject, file, contentType, patientReference, codingSystem, codingCode, codingDisplay, entryDisplay) => {
  const fileBinaryId = "urn:uuid:" + uuid();
  let binary = cloneDeep(binaryTemplate);
  binary.contentType = contentType;
  const value = (await convertFileToBase64(file)).replace("data:application/pdf;base64,", "");
  binary.data = value;
  const documentReferenceId = "urn:uuid:" + uuid();
  let documentReference = cloneDeep(documentReferenceTemplate);
  documentReference.subject.reference = patientReference;
  documentReference.content[0].attachment.id = fileBinaryId;
  documentReference.content[0].attachment.contentType = contentType;
  documentReference.content[0].attachment.data = value;
  documentReference.content[0].attachment.url = "/Binary/" + fileBinaryId;
  documentReference.type.coding[0].system = codingSystem;
  documentReference.type.coding[0].code = codingCode;
  documentReference.type.coding[0].display = codingDisplay;
  documentReference.description = entryDisplay + " (" + file.name + ")";
  addResourceToTransaction(transaction, fileBinaryId, binary, "POST", "Binary");
  addResourceToTransaction(transaction, documentReferenceId, documentReference, "POST", "DocumentReference");
  documentsObject.entry.push({
    reference: documentReferenceId,
    display: entryDisplay
  });
};

/**
 *
 * @param {*} composition
 * @param {*} transaction
 * @param {*} therapies
 * @param {*} patient
 * @param {*} episodeOfCareId
 * @param {*} diagnoseConditionId
 */
const addTherapies = (composition, transaction, therapies, patient, episodeOfCareId, diagnoseConditionId) => {
  if (therapies) {
    let therapiesObject = {
      title: "Bisherige Therapie",
      entry: []
    };

    for (let i = 0; i < therapies.length; i++) {
      let resourceId = "urn:uuid:" + uuid();
      let resource = null;
      switch (therapies[i].therapyOption) {
        case "Systemische Therapie":
          if (!therapies[i].medication) {
            return;
          }
          resource = buildMedicationStatement(
            "completed",
            therapies[i].medication.system,
            therapies[i].medication.code,
            therapies[i].medication.display,
            "Patient/" + patient.id,
            "EpisodeOfCare/" + episodeOfCareId,
            formatTherapyDate(therapies[i].startDate),
            diagnoseConditionId,
            formatTherapyDate(therapies[i].endDate)
          );
          addResourceToTransaction(transaction, resourceId, resource, "POST", "MedicationStatement");
          break;
        case "Bestrahlung":
          resource = buildProcedure(
            "completed",
            "Patient/" + patient.id,
            "http://hl7.org/fhir/StructureDefinition/workflow-episodeOfCare",
            episodeOfCareId,
            "http://ncit.nci.nih.gov",
            "C15313",
            "Radiation Therapy",
            "http://ncit.nci.nih.gov",
            "C15313",
            "Radiation Therapy",
            null,
            formatTherapyDate(therapies[i].startDate),
            formatTherapyDate(therapies[i].endDate)
          );
          addResourceToTransaction(transaction, resourceId, resource, "POST", "Procedure");
          break;
        case "Operation":
          resource = buildProcedure(
            "completed",
            "Patient/" + patient.id,
            "http://hl7.org/fhir/StructureDefinition/workflow-episodeOfCare",
            episodeOfCareId,
            "http://ncit.nci.nih.gov",
            "C17173",
            "Surgery procedure",
            "http://ncit.nci.nih.gov",
            "C164212",
            "Tumor Resection",
            null,
            formatTherapyDate(therapies[i].startDate),
            formatTherapyDate(therapies[i].endDate)
          );
          addResourceToTransaction(transaction, resourceId, resource, "POST", "Procedure");
          break;
        default:
          break;
      }
      therapiesObject.entry.push({
        reference: resourceId,
        display: therapies[i].therapyOption
      });
    }
    composition.section.push(therapiesObject);
  }
};

/**
 *
 * @param {*} composition
 * @param {*} transaction
 * @param {*} biomarkerList
 * @param {*} patient
 */
const addBiomarkers = (composition, transaction, biomarkerList, patient) => {
  if (biomarkerList) {
    let diagnosticsObject = {
      title: "Durchgeführte Diagnostiken",
      entry: []
    };
    for (let i = 0; i < biomarkerList.length; i++) {
      const obsId = "urn:uuid:" + uuid();
      let obsValueCodeableConcept = buildValueCodeableConcept("http://loinc.org", biomarkerList[i].result.code, biomarkerList[i].result.display);
      let obs = buildObservation("final", "Patient/" + patient.id, null, "http://ncit.nci.nih.gov", biomarkerList[i].code, biomarkerList[i].display, biomarkerList[i].display, null, obsValueCodeableConcept, null);
      delete obs.valueString;
      diagnosticsObject.entry.push({
        reference: obsId,
        display: biomarkerList[i].display
      });
      addResourceToTransaction(transaction, obsId, obs, "POST", "Observation");
    }
    composition.section.push(diagnosticsObject);
  }
};

/**
 *
 * @param {*} composition
 * @param {*} transaction
 * @param {*} inclusionCriteriaResponse
 */
const addInclusionCriteriaResponse = (composition, transaction, inclusionCriteriaResponse) => {
  if (inclusionCriteriaResponse) {
    const indicationCriteriaId = "urn:uuid:" + uuid();
    composition.section.push({
      title: "Indikationskriterien",
      entry: [
        {
          reference: indicationCriteriaId
        }
      ]
    });
    addResourceToTransaction(transaction, indicationCriteriaId, inclusionCriteriaResponse, "POST", "QuestionnaireResponse");
  }
};

/**
 *
 * @param {*} composition
 * @param {*} transaction
 * @param {*} patient
 * @param {*} icd10
 * @param {*} subType
 * @param {*} dateOfDiagnosis
 * @param {*} uicc
 * @param {*} t
 * @param {*} n
 * @param {*} m
 * @param {*} currentStatus
 * @param {*} ecog
 * @param {*} encounterId
 * @param {*} additionalDiagnosis
 */
const addDiagnosis = (composition, transaction, patient, icd10, subType, dateOfDiagnosis, uicc, t, n, m, currentStatus, ecog, encounterId, additionalDiagnosis, diagnoseConditionId, episodeOfCareId) => {
  let diagnosisObject = {
    title: "Diagnose",
    entry: []
  };
  let diagnoseCondition = cloneDeep(conditionTemplate);
  diagnoseCondition.clinicalStatus = "active";
  diagnoseCondition.code.coding[0].system = "http://fhir.de/CodeSystem/dimdi/icd-10-gm";
  if (icd10) {
    diagnoseCondition.code.coding[0].code = icd10.code;
    diagnoseCondition.code.coding[0].display = icd10.display;
  }
  diagnoseCondition.subject.reference = "Patient/" + patient.id;
  diagnoseCondition.onsetDateTime = dateOfDiagnosis;
  diagnoseCondition.note = [{ text: additionalDiagnosis }];
  diagnosisObject.entry.push({
    reference: diagnoseConditionId,
    display: "Diagnose"
  });
  addResourceToTransaction(transaction, diagnoseConditionId, diagnoseCondition, "POST", "Condition");
  diagnosisObject.entry.push({
    reference: "EpisodeOfCare/" + episodeOfCareId,
    display: "Tumorerkrankung"
  });
  if (subType) {
    const subTypeId = "urn:uuid:" + uuid();
    let subTypeValueCodeableConcept = buildValueCodeableConcept("http://ncit.nci.nih.gov", subType.code, subType.display);
    let subTypeObservation = buildObservation("final", "Patient/" + patient.id, encounterId, "http://ncit.nci.nih.gov", "C25696", "Subtype", null, null, subTypeValueCodeableConcept, null);
    diagnosisObject.entry.push({
      reference: subTypeId,
      display: "Krebs-Subtyp"
    });
    delete subTypeObservation.valueString;
    addResourceToTransaction(transaction, subTypeId, subTypeObservation, "POST", "Observation");
  }

  const tnmObservationId = "urn:uuid:" + uuid();
  diagnosisObject.entry.push({
    reference: tnmObservationId,
    display: "UICC Stadium & TNM"
  });
  const tnmObservation = createTNMObservation(uicc, t, n, m, patient, encounterId);
  delete tnmObservation.valueString;
  addResourceToTransaction(transaction, tnmObservationId, tnmObservation, "POST", "Observation");

  if (currentStatus) {
    const currentStatusId = "urn:uuid:" + uuid();
    diagnosisObject.entry.push({
      reference: currentStatusId,
      display: "aktueller Erkrankungszustand"
    });
    //TODO Code fehlt
    let currentStatusValueCodeableConcept = buildValueCodeableConcept("http://www.basisdatensatz.de/gesamtbeurteilung-des-tumorstatus", null, currentStatus);
    //TODO display fehlt
    let currentStatusObservation = buildObservation("final", "Patient/" + patient.id, encounterId, "http://ncit.nci.nih.gov", "C25688", "", null, null, currentStatusValueCodeableConcept);
    delete currentStatusObservation.valueString;
    addResourceToTransaction(transaction, currentStatusId, currentStatusObservation, "POST", "Observation");
  }

  if (ecog) {
    const ecogId = "urn:uuid:" + uuid();
    diagnosisObject.entry.push({
      reference: ecogId,
      display: "ECOG"
    });
    let ecogValueCodeableConcept = buildValueCodeableConcept(ecog.system, ecog.code, ecog.display);
    const ecogObservation = buildObservation("final", "Patient/" + patient.id, encounterId, "http://loinc.org", "89247-1", "ECOG Performance Status score", null, null, ecogValueCodeableConcept, null);
    delete ecogObservation.valueString;
    addResourceToTransaction(transaction, ecogId, ecogObservation, "POST", "Observation");
  }
  composition.section.push(diagnosisObject);
};

const formatTherapyDate = date => {
  if (!date) {
    return null;
  }

  let dateParts = date.split("/");

  if (dateParts.length === 1) {
    return date;
  }

  return dateParts[1] + "-" + dateParts[0];
};

/**
 * @param {*} status -
 * @param {*} mCCSystem
 * @param {*} mCCCode
 * @param {*} mCCDisplay
 * @param {*} patientReference
 * @param {*} contextReference - Reference of the EpisodeOfCare
 * @param {*} date
 * @param {*} conditonReference
 */
const buildMedicationStatement = (status, mCCSystem, mCCCode, mCCDisplay, patientReference, contextReference, date, conditonReference, endDate) => {
  let medicationStatement = cloneDeep(medicationStatementTemplate);
  medicationStatement.status = status;
  medicationStatement.medicationCodeableConcept.coding[0].system = mCCSystem;
  medicationStatement.medicationCodeableConcept.coding[0].code = mCCCode;
  medicationStatement.medicationCodeableConcept.coding[0].display = mCCDisplay;
  medicationStatement.subject.reference = patientReference;
  medicationStatement.context.reference = contextReference;
  if (endDate) {
    medicationStatement.effectivePeriod.end = endDate;
  }
  if (date) {
    medicationStatement.effectivePeriod.start = date;
  }
  medicationStatement.reasonReference[0].reference = conditonReference;
  delete medicationStatement.effectiveDateTime;
  return medicationStatement;
};

/**
 *
 * @param {*} status
 * @param {*} patientReference
 * @param {*} extensionUrl
 * @param {*} episodeOfCareReference
 * @param {*} categorySystem
 * @param {*} categoryCode
 * @param {*} categoryDisplay
 * @param {*} codeSystem
 * @param {*} codeCode
 * @param {*} codeDisplay
 * @param {*} conditionReference
 * @param {*} startDate
 * @param {*} endDate
 */
const buildProcedure = (status, patientReference, extensionUrl, episodeOfCareReference, categorySystem, categoryCode, categoryDisplay, codeSystem, codeCode, codeDisplay, conditionReference, startDate, endDate) => {
  let procedure = cloneDeep(procedureTemplate);
  procedure.status = status;
  procedure.subject.reference = patientReference;
  procedure.extension[0].url = extensionUrl;
  procedure.extension[0].valueReference.reference = episodeOfCareReference;
  if (categorySystem && categoryCode && categoryDisplay) {
    procedure.category.coding[0].system = categorySystem;
    procedure.category.coding[0].code = categoryCode;
    procedure.category.coding[0].display = categoryDisplay;
  }
  if (codeSystem && codeCode && codeDisplay) {
    procedure.code.coding[0].system = codeSystem;
    procedure.code.coding[0].code = codeCode;
    procedure.code.coding[0].display = codeDisplay;
  }
  if (conditionReference) {
    procedure.reasonReference[0].reference = conditionReference;
  }
  if (endDate) {
    procedure.performedPeriod.end = endDate;
  }
  if (startDate) {
    procedure.performedPeriod.start = startDate;
    procedure.performedDateTime = startDate;
  }
  delete procedure.performedDateTime;
  return procedure;
};

/**
 *
 * @param {*} system
 * @param {*} code
 * @param {*} display
 */
const buildValueCodeableConcept = (system, code, display) => {
  let resource = cloneDeep(valueCodeableConceptTemplate);
  resource.coding[0].system = system;
  resource.coding[0].code = code;
  resource.coding[0].display = display;
  return resource;
};

/**
 *
 * @param {*} transaction
 * @param {*} fullUrl
 * @param {*} resource
 * @param {*} method
 * @param {*} url
 */
export const addResourceToTransaction = (transaction, fullUrl, resource, method, url) => {
  transaction.entry.push({
    fullUrl: fullUrl,
    resource: resource,
    request: {
      method: method,
      url: url
    }
  });
};

/**
 *
 * @param {*} status
 * @param {*} subjectReference
 * @param {*} encounterReference
 * @param {*} codeSystem
 * @param {*} codeCode
 * @param {*} codeDisplay
 * @param {*} codeText
 * @param {*} effectiveDateTime
 * @param {*} valueCodeableConcept
 * @param {*} component
 */
const buildObservation = (status, subjectReference, encounterReference, codeSystem, codeCode, codeDisplay, codeText, effectiveDateTime, valueCodeableConcept, component) => {
  let observation = cloneDeep(observationTemplate);
  observation.status = status;
  observation.code.text = codeText;
  observation.code.coding[0].system = codeSystem;
  observation.code.coding[0].code = codeCode;
  observation.code.coding[0].display = codeDisplay;
  observation.subject.reference = subjectReference;
  observation.encounter.reference = encounterReference;
  observation.effectiveDateTime = effectiveDateTime;
  observation.valueCodeableConcept = valueCodeableConcept;
  observation.component = component;
  return observation;
};

/**
 *
 * @param {*} uicc
 * @param {*} t
 * @param {*} n
 * @param {*} m
 * @param {*} patient
 * @param {*} encounter
 */
const createTNMObservation = (uicc, t, n, m, patient, encounterReference) => {
  let valueCodeableConcept = {
    coding: [
      {
        system: "urn:oid:2.16.840.1.113883.15.16",
        code: uicc,
        display: uicc
      }
    ]
  };
  const component = [
    {
      code: {
        coding: [
          {
            system: "http://loinc.org",
            code: "21905-5"
          }
        ]
      },
      valueCodeableConcept: {
        coding: [
          {
            system: "urn:oid:2.16.840.1.113883.15.16",
            code: t,
            display: t
          }
        ]
      }
    },
    {
      code: {
        coding: [
          {
            system: "http://loinc.org",
            code: "21906-3"
          }
        ]
      },
      valueCodeableConcept: {
        coding: [
          {
            system: "urn:oid:1.3.6.1.4.1.19376.1.3.11.44",
            code: n,
            display: n
          }
        ]
      }
    },
    {
      code: {
        coding: [
          {
            system: "http://loinc.org",
            code: "21907-1"
          }
        ]
      },
      valueCodeableConcept: {
        coding: [
          {
            system: "urn:oid:1.3.6.1.4.1.19376.1.3.11.45",
            code: m,
            display: m
          }
        ]
      }
    }
  ];
  return buildObservation("final", "Patient/" + patient.id, encounterReference, "http://loinc.org", "75620-5", "TNM clinical staging before treatment panel", null, null, valueCodeableConcept, component);
};

/**
 * Posts all resources of a clinical case to the fhir server.
 *
 * @param {String} fhirBaseUrl - the fhir base url
 * @param {Object} patient - the patient
 * @param {String} caseId - the case id
 * @param {Object} status - the status
 * @param {String} [token] - the authentication token
 * @returns {Promise} - the web service response as Promise
 */
export const addPatientEpisodeOfCare = (fhirBaseUrl, patient, caseId, token) => {
  if (!patient || !patient.name) {
    throw new Error("Patient must not be null");
  }
  const episodeOfCareId = "urn:uuid:" + uuid();
  const patientId = "urn:uuid:" + uuid();
  const taskId = "urn:uuid:" + uuid();

  let episodeOfCare = cloneDeep(episodeofCareTemplate);
  setAttributesOnEpisodeOfCare(episodeOfCare, patient, null, caseId, patientId);
  episodeOfCare.identifier.push(createEpisodeOfCareIdentifier());

  let task = cloneDeep(taskTemplate);
  setAttributesOnTask(task, patient, status, null, null);
  task.input[0].valueReference.reference = episodeOfCareId;
  task.for.reference = patientId;
  task.authoredOn = new Date().toISOString();
  task.businessStatus = {
    coding: [
      {
        system: "http://molit.eu/fhir/vitu/ValueSet/vitu-workinglist",
        code: "new",
        display: "Neu"
      }
    ],
    text: "Neu"
  };

  let transaction = cloneDeep(transactionPostPatientTemplate);
  transaction.entry[0].fullUrl = episodeOfCareId;
  transaction.entry[0].resource = episodeOfCare;
  transaction.entry[1].fullUrl = patientId;
  transaction.entry[1].resource = patient;
  transaction.entry[2].fullUrl = taskId;
  transaction.entry[2].resource = task;

  return submitResource(fhirBaseUrl, transaction, token);
};

/**
 * Updates all resources of a clinical case on the fhir server.
 *
 * @param {String} fhirBaseUrl - the fhir base url
 * @param {Object} patient - the patient
 * @param {String} icd10 - the icd10 code of the diagnosis
 * @param {String} caseId - the case id
 * @param {Object} status - the status
 * @param {Object} task - the existing task resource
 * @param {Object} episodeOfCare - the existing episode of care
 * @param {String} [reasonForCancellation] - the reason for cancellation
 * @param {String} [reasonForCancellationOther] - other reason for cancellation
 * @param {String} [token] - the authentication token
 * @returns {Promise} - the web service response as Promise
 */
export const updateClinicalCase = async (fhirBaseUrl, patient, icd10, caseId, status, task, episodeOfCare, reasonForCancellation, reasonForCancellationOther, token) => {
  if (!patient || !patient.id || !patient.name) {
    throw new Error("Patient must not be null");
  }

  defaultsDeep(task, cloneDeep(taskTemplate));
  setAttributesOnTask(task, patient, status, reasonForCancellation, reasonForCancellationOther);

  defaultsDeep(episodeOfCare, cloneDeep(episodeofCareTemplate));
  setAttributesOnEpisodeOfCare(episodeOfCare, patient, icd10, caseId);

  let transaction = cloneDeep(transactionPutTemplate);
  transaction.entry[0].resource = episodeOfCare;
  transaction.entry[0].request.url = transaction.entry[0].request.url + episodeOfCare.id;
  transaction.entry[1].resource = task;
  transaction.entry[1].request.url = transaction.entry[1].request.url + task.id;

  return submitResource(fhirBaseUrl, transaction, token);
};

export const updateTask = (fhirBaseUrl, token, task, status, reasonForCancellation, reasonForCancellationOther) => {
  defaultsDeep(task, cloneDeep(taskTemplate));
  setAttributesOnTask(task, null, status, reasonForCancellation, reasonForCancellationOther);

  return updateResource(fhirBaseUrl, task, token);
};

/**
 * Deletes a clinical case from the fhir server. This includes a task and an episodeOfCare.
 *
 * @param {String} fhirBaseUrl - the fhir base url
 * @param {String} episodeOfCareId - the episodeOfCare id
 * @param {String} taskId - the task id
 * @param {String} [token] - the authenticatio token
 * @returns {Promise} - the web service response as Promise
 */
export const deleteClinicalCase = async (fhirBaseUrl, episodeOfCareId, taskId, token) => {
  if (!fhirBaseUrl || !taskId) {
    throw new Error("Params must not be null");
  }

  const transaction = cloneDeep(transactionDeleteTemplate);
  if (!episodeOfCareId) {
    transaction.entry.shift();
    transaction.entry[0].request.url = transaction.entry[0].request.url + taskId;
  } else {
    transaction.entry[0].request.url = transaction.entry[0].request.url + episodeOfCareId;
    transaction.entry[1].request.url = transaction.entry[1].request.url + taskId;
  }

  return submitResource(fhirBaseUrl, transaction, token);
};

export const createPatientIdentifier = () => {
  return {
    use: "official",
    type: {
      coding: [
        {
          system: "http://molit.eu/fhir/vitu/CodeSystem/identifier-types",
          code: "vitu-patient-identifier"
        }
      ]
    },
    system: "http://molit.eu/fhir/NamingSystem/vitu-patientId",
    value: generateCheckedId()
  };
};

export const createEpisodeOfCareIdentifier = () => {
  return {
    use: "official",
    type: {
      coding: [
        {
          system: "http://molit.eu/fhir/vitu/CodeSystem/identifier-types",
          code: "vitu-episodeOfCare-identifier"
        }
      ]
    },
    system: "http://molit.eu/fhir/vitu/NamingSystem/vitu-episode-of-care",
    value: generateCheckedId()
  };
};

/**
 * Adds a patient to the fhir server.
 *
 * @param {String} fhirBaseUrl - the fhir base url
 * @param {String} [token] - the authentication token
 * @param {Object} identifier - the patient id
 * @param {String} firstName - the firstname
 * @param {String} lastName - the lastname
 * @param {Date} birthDate - the birthdate
 * @param {String} gender - the gender
 * @param {String} caseId - the case Id
 * @param {Object} organization - the managing organization
 * @returns {Promise} - the web service response as Promise
 */
export const addPatient = (fhirBaseUrl, token, identifier, firstName, lastName, birthDate, gender, caseId, organization) => {
  if (!fhirBaseUrl || !identifier || !firstName || !lastName || !birthDate || !gender) {
    throw new Error("Params must not be null");
  }

  let given = firstName.split(" ");
  let patient = cloneDeep(patientTemplate);

  patient.identifier.push(identifier);
  patient.identifier.push(createPatientIdentifier());
  patient.name[0].given = given;
  patient.name[0].family = lastName;
  patient.gender = gender;
  patient.birthDate = birthDate;

  if (organization && organization.id) {
    patient.managingOrganization = {
      reference: "Organization/" + organization.id,
      display: organization.name
    };
  }

  return addPatientEpisodeOfCare(fhirBaseUrl, patient, caseId, token);
};

/**
 * Update a patient on the fhir server.
 *
 * @param {String} fhirBaseUrl - the fhir base url
 * @param {String} [token] - the authentication token
 * @param {Object} patient - the patient resource
 * @param {String} resourceId - the id of the patient resource
 * @param {Array} identifier - the patient identifier
 * @param {String} firstName - the firstname
 * @param {String} lastName - the lastname
 * @param {Date} birthDate - the birthdate
 * @param {String} gender - the gender
 * @param {Object} episodeOfCare - id of the episodeOfCare resource
 * @param {String} caseId - case Id
 * @param {Object} organization - the managing organization
 * @returns {Promise} - the web service response as Promise
 */
export const updatePatient = (fhirBaseUrl, token, patient, resourceId, identifier, firstName, lastName, birthDate, gender, episodeOfCare, caseId, organization) => {
  if (!fhirBaseUrl || !patient || !identifier || !firstName || !lastName || !birthDate || !gender) {
    throw new Error("Params must not be null");
  }

  let given = firstName.split(" ");
  patient.id = resourceId;
  patient.identifier = identifier;
  patient.name[0].given = given;
  patient.name[0].family = lastName;
  patient.gender = gender;
  patient.birthDate = birthDate;

  if (organization && organization.id) {
    patient.managingOrganization = {
      reference: "Organization/" + organization.id,
      display: organization.name
    };
  }

  if (episodeOfCare && episodeOfCare.id) {
    episodeOfCare = defaultsDeep(episodeOfCare, episodeofCareTemplate);
    let identifier = getIdentifierBySystem(episodeOfCare.identifier, "http://molit.eu/fhir/NamingSystem/generic-vitu-episode-of-care");
    if (!identifier) {
      identifier = {
        system: "http://molit.eu/fhir/NamingSystem/generic-vitu-episode-of-care",
        value: null
      };
      episodeOfCare.identifier.push(identifier);
    }
    identifier.value = caseId;

    let transaction = cloneDeep(transactionPutPatientTemplate);
    transaction.entry[0].resource = episodeOfCare;
    transaction.entry[0].request.url = transaction.entry[0].request.url + episodeOfCare.id;
    transaction.entry[1].resource = patient;
    transaction.entry[1].request.url = transaction.entry[1].request.url + resourceId;

    return submitResource(fhirBaseUrl, transaction, token);
  } else {
    const episodeOfCare = cloneDeep(episodeofCareTemplate);
    setAttributesOnEpisodeOfCare(episodeOfCare, patient, null, caseId, "Patient/" + patient.id);

    let transaction = cloneDeep(transactionPutPatientTemplate);
    transaction.entry[0].resource = episodeOfCare;
    transaction.entry[0].request.method = "POST";
    transaction.entry[1].resource = patient;
    transaction.entry[1].request.url = transaction.entry[1].request.url + resourceId;

    return submitResource(fhirBaseUrl, transaction, token);
  }
};

export const fetchStatuses = async (fhirBaseUrl, token) => {
  const valueSet = mapFhirResponse(await fetchResources(fhirBaseUrl, "ValueSet", { url: "http://molit.eu/fhir/vitu/ValueSet/vitu-workinglist" }, token))[0];
  if (!valueSet) {
    throw new Error("ValueSet 'vitu-worklist' not found on server.");
  }
  return valueSet.compose.include[0].concept;
};

export const fetchReasonsForCancellation = async (fhirBaseUrl, token) => {
  const response = await fetchResources(fhirBaseUrl, "ValueSet", { url: "http://molit.eu/fhir/vitu/ValueSet/tumorboard-cancellation-reason" }, token);
  const entries = mapFhirResponse(response);
  if (entries && entries.length) {
    return entries[0].compose.include[0].concept;
  }
};

export const addComment = (fhirBaseUrl, token, text, date, patientId, episodeOfCareId, practitioner) => {
  const comment = cloneDeep(commentTemplate);
  comment.extension[0].valueReference.reference = "EpisodeOfCare/" + episodeOfCareId;
  comment.subject.reference = "Patient/" + patientId;
  comment.performer[0].display = practitioner;
  comment.effectiveDateTime = date;
  comment.valueString = text;

  return submitResource(fhirBaseUrl, comment, token);
};

export const fetchComments = (fhirBaseUrl, token, patientId) => {
  if (!patientId) {
    throw new Error("Patient id must not be null.");
  }
  const params = {
    code: "tumor-board-preparation",
    subject: patientId,
    _count: 1000
  };
  return fetchResources(fhirBaseUrl, "Observation", params, token);
};

/**
 * Fetches a patient from the fhir server
 *
 * @param {*} fhirBaseUrl - the fhir base url
 * @param {*} id - the id of the patient resource
 * @param {*} params - params
 * @param {*} [token] - the authentication token
 */
export const getPatient = (fhirBaseUrl, id, params, token) => {
  if (!id || !fhirBaseUrl) {
    throw new Error("Params must not be null");
  }

  return fetchPatient(fhirBaseUrl, id, params, token);
};

/**
 * Fetches an organization from the fhir server
 *
 * @param {*} fhirBaseUrl - the fhir base url
 * @param {*} id - the id of the organization resource
 * @param {*} params - params
 * @param {*} [token] - the authentication token
 */
export const getOrganization = (fhirBaseUrl, id, params, token) => {
  if (!id || !fhirBaseUrl) {
    throw new Error("Params must not be null");
  }

  return fetchResource(fhirBaseUrl, "Organization", id, params, token);
};

/**
 * Updates an organization
 *
 * @param {*} fhirBaseUrl - the fhir base url
 * @param {*} organization -
 * @param {*} name - Name of the organization
 * @param {*} partOf
 * @param {*} token
 * @param {*} address
 */
export const updateOrganization = (fhirBaseUrl, organization, address, contact, name, partOf, token) => {
  if (!organization || !fhirBaseUrl) {
    throw new Error("Params must not be null");
  }
  organization.name = name;
  organization.partOf = { reference: partOf, display: name };
  organization.address = [address];
  organization.contact = [contact];
  return updateResource(fhirBaseUrl, organization, token);
};

/**
 * Adds a new organization to the fhir server
 *
 * @param {*} fhirBaseUrl
 * @param {*} name
 * @param {*} partOf
 * @param {*} token
 */
export const addOrganization = (fhirBaseUrl, address, contact, name, partOf, token) => {
  if (!name || !fhirBaseUrl) {
    throw new Error("Params must not be null");
  }
  const organization = cloneDeep(organizationTemplate);
  organization.name = name;
  organization.partOf = { reference: partOf, display: name };
  organization.address = [address];
  organization.contact = [contact];
  return submitResource(fhirBaseUrl, organization, token);
};

export const addTask = (fhirBaseUrl, token, patient, episodeOfCareId) => {
  if (!fhirBaseUrl || !patient || !patient.id || !episodeOfCareId) {
    throw new Error("Params must not be null");
  }

  let task = cloneDeep(taskTemplate);
  task.input[0].valueReference.reference = episodeOfCareId;
  task.for.reference = `Patient/${patient.id}`;
  task.for.display = getStringFromHumanName(patient.name);
  task.authoredOn = new Date().toISOString();
  task.status = "in-progress";
  task.businessStatus = {
    coding: [
      {
        system: "http://molit.eu/fhir/vitu/ValueSet/vitu-workinglist",
        code: "new",
        display: "Neu"
      }
    ],
    text: "Neu"
  };
  return submitResource(fhirBaseUrl, task, token);
};

/**
 * Sets all attributes correctly on the task.
 *
 * @param {Object} task - the task
 * @param {Object} patient - the patient
 * @param {Object} status - the status
 * @param {String} [reasonForCancellation] - the reason for cancellation
 * @param {String} [reasonForCancellationOther] - other reason for cancellation
 */
const setAttributesOnTask = (task, patient, status, reasonForCancellation, reasonForCancellationOther) => {
  if (patient) {
    task.for.reference = `Patient/${patient.id}`;
    task.for.display = getStringFromHumanName(patient.name);
  }
  task.businessStatus.text = status.display;
  task.businessStatus.coding[0].display = status.display;
  task.businessStatus.coding[0].code = status.code;
  task.lastModified = new Date().toISOString();
  if (status.code === "finalized") {
    task.status = "completed";
  } else if (status.code === "cancelled") {
    task.status = "cancelled";
  } else {
    task.status = "in-progress";
  }

  if (reasonForCancellation) {
    let reasonExtension = cloneDeep(reasonCancelledExtension);
    reasonExtension.extension[0].valueCodeableConcept.coding[0].code = reasonForCancellation;
    reasonExtension.extension[1].valueString = reasonForCancellationOther;
    task.extension = [reasonExtension];
  } else if (!reasonForCancellation && task.extension) {
    delete task.extension;
  }

  return task;
};

/**
 * Sets all attributes correctly on the episode of care.
 *
 * @param {Object} episodeOfCare - the episode of care
 * @param {Object} patient - the patient
 * @param {String} icd10 - the diagnosis
 * @param {String} caseId - the case id
 */
const setAttributesOnEpisodeOfCare = (episodeOfCare, patient, icd10, caseId, patientReference, conditionReference) => {
  if (!episodeOfCare) {
    episodeOfCare = cloneDeep(episodeofCareTemplate);
  }

  let identifier = getIdentifierBySystem(episodeOfCare.identifier, "http://molit.eu/fhir/NamingSystem/generic-vitu-episode-of-care");
  if (!identifier) {
    identifier = {
      system: "http://molit.eu/fhir/NamingSystem/generic-vitu-episode-of-care",
      value: null
    };
    episodeOfCare.identifier.push(identifier);
  }
  if (caseId) {
    identifier.value = caseId;
  }
  if (patientReference) {
    episodeOfCare.patient.reference = patientReference;
  } else if (patient && patient.id) {
    episodeOfCare.patient.reference = "Patient/" + patient.id;
  }
  episodeOfCare.patient.display = getStringFromHumanName(patient.name);
  episodeOfCare.diagnosis[0].condition.display = icd10;
  episodeOfCare.diagnosis[0].condition.reference = conditionReference;
  episodeOfCare.diagnosis[0].rank = 1;
  return episodeOfCare;
};
