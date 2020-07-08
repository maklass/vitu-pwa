<template>
  <v-select
    :class="[{ bordered: showBorder }]"
    v-model="selectedResource"
    :options="concepts"
    label="selectTitle"
    @input="select"
    :placeholder="searchInputPlaceholder"
    v-if="concepts"
    :multiple="multiple"
    :title="selectedResource ? selectedResource.selectTitle : ''"
  >
    <div slot="no-options">{{ $t("noEntriesFound") }}</div>
    <template #search="{attributes, events}">
      <input class="vs__search" :required="!selectedResource && required" v-bind="attributes" v-on="events" />
    </template>
    <template #option="option">
      <slot name="option" v-bind="option">
        <div class="select-option">
          <div class="option-title" :title="option.selectTitle">{{ option.selectTitle }}</div>
          <div class="option-subtitle" :title="option.subtitle" v-if="option.subtitle">{{ option.subtitle }}</div>
        </div>
      </slot>
    </template>
  </v-select>
</template>

<script>
import { clone } from "lodash";
import { fetchByUrl, mapFhirResponse, fetchResources, fetchValueSetConceptByUrl } from "@molit/fhir-api";

export default {
  props: {
    resourceName: {
      type: String,
      required: true
    },
    fhirBaseUrl: {
      type: String,
      required: true
    },
    resource: {
      type: Object
    },
    resourceReference: {
      type: String
    },
    resourceId: {
      type: String
    },
    url: {
      type: String
    },
    token: {
      type: String,
      default: null
    },
    searchInputPlaceholder: {
      type: String,
      default: "Search.."
    },
    showCode: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    value: {
      type: Object
    },
    showBorder: {
      type: Boolean,
      default: false
    },
    sort: {
      type: Boolean,
      default: false
    },
    sortFunction: {
      type: Function,
      default: (c1, c2) => {
        if (!c1.selectTitle || !c2.selectTitle) {
          return 0;
        }
        return c1.selectTitle.localeCompare(c2.selectTitle);
      }
    },
    mapToConceptMap: {
      type: Boolean,
      default: false
    },
    conceptMapUrl: {
      type: String,
      default: null
    },
    multiple: {
      type: Boolean,
      default: false
    },
    expandValueSet: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      data: null,
      concepts: null,
      conceptMap: null,
      searchTerm: null,
      selectedResource: null
    };
  },

  methods: {
    select() {
      if (this.selectedResource) {
        let clonedSelectedResource = clone(this.selectedResource);
        delete clonedSelectedResource.selectTitle;
        delete clonedSelectedResource.subtitle;
        this.$emit("update", clonedSelectedResource);
        this.$emit("input", clonedSelectedResource);
      }
    },

    error(e) {
      this.$emit("error", e);
    },

    buildTitle(option) {
      let title = "";
      if (this.showCode) {
        title += option.code + " - ";
      }

      if (option.display.includes("|")) {
        title += option.display.split("|")[1];
      } else {
        title += option.display;
      }

      if (this.mapToConceptMap && this.conceptMap) {
        let mappedConcept = this.conceptMap.group[0].element.find(concept => concept.code === option.code);

        if (mappedConcept) {
          title = `${title} (${mappedConcept.target.reduce((acc, current, index) => acc + (index !== 0 ? ", " : "") + current.display, "")})`;
        }
      }

      return title;
    },

    buildSubtitle(option) {
      if (option.display.includes("|")) {
        return option.display.split("|")[0];
      }
    }
  },

  async created() {
    try {
      if (this.value) {
        this.selectedResource = this.value;
        this.selectedResource.selectTitle = this.buildTitle(this.selectedResource);
      }

      let id = null;
      if (this.resource) {
        this.data = this.resource;
      } else if (this.resourceReference) {
        let split = this.resourceReference.split("/");
        id = split[1];
      } else if (this.resourceId) {
        id = this.resourceId;
      }

      if (id) {
        let url = this.fhirBaseUrl + "/" + this.resourceName + "/" + id;
        if (this.resourceName === "ValueSet") {
          url += "/$expand";
        }
        let response = await fetchByUrl(url, null, this.token);
        this.data = response.data;
      } else if (this.url && this.resourceName === "ValueSet") {
        if (this.expandValueSet) {
          let url = this.fhirBaseUrl + "/" + this.resourceName + "/$expand?url=" + this.url;
          let response = await fetchByUrl(url, null, this.token);
          this.data = response.data;
        } else {
          this.concepts = await fetchValueSetConceptByUrl(this.fhirBaseUrl, this.token, this.url);
        }
      } else if (this.url && this.resourceName === "CodeSystem") {
        const response = await fetchResources(this.fhirBaseUrl, this.resourceName, { url: this.url }, this.token);
        this.data = mapFhirResponse(response)[0];
      }

      if (this.resourceName && this.resourceName === "ValueSet") {
        if (this.expandValueSet) {
          this.concepts = this.data.expansion.contains;
        }
      } else if (this.resourceName && this.resourceName === "CodeSystem") {
        this.concepts = this.data.concept;
      }

      if (this.mapToConceptMap && this.conceptMapUrl) {
        this.conceptMap = mapFhirResponse(await fetchResources(this.fhirBaseUrl, "ConceptMap", { url: this.conceptMapUrl }, this.token))[0];
        if (!this.conceptMap) {
          throw new Error(`ConceptMap with url attribute '${this.conceptMapUrl}' could not be found.`);
        }
      }

      this.concepts = this.concepts.map(option => {
        option.selectTitle = this.buildTitle(option);
        option.subtitle = this.buildSubtitle(option);
        return option;
      });

      if (this.sort) {
        this.concepts.sort(this.sortFunction);
      }
    } catch (e) {
      this.error(e);
    }
  }
};
</script>

<style lang="scss">
.vs__selected-options {
  overflow: hidden;
  white-space: nowrap;
}

.vs__selected {
  text-overflow: ellipsis;
  overflow: hidden;
  display: block;
}

.bordered .vs__dropdown-menu li {
  padding: 0;
}
</style>

<style lang="scss" scoped>
.option-title {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: pre-wrap;
}

.option-subtitle {
  font-style: italic;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: pre-wrap;
}

.bordered .select-option {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding: 0.45rem 0.8rem;
}
</style>
