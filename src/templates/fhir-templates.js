export const compositionTemplate = {
  resourceType: "Composition",
  status: "preliminary",

  type: {
    coding: [
      {
        system: null,
        code: null,
        display: null
      }
    ]
  },
  date: null,
  author: [{ reference: null }],
  title: null,
  subject: {
    reference: null
  },
  encounter: {
    reference: null
  },
  section: []
};

export const listTemplate = {
  resourceType: "List",
  status: null,
  mode: null,
  code: {
    coding: [
      {
        system: null,
        code: null,
        display: null
      }
    ]
  },
  subject: {
    reference: null
  },
  encounter: {
    reference: null
  },
  source: {
    reference: null
  },
  entry: [
    {
      item: {
        reference: null
      }
    }
  ]
};

export const encounterTemplate = {
  resourceType: "Encounter",
  status: null,
  class: {
    system: null,
    code: null,
    display: null
  },
  type: {
    coding: [
      {
        system: null,
        code: null,
        display: null
      }
    ]
  },
  subject: {
    reference: null
  },
  partOf: {
    reference: null
  }
};

export const commentTemplate = {
  resourceType: "Observation",
  extension: [
    {
      url: "http://hl7.org/fhir/StructureDefinition/workflow-episodeOfCare",
      valueReference: {
        reference: null
      }
    }
  ],
  status: "final",
  code: {
    coding: [
      {
        system: "http://molit.eu/fhir/CodeSystem/vitu-observation-note-types",
        code: "tumor-board-preparation",
        display: "Tumorboard Vorbereitung"
      },
      {
        system: "http://ncit.nci.nih.gov",
        code: "C42619",
        display: "Note"
      }
    ],
    text: "Vorbereitungsnotiz"
  },
  subject: {
    reference: null
  },
  performer: [
    {
      display: null
    }
  ],
  effectiveDateTime: null,
  valueString: null
};

export const observationTemplate = {
  resourceType: "Observation",
  status: null,
  code: {
    coding: [
      {
        system: null,
        code: null,
        display: null
      }
    ],
    text: null
  },
  subject: {
    reference: null
  },
  encounter: {
    reference: null
  },
  performer: [
    {
      reference: null
    }
  ],
  effectiveDateTime: null,
  valueCodeableConcept: {},
  valueString: null
};

export const valueCodeableConceptTemplate = {
  coding: [
    {
      system: null,
      code: null,
      display: null
    }
  ]
};

export const conditionTemplate = {
  resourceType: "Condition",
  clinicalStatus: {
    coding: [
      {
        system: null,
        code: null
      }
    ]
  },
  code: {
    coding: [
      {
        system: null,
        code: null,
        display: null
      }
    ]
  },
  subject: {},
  onsetDateTime: null,
  note: [
    {
      text: null
    }
  ]
};

export const procedureTemplate = {
  resourceType: "Procedure",
  extension: [
    {
      url: null,
      valueReference: {
        reference: null
      }
    }
  ],
  status: null,
  category: {
    coding: [
      {
        system: null,
        code: null,
        display: null
      }
    ]
  },
  code: {
    coding: [
      {
        system: null,
        code: null,
        display: null
      }
    ]
  },
  subject: {
    reference: null
  },
  performedDateTime: null,
  performedPeriod: {
    start: null,
    end: null
  },
  reasonReference: [
    {
      reference: null
    }
  ]
};

export const medicationStatementTemplate = {
  resourceType: "MedicationStatement",
  status: null,
  medicationCodeableConcept: {
    coding: [
      {
        system: null,
        code: null,
        display: null
      }
    ]
  },
  subject: {
    reference: null
  },
  context: {
    reference: null
  },
  effectivePeriod: {
    start: null,
    end: null
  },
  reasonReference: [
    {
      reference: null
    }
  ]
};

export const documentReferenceTemplate = {
  resourceType: "DocumentReference",
  status: null,
  type: {
    coding: [
      {
        system: null,
        code: null,
        display: null
      }
    ]
  },
  subject: {
    reference: null
  },
  author: {
    reference: null
  },
  content: [
    {
      attachment: {
        id: null,
        contentType: null,
        url: null
      }
    }
  ]
};

export const consentTemplate = {
  resourceType: "Consent",
  status: "",
  scope: {
    coding: [
      {
        system: null,
        code: null,
        display: null
      }
    ]
  },
  category: {
    coding: [
      {
        system: null,
        code: null,
        display: null
      }
    ]
  },
  patient: {
    reference: null
  },
  dateTime: null,
  policyRule: {
    coding: [
      {
        system: null,
        code: null,
        display: null
      }
    ]
  }
};

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
        system: "http://molit.eu/fhir/vitu/ValueSet/vitu-workinglist",
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
  identifier: [],
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
  identifier: [],
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

export const binaryTemplate = {
  resourceType: "Binary",
  contentType: null,
  data: null
};

export const documentReference = {
  resourceType: "DocumentReference",
  status: "current",
  type: {
    coding: [
      {
        system: null,
        code: null,
        display: null
      }
    ]
  },
  subject: {
    reference: null
  },
  content: [
    {
      attachment: {
        id: null,
        contentType: null,
        url: null
      }
    }
  ]
};

export const transactionPostCompostionTemplate = {
  resourceType: "Bundle",
  type: "transaction",
  entry: []
};

export const transactionTemplate = {
  resourceType: "Bundle",
  type: "transaction",
  entry: []
};

export const transactionPostPatientTemplate = {
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
        url: "Patient"
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

export const transactionPutPatientTemplate = {
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
        url: "Patient/"
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

export const organizationTemplate = {
  resourceType: "Organization",
  name: null,
  active: true,
  partOf: null,
  contact: [],
  address: []
};
