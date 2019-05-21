<template>
  <div v-if="resource">
    <div class="toolbar">
      <b-button :pressed.sync="code" variant="link">
        <span :class="{ pressed: code }">
          <code-tags-icon />
        </span>
      </b-button>
    </div>
    <pre v-highlightjs v-if="code"><code class="code json">{{resource}}</code></pre>
    <div class="resource" v-else>
      <property-cell v-for="(value, key) in resourceComputed" :title="$t(`fhir.${key}`)" :value="value" :key="key" />
    </div>
  </div>
</template>

<script>
import PropertyCell from "@/components/PropertyCell";
import CodeTagsIcon from "vue-material-design-icons/CodeTags";

export default {
  name: "Base",
  props: {
    resource: {
      type: Object
    }
  },
  data() {
    return {
      code: false
    };
  },
  components: {
    PropertyCell,
    CodeTagsIcon
  }
};
</script>

<style lang="scss" scoped>
.resource {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}
.toolbar {
  text-align: right;
}
.code {
  border: 1px solid #dee2e6;
}
.pressed {
  background: #eee;
  border-radius: 30%;
}
</style>
