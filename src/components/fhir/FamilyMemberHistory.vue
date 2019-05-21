<script>
import { extractCodableConcept } from "@/utils/fhir-util";
import Base from "./Base";

export default {
  name: "FamilyMemberHistory",
  extends: Base,
  computed: {
    resourceComputed() {
      let date;
      if (this.resource.date) {
        date = this.$d(new Date(this.resource.date));
      }

      return {
        date,
        gender: this.resource.gender,
        relationship: extractCodableConcept(this.resource.relationship),
        deceasedAge: this.resource.deceasedAge,
        condition: extractCodableConcept(this.resource.condition[0].code)
      };
    }
  }
};
</script>
