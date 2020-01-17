<template>
  <div>
    <notification-panels
      :showError="showError"
      :errorMessage="error"
      :showWarning="showWarning"
      :warning="warning"
      :showSuccess="showSuccess"
      :successMessage="success"
      @closeSuccess="closeSuccess"
      @closeWarning="closeWarning"
      @closeError="closeError"
    />
    <div class="container status-list">
      <breadcrumps :breadcrumps="[{ name: $t('admin.adminArea'), route: { name: 'admin' } }, { name: $t('admin.statusList') }]" />
      <div class="page-header">
        <h5 class="headline">{{ $t("admin.statusList") }}</h5>
        <div class="spacer"></div>
        <router-link class="btn btn-primary" tag="button" :to="{ name: 'status-new' }">{{ $t("admin.addStatus") }}</router-link>
      </div>
      <div>
        {{ $t("admin.statusListDescription") }} <strong>{{ $t("hint") }}:</strong> {{ $t("admin.statusListDescriptionHint") }}
      </div>
      <div class="page-body">
        <spinner v-if="loading" line-fg-color="#148898" line-bg-color="#99bfbf" size="medium" :speed="1.5" />
        <div v-if="!loading">
          <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" v-model="showInactiveStatuses" id="show-inactive" />
            <label class="form-check-label" for="show-inactive">
              {{ $t("admin.showInactiveStatuses") }}
            </label>
          </div>
          <div v-if="showInactiveStatuses" class="mb-3">
            <h6>{{ $t("admin.inactive") }}</h6>
            <list-item class="list-item" v-for="status in disabledStatuses" :key="status.code" :value="status.code" :title="status.display">
              <template slot="icon">
                -
              </template>
              <template slot="actions">
                <router-link :to="{ name: 'status', params: { id: status.code } }"><pencil-icon /></router-link>
              </template>
            </list-item>
            <div v-if="!disabledStatuses || !disabledStatuses.length">{{ $t("admin.noInactiveStatusesFound") }}</div>
          </div>
          <h6>{{ $t("admin.active") }}</h6>
          <vue-draggable :list="statuses" ghost-class="ghost" @change="change" class="cursor-grab">
            <list-item class="list-item" v-for="status in statuses" :key="status.code" :value="status.code" :title="status.display">
              <template slot="icon">
                {{ status.extension && status.extension[0] ? status.extension[0].valueDecimal + 1 : "" }}
              </template>
              <template slot="actions">
                <router-link :to="{ name: 'status', params: { id: status.code } }"><pencil-icon /></router-link>
              </template>
            </list-item>
          </vue-draggable>
        </div>
      </div>
      <div class="page-footer">
        <div class="spacer"></div>
        <button class="btn btn-primary" @click="save" :disabled="saveButtonDisabled">{{ $t("admin.save") }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import PencilIcon from "vue-material-design-icons/Pencil";
import Spinner from "vue-simple-spinner";
import VueDraggable from "vuedraggable";
import { mapState } from "vuex";

import notifications from "@/mixins/notifications";
import Breadcrumps from "@/components/ui/Breadcrumps";
import ListItem from "@/components/ui/ListItem";
import NotificationPanels from "@/components/ui/NotificationPanels";
import { setTimeout } from "timers";
import config from "@/config/config";
import { fetchResources, mapFhirResponse, updateResource } from "@molit/fhir-api";

export default {
  mixins: [notifications],

  data() {
    return {
      valueSet: null,
      codeSystem: null,
      statuses: null,
      disabledStatuses: [],
      changed: false,
      loading: true,
      loadingTime: 300,
      showInactiveStatuses: false
    };
  },

  computed: {
    ...mapState({
      token: state => state.authentication.keycloak.token,
      roles: state => state.authentication.keycloak.realmAccess.roles
    }),

    saveButtonDisabled() {
      return this.error || !this.changed;
    }
  },

  methods: {
    async fetchStatuses() {
      try {
        this.valueSet = mapFhirResponse(await fetchResources(config.FHIR_URL, "ValueSet", { url: "http://molit.eu/fhir/ValueSet/vitu-workinglist" }, this.token))[0];
        this.codeSystem = mapFhirResponse(await fetchResources(config.FHIR_URL, "CodeSystem", { url: "http://molit.eu/fhir/CodeSystem/vitu-workinglist" }, this.token))[0];
        if (!this.valueSet) {
          throw new Error("ValueSet 'vitu-worklist' not found on server.");
        }
        if (!this.codeSystem) {
          throw new Error("CodeSystem 'vitu-worklist' not found on server.");
        }
        this.statuses = this.valueSet.compose.include[0].concept || [];
        this.disabledStatuses = this.codeSystem.concept.filter(sc => !this.statuses.find(sv => sc.code === sv.code));
        this.loading = false;
      } catch (e) {
        this.loading = false;
        this.handleError(e, true);
      }
    },

    handleQueryParams() {
      if (this.$route.query.success) {
        this.success = this.$t("admin.saveSuccessful");
      }
    },

    change() {
      this.changed = true;
    },

    reload() {
      this.statuses = null;
      this.disabledStatuses = [];
      this.loading = true;
      this.fetchStatuses();
      setTimeout(() => (this.loading = false), this.loadingTime);
    },

    async save() {
      try {
        this.statuses.map((status, index) => (status.extension[0].valueDecimal = index));
        this.loading = true;
        await updateResource(config.FHIR_URL, this.valueSet, this.token);
        this.reload();
        this.success = this.$t("admin.saveSuccessful");
      } catch (e) {
        this.handleError(e);
      }
    }
  },

  mounted() {
    this.fetchStatuses();
    this.handleQueryParams();
    setTimeout(() => (this.loading = false), this.loadingTime);
  },

  components: {
    Breadcrumps,
    ListItem,
    NotificationPanels,
    PencilIcon,
    Spinner,
    VueDraggable
  }
};
</script>

<style lang="scss" scoped>
.status-list {
  background: white;
}

.cursor-grab {
  cursor: grab;
}

.list-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);

  &:last-child {
    border: 0;
  }

  &.disabled {
    color: #aaa;
    font-style: italic;
  }
}

.page-header {
  margin-bottom: 1rem;
}

.ghost {
  opacity: 60%;
  border-left: 4px solid $vitu-green;
}
</style>
