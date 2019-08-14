<script>
import { extractGivenName, extractFamilyName } from "@/util/fhir-util";
import Base from "./Base";

export default {
  name: "Patient",
  extends: Base,
  computed: {
    resourceComputed() {
      return {
        title: undefined,
        birthDate: this.resource.birthDate ? this.$d(new Date(this.resource.birthDate)) : undefined,
        givenName: extractGivenName(this.resource),
        familyName: extractFamilyName(this.resource),
        gender: this.resource.gender,
        generalPractitioner: this.resource.generalPractitioner ? this.resource.generalPractitioner.display : undefined
      };
    }
  }
};
</script>
