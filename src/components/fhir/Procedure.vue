<script>
import { extractCodableConcept } from "@/util/fhir-util";
import Base from "./Base";

export default {
  name: "Procedure",
  extends: Base,
  computed: {
    resourceComputed() {
      let date;
      if (this.resource.performedPeriod && this.resource.performedPeriod.start) {
        date = this.$d(new Date(this.resource.performedPeriod.start));
      }

      return {
        date,
        status: this.resource.status,
        code: extractCodableConcept(this.resource.code),
        outcome: this.resource.outcome.text,
        reason: this.resource.reasonCode[0].text
      };
    }
  }
};
</script>
