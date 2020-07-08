<template>
  <v-select class="v-select" v-model="selectedResource" :options="resources" label="selectTitle" @search="update" @input="select" :placeholder="searchInputPlaceholder" :filterable="false">
    <div slot="no-options">{{ $t("noEntriesFound") }}</div>
    <template #search="{attributes, events}">
      <input class="vs__search" :required="!selectedResource && required" v-bind="attributes" v-on="events" />
    </template>
    <template v-slot:option="option">
      <div class="select-option">
        <div>
          {{ option.selectTitle }}
        </div>
        <div>
          <span v-for="(attribute, index) in subtitleAttributes" :key="attribute.value">
            <span v-if="attribute.value && attribute.value !== ''">
              <span>{{ attribute.name }}: </span>
              <span>{{ getAttribute(option, attribute.value, attribute.type) }}</span>
              <span v-if="index < subtitleAttributes.length - 1"> · </span>
            </span>
          </span>
        </div>
      </div>
    </template>
  </v-select>
</template>

<script>
import { getStringFromHumanName } from "@molit/fhir-util";
import { fetchResources, mapFhirData } from "@molit/fhir-api";

import debounce from "debounce";

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
    queryParams: {
      type: Object,
      default() {
        return {};
      }
    },
    searchAttributes: {
      type: Array,
      default() {
        return [
          {
            name: "ID",
            value: "_id"
          }
        ];
      }
    },
    titleAttribute: {
      type: Object,
      default() {
        return {
          value: "id"
        };
      }
    },
    subtitleAttributes: {
      type: Array,
      default() {
        return [];
      }
    },
    token: {
      type: String,
      default: null
    },
    searchInputPlaceholder: {
      type: String,
      default: "Search.."
    },
    searchDebounceTime: {
      type: Number,
      default: 300
    },
    count: {
      type: Number,
      default: 50
    },
    required: {
      type: Boolean,
      default: false
    },
    value: {
      type: Object
    }
  },

  data() {
    return {
      bundle: null,
      searchTerm: null,
      selectedResource: null
    };
  },

  computed: {
    params() {
      let params = {
        ...this.queryParams,
        _count: this.count
      };

      if (this.searchTerm && this.searchAttributes && this.searchAttributes[0]) {
        params[this.searchAttributes[0].value] = this.searchTerm;
      } else if (!this.searchTerm && this.searchAttributes && this.searchAttributes[0]) {
        delete params[this.searchAttributes[0].value];
      }
      return params;
    },

    resources() {
      if (!this.bundle) {
        return [];
      }
      return mapFhirData(this.bundle).map(resource => {
        return { ...resource, selectTitle: this.getAttribute(resource, this.titleAttribute.value, this.titleAttribute.type) };
      });
    }
  },

  methods: {
    bundleUpdated(bundle) {
      this.bundle = bundle;
    },

    setResource(resource) {
      this.selectedResource = resource;
    },

    byString: function(o, s) {
      s = s.replace(/\[(\w+)\]/g, ".$1"); // https://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key
      s = s.replace(/^\./, "");
      var a = s.split(".");
      for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o) {
          o = o[k];
        } else {
          return;
        }
      }
      return o;
    },

    getAttribute(resource, attributeName, attributeType) {
      if (!resource) {
        return "";
      } else if (!attributeName) {
        return resource.id;
      }
      let attribute = this.byString(resource, attributeName);
      if (!attribute) {
        return "-";
      }
      switch (attributeType) {
        case "HumanName":
          return getStringFromHumanName(attribute);
        case "date":
        case "Date":
          return new Date(attribute).toLocaleDateString();
        default:
          return attribute;
      }
    },

    async updateResources(search, loading) {
      this.searchTerm = search;

      try {
        loading(true);
        this.bundle = (await fetchResources(this.fhirBaseUrl, this.resourceName, this.params, this.token)).data;
        loading(false);
      } catch (e) {
        this.$emit("error", e);
        loading(false);
        throw new Error(e, "Could not load FHIR resources.");
      }
    },

    select() {
      this.$emit("update", this.selectedResource);
      this.$emit("input", this.selectedResource);
    },

    error(e) {
      this.$emit("error", e);
    }
  },

  created() {
    if (this.value) {
      this.selectedResource = this.value.name;
    }
    this.update = debounce(this.updateResources, this.searchDebounceTime);
    this.update("", () => {});
  }
};
</script>

<style lang="scss" scoped>
.select-option {
  padding: 0.3rem 0;
}

.v-select {
  width: 100%;
}
</style>
