<template>
  <div>
    <notification-panels :showError="showError" :errorMessage="error" :showSuccess="showSuccess" :successMessage="success" @closeSuccess="closeSuccess" @closeError="closeError" marginLeft="260px" />
    <div class="clinical-case">
      <div class="container">
        <breadcrumps :breadcrumps="[{ name: $tc('worklist.worklist', 1), route: { name: 'clinical-cases' } }, { name: $t('caseOverview') }]" />
      </div>
    </div>
    <case-overview :caseId="caseId" @error="handleError"></case-overview>
  </div>
</template>

<script>
import Breadcrumps from "@/components/ui/Breadcrumps";
import NotificationPanels from "@/components/ui/NotificationPanels";
import notifications from "@/mixins/notifications";
import CaseOverview from "@/components/CaseOverview";

export default {
  mixins: [notifications],

  computed: {
    caseId() {
      return this.$route.params.id;
    }
  },

  methods: {
    getResources() {}
  },

  components: {
    Breadcrumps,
    CaseOverview,
    NotificationPanels
  }
};
</script>

<style lang="scss" scoped>
.clinical-case {
  margin-left: 260px;
}
</style>
