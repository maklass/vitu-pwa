/**
 * Maps the response of a FHIR search query to the actual FHIR resources.
 *
 * @param {Object} res - the response of a FHIR search query.
 */
export function mapFhirResponse(res) {
  if (!res || !res.data || !res.data.entry) {
    return [];
  }
  return res.data.entry.map(element => element.resource);
}

/**
 * Extracts the name of a patient FHIR resource.
 *
 * @param {Object} patient - the patient as FHIR resource
 */
export function extractName(patient) {
  if (!patient || !patient.name) {
    return "";
  }
  return patient.name.map(name => name.text).join(", ");
}

export function extractGivenName(patient) {
  if (!patient || !patient.name || !patient.name[0]) {
    return "";
  }
  return patient.name[0].given.join(" ");
}

export function extractFamilyName(patient) {
  if (!patient || !patient.name || !patient.name[0]) {
    return "";
  }
  return patient.name[0].family;
}

export function getIdentifierBySystem(identifier, system) {
  if (!identifier || !system) {
    return null;
  }
  return identifier.find(identifier => identifier.system === system);
}

export function getIdentifierValueByIdentifierString(identifierString) {
  if (!identifierString) {
    return null;
  }
  return identifierString.substring(identifierString.indexOf("|") + 1);
}

export function extractCodableConcept(codableConcept) {
  if (!codableConcept) {
    return null;
  } else if (codableConcept.text) {
    return codableConcept.text;
  } else if (codableConcept.coding) {
    return codableConcept.coding
      .map(coding => {
        return coding.display;
      })
      .join(", ");
  } else {
    return codableConcept;
  }
}

/**
 * Returns the first identifier it finds with the given system. If no identifier is found, null is returned.
 *
 * @param {Object} resource - the FHIR resource
 * @param {String} system - the system of the identifier
 */
export function getIdentifierByResourceAndSystem(resource, system) {
  if (!resource || !system) {
    return null;
  }
  return getIdentifierBySystem(resource.identifier, system);
}

export function getIdentifierStringBySystem(identifiers, system) {
  let identifier = getIdentifierBySystem(identifiers, system);
  if (!identifier) {
    return null;
  }
  return identifier.system + "|" + identifier.value;
}

export function getIdentifierValueBySystem(identifiers, system) {
  let identifier = getIdentifierBySystem(identifiers, system);
  if (!identifier) {
    return null;
  }
  return identifier.value;
}

export default {
  mapFhirResponse,
  extractName,
  getIdentifierBySystem,
  getIdentifierByResourceAndSystem,
  getIdentifierStringBySystem,
  getIdentifierValueBySystem
};
