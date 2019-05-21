<script>
import Base from "./Base";

export default {
  name: "MedicationStatement",
  extends: Base,
  computed: {
    resourceComputed() {
      return {
        status: this.resource.status,
        reasonCode: this.resource.reasonCode.text,
        taken: this.resource.taken
      };
    }
  }
};
</script>
