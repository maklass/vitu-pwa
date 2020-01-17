import { getStringFromHumanName, getIdentifierBySystem } from "@molit/fhir-util";
import { fetchResourcesPost, submitResource } from "@molit/fhir-api";
import { cloneDeep, defaultsDeep } from "lodash";
import { episodeofCareTemplate, patientTemplate, taskTemplate, transactionDeleteTemplate, transactionPutTemplate, transactionPostTemplate, reasonCancelledExtension } from "@/templates/fhir-templates";
import uuid from "uuid/v4";

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
 * @param {Object} patient - the patient
 * @param {String} icd10 - the icd10 code of the diagnosis
 * @param {String} caseId - the case id
 * @param {Object} status - the status
 * @param {String} [reasonForCancellation] - the reason for cancellation
 * @param {String} [reasonForCancellationOther] - other reason for cancellation
 * @param {String} [token] - the authentication token
 * @returns {Promise} - the web service response as Promise
 */
export const addClinicalCase = (fhirBaseUrl, patient, icd10, caseId, status, reasonForCancellation, reasonForCancellationOther, token) => {
  if (!patient || !patient.id || !patient.name) {
    throw new Error("Patient must not be null");
  }

  const episodeOfCareId = "urn:uuid:" + uuid();
  const taskId = "urn:uuid:" + uuid();

  let task = cloneDeep(taskTemplate);
  setAttributesOnTask(task, patient, status, reasonForCancellation, reasonForCancellationOther);
  task.input[0].valueReference.reference = episodeOfCareId;
  task.authoredOn = new Date().toISOString();

  let episodeOfCare = cloneDeep(episodeofCareTemplate);
  setAttributesOnEpisodeOfCare(episodeOfCare, patient, icd10, caseId);

  let transaction = cloneDeep(transactionPostTemplate);
  transaction.entry[0].fullUrl = episodeOfCareId;
  transaction.entry[0].resource = episodeOfCare;
  transaction.entry[1].fullUrl = taskId;
  transaction.entry[1].resource = task;

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

/**
 * Adds a patient to the fhir server.
 *
 * @param {String} fhirBaseUrl - the fhir base url
 * @param {String} id - the patient id
 * @param {String} firstName - the firstname
 * @param {String} lastName - the lastname
 * @param {Date} birthDate - the birthdate
 * @param {String} gender - the gender
 * @param {String} [token] - the authenticatio token
 * @returns {Promise} - the web service response as Promise
 */
export const addPatient = (fhirBaseUrl, id, firstName, lastName, birthDate, gender, token) => {
  if (!fhirBaseUrl || !id || !firstName || !lastName || !birthDate || !gender) {
    throw new Error("Params must not be null");
  }

  let given = firstName.split(" ");
  let patient = cloneDeep(patientTemplate);

  patient.identifier[0].value = id;
  patient.name[0].given = given;
  patient.name[0].family = lastName;
  patient.gender = gender;
  patient.birthDate = birthDate;

  return submitResource(fhirBaseUrl, patient, token);
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
  task.for.reference = `Patient/${patient.id}`;
  task.for.display = getStringFromHumanName(patient.name);
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
const setAttributesOnEpisodeOfCare = (episodeOfCare, patient, icd10, caseId) => {
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

  identifier.value = caseId;
  episodeOfCare.patient.reference = `Patient/${patient.id}`;
  episodeOfCare.patient.display = getStringFromHumanName(patient.name);
  episodeOfCare.diagnosis[0].condition.display = icd10;
  return episodeOfCare;
};
