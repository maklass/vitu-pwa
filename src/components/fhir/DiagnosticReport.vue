<script>
import { extractCodableConcept } from "@/util/fhir-util";
import Base from "./Base";

export default {
  name: "DiagnosticReport",
  extends: Base,
  computed: {
    resourceComputed() {
      let effectiveDateTime;
      if (this.resource.effectiveDateTime) {
        effectiveDateTime = this.$d(new Date(this.resource.effectiveDateTime));
      }

      let result;
      if (this.resource.result) {
        result = this.resource.result.map(result => result.display).join("\n\n");
      }

      return {
        effectiveDateTime,
        status: this.resource.status,
        category: extractCodableConcept(this.resource.category),
        result
      };
    }
  }
};
</script>
