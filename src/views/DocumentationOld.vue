<template>
  <div>
    <b-container class="documentation">
      <div class="card">
        <div class="card-body">
          <fieldset>
            <legend>Protokoll</legend>
            <p>
              Im <strong>Modul Protokoll</strong> können die <strong>Empfehlungen eines Tumorboards strukturiert erfasst</strong> werden. Hierzu können bereits vorhandene strukturierte Daten (Patientenstammdaten, Therapieverlauf,
              Therapieplan, Befunddaten, etc.) aus z.B. dem KIS importiert werden und müssen nicht erneut manuell eingetragen werden. Das Protokoll kann bereits vor der Tumorkonferenz mit strukturiert vorliegenden Daten vorausgefüllt
              werden, so dass parallel zur Videokonferenz das Konferenzprotokoll vervollständigt werden kann.
            </p>
            <p>
              Eine <strong>zusätzliche Exportoption</strong> als .PDF der über die Eingabemaske bereits strukturiert abgelegten Daten ermöglicht eine <strong>zeitnahe Realisierung der Unterschrift</strong> durch den verantwortlichen Arzt
              und bei Bedarf eine Ablage im Klinikinformationssystem.
            </p>
            <p>Bereits strukturiert erfasste Protokolle werden in einer <strong>klinikinternen Datenbank</strong> gespeichert und können in der Vorbereitung für weitere Fälle bei entsprechender Freigabe abgefragt werden.</p>
            <p>
              Die Eingabemaske richtet sich nach den Ansprüchen des jeweiligen Tumorboards. Das MOLIT Institut für personalisierte Medizin arbeitet derzeit an einer standardisierten Eingabemaske für Molekulare Tumorboards. Bei Interesse
              nehmen Sie gern <a href="https://molit.eu/projekte/vitu/" target="_blank">Kontakt</a> mit uns auf.
            </p>

            <!-- <span class="sub-legend">Potentielle Empfehlung weiterer Untersuchungen:</span>
            <div class="form-group">
              <div class="form-check">
                <input class="form-check-input" type="radio" v-model="form.additionalDiagnosticsRequired" name="additionalDiagnosticsRequired" id="additionalDiagnosticsRequiredNo" value="false" />
                <label class="form-check-label" for="additionalDiagnosticsRequiredNo">
                  Keine weiteren Untersuchungen für eine abschließende potentielle Therapieempfehlung notwendig.
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" v-model="form.additionalDiagnosticsRequired" name="additionalDiagnosticsRequired" id="additionalDiagnosticsRequiredYes" value="true" />
                <label class="form-check-label" for="additionalDiagnosticsRequiredYes">
                  Weitere Untersuchungen zur Komplettierung des Gesamtbildes werden empfohlen.
                </label>
              </div>
            </div>
            <div class="form-group">
              <label for="diagnostic-suggestion">Folgende Untersuchungen werden empfohlen:</label>
              <textarea
                :disabled="form.additionalDiagnosticsRequired === 'false'"
                class="form-control"
                id="diagnostic-suggestion"
                v-model="form.diagnosticSuggestion"
                rows="5"
                placeholder="Detaillierte Angaben zu potentiellen weiteren Untersuchungen. "
              ></textarea>
            </div>

            <span class="sub-legend">Ergebnisse der ergänzend angeforderten Untersuchungen:</span>

            <div class="form-row">
              <div class="col">
                <label>Target</label>
              </div>
              <div class="col">
                <label>Analysemethode</label>
              </div>
              <div class="col">
                <label>Befunddatum</label>
              </div>
              <div class="col">
                <label>Diagnostiklabor</label>
              </div>
              <div class="col">
                <label>Befundergebnis</label>
              </div>
              <div class="col">
                <label>Pot. Therapieoption</label>
              </div>
              <div class="col-auto">
                <button style="visibility: hidden" type="button" class="btn btn-outline-danger form-control">
                  <delete-icon />
                </button>
              </div>
            </div>

            <div class="form-row" v-for="(additionalDiagnostic, index) in form.additionalDiagnostics" :key="index">
              <div class="col form-group">
                <input type="text" class="form-control" v-model="additionalDiagnostic.target" placeholder="z.B. p16, RB1, BRCA1" :disabled="form.additionalDiagnosticsRequired === 'false'" />
              </div>
              <div class="col form-group">
                <input type="text" class="form-control" v-model="additionalDiagnostic.method" placeholder="z.B. PCR, Panel, IHC" :disabled="form.additionalDiagnosticsRequired === 'false'" />
              </div>
              <div class="col form-group">
                <input type="date" class="form-control" v-model="additionalDiagnostic.date" placeholder="Befunddatum" :disabled="form.additionalDiagnosticsRequired === 'false'" />
              </div>
              <div class="col form-group">
                <input type="text" class="form-control" v-model="additionalDiagnostic.lab" placeholder="Durchgeführt von " :disabled="form.additionalDiagnosticsRequired === 'false'" />
              </div>
              <div class="col form-group">
                <input type="text" class="form-control" v-model="additionalDiagnostic.result" placeholder="Bewertung" :disabled="form.additionalDiagnosticsRequired === 'false'" />
              </div>
              <div class="col form-group">
                <input type="text" class="form-control" v-model="additionalDiagnostic.therapyOption" placeholder="Pot. Therapieoption" :disabled="form.additionalDiagnosticsRequired === 'false'" />
              </div>
              <div class="col-auto form-group">
                <button type="button" v-on:click="removeAdditionalDiagnostic(index)" class="btn btn-outline-danger form-control" :disabled="form.additionalDiagnosticsRequired === 'false'">
                  <delete-icon />
                </button>
              </div>
            </div>

            <div class="form-row">
              <div class="col"></div>
              <div class="col-auto form-group">
                <button type="button" class="btn btn-outline-success form-control" v-on:click="addAdditionalDiagnostic" :disabled="form.additionalDiagnosticsRequired === 'false'">
                  <plus-icon></plus-icon>
                </button>
              </div>
            </div>

            <span class="sub-legend"> Wiedervorstellung - Ist eine Wiedervorstellung im Tumorboard empfohlen?</span>
            <div class="form-group">
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="radio"
                  name="Reassessment"
                  id="Reassessment-yes"
                  v-model="form.Reassessment"
                  value="Reassessment-yes"
                  :disabled="form.additionalDiagnosticsRequired === 'false'"
                />
                <label class="form-check-label" for="again-yes">
                  Ja
                </label>
              </div>
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="radio"
                  name="Reassessment"
                  id="Reassessment-no"
                  v-model="form.Reassessment"
                  value="Reassessment-yes"
                  :disabled="form.additionalDiagnosticsRequired === 'false'"
                />
                <label class="form-check-label" for="again-no">
                  Nein
                </label>
              </div>
            </div>

            <span class="sub-legend hidden">Potentielle Therapieempfehlung:</span>
            <div class="form-group hidden" id="potential therapy suggestion">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="StandardTherapy" value="StandardTherapy" v-model="form.potentialTherapySuggestion" />
                <label class="form-check-label" for="StandardTherapy">Therapieempfehlung entsprechend der Leitlinien.</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="TherapyByStudy" value="TherapyByStudy" v-model="form.potentialTherapySuggestion" />
                <label class="form-check-label" for="TherapyByStudy">Empfehlung zur Teilnahme an einer klinische Studie.</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="TargetTherapy" value="TargetTherapy" v-model="form.potentialTherapySuggestion" />
                <label class="form-check-label" for="TargetTherapy">Individualisierte zielgerichtete Therapieempfehlung aufgrund molekularer Diagnostik und Analyse.</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="StratifiedTherapy" value="StratifiedTherapy" v-model="form.potentialTherapySuggestion" />
                <label class="form-check-label" for="StratifiedTherapy">Individualisierte stratifizierte Therapieempfehlung aufgrund molekularer Diagnostik und Analyse.</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="CompassionateUse" value="CompassionateUse" v-model="form.potentialTherapySuggestion" />
                <label class="form-check-label" for="CompassionateUse">Individueller Heilversuch aufgrund molekularer Diagnostik und Analyse.</label>
              </div>
            </div>

            <span class="sub-legend hidden">Kostenübernahme - Ist ein Antrag im off-lable-use erforderlich?</span>
            <div class="form-group hidden">
              <div class="form-check">
                <input class="form-check-input" type="radio" name="cost-acquisition" id="cost-acquisition-yes" value="Yes" v-model="form.costAcquisition" />
                <label class="form-check-label" for="cost-acquisition-yes">
                  Ja
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="cost-acquisition" id="cost-acquisition-no" value="No" v-model="form.costAcquisition" />
                <label class="form-check-label" for="cost-acquisition-no">
                  Nein
                </label>
              </div>
            </div>

            <span class="sub-legend" style="margin-bottom: 0.6rem; display: block">Therapieempfehlung </span>
            <div v-for="(suggestion, index) in form.therapyLines" style="margin-bottom: 1.2rem" class="indent" :key="index">
              <div style="display: flex">
                <div class="sub-legend" style="flex: 1">Therapielinie</div>
                <button class="btn btn-outline-danger" @click="removeTherapyLine(index)">
                  <delete-icon />
                </button>
              </div>

              <div class="form-group">
                <input type="text" class="form-control" v-model="suggestion.name" />
              </div>

              <div v-for="(treatment, index) in suggestion.treatments" class="indent" :key="index">
                <div style="display: flex">
                  <div class="sub-legend" style="flex: 1">{{ index + 1 }}. Potentielle Therapieempfehlung</div>
                  <button class="btn btn-outline-danger" @click="removeTreatment(suggestion, index)">
                    <delete-icon />
                  </button>
                </div>

                <div class="form-group">
                  <label>Art der Therapieempfehlung</label>
                  <select class="form-control" v-model="treatment.category">
                    <option value="null" selected disabled>Bitte auswählen</option>
                    <option :value="category.identifier" v-for="category in therapyCategories" :key="category.identifier">{{ category.name }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Therapie mit</label>
                  <input v-model="treatment.treatment" class="form-control" placeholder="Therapie mit" />
                </div>

                <div class="form-row">
                  <div class="form-group col">
                    <label
                      >Therapieempfehlung nach
                      <a href="#" data-toggle="modal" data-target="#modal-evidence-levels">Level</a>
                    </label>
                    <select class="form-control" v-model="treatment.level">
                      <option value="null" selected disabled>Bitte auswählen</option>
                      <option :value="level.identifier" v-for="level in levels" :key="level.identifier">{{ level.name }}</option>
                    </select>
                  </div>
                  <div class="form-group col">
                    <label>Antrag im off-label-use erforderlich?</label>
                    <select class="form-control" v-model="treatment.costAcquisition">
                      <option value="null" selected disabled>Bitte auswählen</option>
                      <option :value="true">Ja</option>
                      <option :value="false">Nein</option>
                    </select>
                  </div>
                </div>
                <div class="form-group">
                  <label>Entscheidungsgrundlage molekulare Diagnostik</label>
                  <v-select multiple v-model="treatment.reasonReference" :options="selectableVariants" placeholder=""> </v-select>
                </div>
                <div class="form-group">
                  <label>Sonstige Entscheidungsgrundlage</label>
                  <input type="text" class="form-control" v-model="treatment.reason" />
                </div>

                <hr />
              </div>
              <button class="btn btn-outline-info" @click="addTreatment(suggestion)">Therapieempfehlung hinzufügen</button>
              <hr />
            </div>

            <button class="btn btn-outline-primary" style="margin-bottom: 2rem" @click="addTherapyLine">Therapielinie hinzufügen</button>

            <div class="form-group">
              <label for="therapy-suggestion">Therapieempfehlung</label>
              <textarea class="form-control" id="therapy-suggestion" v-model="form.therapySuggestion" rows="10" placeholder="Bitte ausfüllen"></textarea>
            </div>

            <span class="sub-legend hidden"
              >Einstufung der Therapieempfehlung nach
              <a href="#" data-toggle="modal" data-target="#modal-evidence-levels">Level</a>
            </span>

            <div class="form-group hidden">
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="checkbox" value="" id="level-1a" />
                <label
                  class="form-check-label"
                  data-toggle="tooltip"
                  for="level-1a"
                  title="Level 1A: Das Medikament ist für die vorliegende Tumorentität im Zusammenhang mit dem spezifischen Biomarker zugelassen."
                >
                  Level 1A
                </label>
              </div>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="checkbox" value="" id="level-1b" />
                <label
                  class="form-check-label"
                  data-toggle="tooltip"
                  for="level-1b"
                  title="Level 1B: Der prädiktive Wert des Biomarkers oder die klinische Wirksamkeit des korrespondierenden Medikaments in einer molekular stratifizierten Kohorte wurde in einer prospektiven Studie mit adäquater Power oder einer Meta-Analyse nachgewiesen."
                >
                  Level 1B
                </label>
              </div>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="checkbox" value="" id="level-2a" />
                <label
                  class="form-check-label"
                  data-toggle="tooltip"
                  for="level-2a"
                  title="Level 2A: Der prädiktive Wert des Biomarkers oder die klinische Wirksamkeit des Medikaments in einer molekular stratifizierten Kohorte wurde in einer prospektiven Studie mit Biomarkern als sekundärem Ziel oder in einer retrospektiven Kohorten- oder Fall-Kontroll-Studie mit adäquater Power im gleichen Tumortyp nachgewiesen."
                >
                  Level 2A
                </label>
              </div>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="checkbox" value="" id="level-2b" />
                <label
                  class="form-check-label"
                  data-toggle="tooltip"
                  for="level-2b"
                  title="Level 2B: Der prädiktive Wert des Biomarkers oder die klinische Wirksamkeit des Medikaments in einer molekular stratifizierten Kohorte wurde anhand klinischer Daten bei einer anderen Tumorentität nachgewiesen.."
                >
                  Level 2B
                </label>
              </div>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="checkbox" value="" id="level-2c" />
                <label
                  class="form-check-label"
                  data-toggle="tooltip"
                  for="level-2c"
                  title="Level 2C: Eine Fallstudie oder ein einzelner Fall mit unerwartetem Therapieansprechen deuten an, dass der Biomarker mit einem Ansprechen auf das Medikament assoziiert ist. Der Befund wird durch eine wissenschaftliche Rationale unterstützt."
                >
                  Level 2C
                </label>
              </div>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="checkbox" value="" id="level-3" />
                <label
                  class="form-check-label"
                  data-toggle="tooltip"
                  for="level-3"
                  title="Level 3: Präklinische Daten (in-vitro- oder in-vivo-Modelle und funktionelle Genomik) belegen den prädiktiven Wert des Biomarkers für das Ansprechen von Tumorzellen auf das Medikament."
                >
                  Level 3
                </label>
              </div>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="checkbox" value="" id="level-4" />
                <label
                  class="form-check-label"
                  data-toggle="tooltip"
                  for="level-4"
                  title="Level 4: Es existiert eine biologische Rationale, aufgrund der das Medikament mit dem alterierten Signalweg oder dem relevanten Basket in Verbindung steht. Es existieren keine publizierten klinischen oder präklinischen Daten hinsichtlich des Ansprechens auf das Medikament."
                >
                  Level 4
                </label>
              </div>
            </div>

            <div class="form-group">
              <label for="other">Sonstiges</label>
              <textarea class="form-control" id="other" v-model="form.other" rows="7" placeholder="Ergänzungen"> </textarea>
            </div>

          <button type="submit" class="btn btn-primary">Absenden</button> -->
          </fieldset>
        </div>
      </div>
    </b-container>
  </div>
</template>

<script>
const defaults = {
  diagnostic: {
    target: null,
    method: null,
    date: null,
    lab: null,
    result: null,
    therapyOption: null
  },
  therapy: {
    start: null,
    treatment: null,
    status: null
  },
  variant: {
    category: null,
    aberration: null,
    gene: null,
    kind: null,
    functionalClass: null,
    variant: null,
    effect: null,
    naf: null
  },
  therapyLine: {
    name: "Therapielinie",
    treatments: [
      {
        category: null,
        treatment: null,
        level: null,
        costAcquisition: false,
        reasonReference: [],
        reason: null
      }
    ]
  },
  treatment: {
    category: null,
    treatment: null,
    level: null,
    costAcquisition: false,
    reasonReference: [],
    reason: null
  }
};

import Navbar from "@/components/Navbar";
import _ from "lodash";
import PlusIcon from "vue-material-design-icons/Plus";
import DeleteIcon from "vue-material-design-icons/Delete";

export default {
  components: {
    Navbar,
    PlusIcon,
    DeleteIcon
  },

  methods: {
    addExistingDiagnostic: function() {
      this.form.existingDiagnostics.push(_.cloneDeep(this.defaults.diagnostic));
    },
    removeExistingDiagnostic: function(index) {
      if (this.form.existingDiagnostics.length < 2) {
        alert("Das Löschen Elements ist nicht möglich.");
        return;
      }
      this.form.existingDiagnostics.splice(index, 1);
    },
    addAdditionalDiagnostic: function() {
      this.form.additionalDiagnostics.push(_.cloneDeep(this.defaults.diagnostic));
    },
    removeAdditionalDiagnostic: function(index) {
      if (this.form.additionalDiagnostics.length < 2) {
        alert("Das Löschen Elements ist nicht möglich.");
        return;
      }
      this.form.additionalDiagnostics.splice(index, 1);
    },
    addTherapy: function() {
      this.form.therapies.push(_.cloneDeep(this.defaults.therapy));
    },
    removeTherapy: function(index) {
      if (this.form.therapies.length < 2) {
        alert("Das Löschen Elements ist nicht möglich.");
        return;
      }
      this.form.therapies.splice(index, 1);
    },
    addVariant: function() {
      this.form.variants.push(_.cloneDeep(this.defaults.variant));
    },
    removeVariant: function(index) {
      if (this.form.variants.length < 2) {
        alert("Das Löschen des Elements ist nicht möglich.");
        return;
      }
      this.form.variants.splice(index, 1);
    },
    addTherapyLine: function() {
      this.form.therapyLines.push(_.cloneDeep(this.defaults.therapyLine));
    },
    removeTherapyLine: function(index) {
      if (this.form.therapyLines.length < 2) {
        alert("Das Löschen des Elements ist nicht möglich.");
        return;
      }
      this.form.therapyLines.splice(index, 1);
    },
    addTreatment: function(therapyLine) {
      therapyLine.treatments.push(_.cloneDeep(this.defaults.treatment));
    },
    removeTreatment: function(therapyLine, index) {
      if (therapyLine.treatments.length < 2) {
        alert("Das Löschen des Elements ist nicht möglich.");
        return;
      }
      therapyLine.treatments.splice(index, 1);
    }
  },

  data() {
    return {
      defaults: defaults,
      therapyCategories: [
        {
          name: "Therapieempfehlung entsprechend der Leitlinien.",
          identifier: "standard"
        },
        {
          name: "Empfehlung zur Teilnahme an einer klinische Studie.",
          identifier: "study"
        },
        {
          name: "Individualisierte zielgerichtete Therapieempfehlung aufgrund molekularer Diagnostik und Analyse.",
          identifier: "individual targeted therapy"
        },
        {
          name: "Individualisierte stratifizierte Therapieempfehlung aufgrund molekularer Diagnostik und Analyse.",
          identifier: "individual stratified therapy"
        },
        {
          name: "Individueller Heilversuch aufgrund molekularer Diagnostik und Analyse.",
          identifier: "compassionate use"
        }
      ],
      levels: [
        {
          name: "Level 1A",
          identifier: "1A",
          description: ""
        },
        {
          name: "Level 1B",
          identifier: "1B",
          description: ""
        },
        {
          name: "Level 2A",
          identifier: "2A",
          description: ""
        },
        {
          name: "Level 2B",
          identifier: "2B",
          description: ""
        },
        {
          name: "Level 2C",
          identifier: "2C",
          description: ""
        },
        {
          name: "Level 3",
          identifier: "3",
          description: ""
        },
        {
          name: "Level 4",
          identifier: "4",
          description: ""
        }
      ],
      form: {
        conferenceDate: null,
        selectedOncologists: null,
        selectedHumanGeneticists: null,
        selectedStudies: null,
        selectedBiologists: null,
        selectedPathologists: null,
        selectedGynecologist: null,
        guests: null,
        patient: {
          firstName: null,
          lastName: null
        },
        existingDiagnostics: [_.cloneDeep(defaults.diagnostic)],
        additionalDiagnostics: [_.cloneDeep(defaults.diagnostic)],
        therapies: [_.cloneDeep(defaults.therapy)],
        // variants: [
        //     _.cloneDeep(defaults.variant)
        // ],
        variants: [
          {
            category: "Passenger-Mutation",
            aberration: "Genmutation",
            gene: "BRAF",
            kind: "Somatische Genmutation",
            functionalClass: "missense",
            variant: "CCCCC",
            effect: "wahrscheinlich aktivierend",
            naf: "0.3"
          },
          {
            category: "Treibermutation",
            aberration: "Chromosomenaberration",
            gene: "BRAF",
            kind: "Keimbahn Genmutation",
            functionalClass: "synonymous",
            variant: "EEEEEE",
            effect: "aktivierend",
            naf: "0.23"
          }
        ],
        additionalDiagnosticsRequired: "false",
        potentialTherapySuggestion: [],
        specimen: {
          material: []
        },
        therapyLines: [
          {
            name: "Therapielinie 1",
            treatments: [
              {
                category: "standard",
                treatment: "Docetaxel mono",
                level: "1A",
                costAcquisition: false,
                reasonReference: [],
                reason: ""
              }
              // ,
              // {
              //     category: "standard",
              //     treatment: "Docetaxel mono + Cisplatin",
              //     level: "1B",
              //     costAcquisition: false,
              //     reasonReference: [],
              //     reason: ""
              // }
            ]
          }
          // ,
          // {
          //     name: "Therapielinie 2",
          //     treatments: [
          //         {
          //             category: "individual stratified therapy",
          //             treatment: "Cabazitaxel + Carboplatin",
          //             level: "1B",
          //             costAcquisition: false,
          //             reasonReference: [],
          //             reason: ""
          //         },
          //         {
          //             category: "individual stratified therapy",
          //             treatment: "Etoposid + Carboplatin",
          //             level: "1B",
          //             costAcquisition: false,
          //             reasonReference: [],
          //             reason: ""
          //         }
          //     ]
          // },
          // {
          //     name: "Therapielinie 3",
          //     treatments: [
          //         {
          //             category: "individual targeted therapy",
          //             treatment: "Nivoparip",
          //             level: "2A",
          //             costAcquisition: true,
          //             reasonReference: [],
          //             reason: ""
          //         }
          //     ]
          // }
        ]
      }
    };
  }
};
</script>

<style lang="scss" scoped>
.documentation {
  padding-top: 15px;
  padding-bottom: 15px;
  .card {
    background: white;
  }
}
</style>
