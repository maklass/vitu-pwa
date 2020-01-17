export const taskTemplate = {
  resourceType: "Task",
  status: "in-progress",
  for: {
    reference: null,
    display: null
  },
  input: [
    {
      valueReference: {
        reference: null
      }
    }
  ],
  code: {
    coding: [
      {
        system: "http://molit.eu/fhir/NamingSystem/vitu-task",
        code: "mtb-task",
        display: "MTB Task"
      }
    ],
    text: "MTB Task"
  },
  businessStatus: {
    coding: [
      {
        system: "http://molit.eu/fhir/ValueSet/vitu-workinglist",
        code: null,
        display: null
      }
    ],
    text: null
  }
};

export const reasonCancelledExtension = {
  url: "http://molit.eu/fhir/StructureDefinition/reason-cancelled",
  extension: [
    {
      url: "codedReason",
      valueCodeableConcept: {
        coding: [
          {
            system: "http://molit.eu/fhir/CodeSystem/tumorboard-abbruchgrund",
            code: null
          }
        ]
      }
    },
    {
      url: "otherReason",
      valueString: null
    }
  ]
};

export const patientTemplate = {
  resourceType: "Patient",
  identifier: [
    {
      system: "http://molit.eu/fhir/NamingSystem/generic-vitu-patient",
      value: null
    }
  ],
  active: true,
  name: [
    {
      use: "official",
      family: null,
      given: []
    }
  ],
  gender: null,
  birthDate: null
};

export const episodeofCareTemplate = {
  resourceType: "EpisodeOfCare",
  identifier: [
    {
      system: "http://molit.eu/fhir/NamingSystem/generic-vitu-episode-of-care",
      value: null
    }
  ],
  patient: {
    reference: null,
    display: null
  },
  diagnosis: [
    {
      condition: {
        display: null
      }
    }
  ]
};

export const transactionPostTemplate = {
  resourceType: "Bundle",
  type: "transaction",
  entry: [
    {
      fullUrl: null,
      resource: null,
      request: {
        method: "POST",
        url: "EpisodeOfCare"
      }
    },
    {
      fullUrl: null,
      resource: null,
      request: {
        method: "POST",
        url: "Task"
      }
    }
  ]
};

export const transactionDeleteTemplate = {
  resourceType: "Bundle",
  type: "transaction",
  entry: [
    {
      request: {
        method: "DELETE",
        url: "EpisodeOfCare/"
      }
    },
    {
      request: {
        method: "DELETE",
        url: "Task/"
      }
    }
  ]
};

export const transactionPutTemplate = {
  resourceType: "Bundle",
  type: "transaction",
  entry: [
    {
      resource: null,
      request: {
        method: "PUT",
        url: "EpisodeOfCare/"
      }
    },
    {
      resource: null,
      request: {
        method: "PUT",
        url: "Task/"
      }
    }
  ]
};

export const statusTemplate = {
  extension: [
    {
      url: "http://hl7.org/fhir/StructureDefinition/ordinalValue",
      valueDecimal: null
    }
  ],
  code: null,
  display: null
};
