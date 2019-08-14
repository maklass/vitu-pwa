<script>
import { extractCodableConcept } from "@/util/fhir-util";
import Base from "./Base";

export default {
  name: "Condition",
  extends: Base,
  computed: {
    resourceComputed() {
      let assertedDate;
      if (this.resource.assertedDate) {
        assertedDate = this.$d(new Date(this.resource.assertedDate));
      }

      return {
        assertedDate,
        clinicalStatus: this.resource.clinicalStatus,
        category: extractCodableConcept(this.resource.category),
        code: extractCodableConcept(this.resource.code)
      };
    }
  }
};
</script>
