<template>
  <div>
    <notification-panels :showError="error" :errorMessage="error" :showSuccess="showSuccess" :successMessage="$t('admin.saveSuccessful')" />
    <div class="container status-list">
      <breadcrumps :breadcrumps="[{ name: $t('admin.adminArea'), route: { name: 'admin' } }, { name: $t('admin.statusList') }]" />
      <div class="admin-header">
        <h5 class="headline">{{ $t("admin.statusList") }}</h5>
        <div>
          {{ $t("admin.statusListDescription") }} <strong>{{ $t("hint") }}:</strong> {{ $t("admin.statusListDescriptionHint") }}
        </div>
        <!-- <div class="spacer"></div>
      <router-link class="btn btn-primary" tag="button" :to="{ name: 'status-new' }">{{ $t("admin.addStatus") }}</router-link> -->
      </div>
      <div class="admin-body">
        <spinner v-if="(!statuses && !error) || (loading && !error)" line-fg-color="#148898" line-bg-color="#99bfbf" size="medium" :speed="1.5" />
        <vue-draggable :list="statuses" ghost-class="ghost" v-if="!loading" @change="change">
          <list-item :class="['list-item', { disabled: status.disabled }]" v-for="status in statuses" :key="status.id" :value="status.id" :title="$t(`worklist.statusCode.${status.description}`)">
            <template slot="icon">
              <!-- {{ index + 1 }} -->
              {{ status.orderNumber }}
            </template>
            <template slot="actions">
              <router-link :to="{ name: 'status', params: { id: status.id } }"><pencil-icon /></router-link>
            </template>
          </list-item>
        </vue-draggable>
      </div>
      <div class="admin-footer">
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

import Breadcrumps from "@/components/ui/Breadcrumps";
import ListItem from "@/components/ui/ListItem";
import NotificationPanels from "@/components/ui/NotificationPanels";
import { getStatuses, updateStatusesBatch } from "@/api/process-api";
import { setTimeout } from "timers";
import { handleAxiosError } from "@/util/error-util";
import config from "@/config/config";

export default {
  data() {
    return {
      statuses: null,
      error: null,
      showSuccess: false,
      changed: false,
      loading: true,
      loadingTime: 300
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
    handleError(error) {
      this.error = handleAxiosError(error, this);
      window.scrollTo(0, 0);
    },

    async getStatuses() {
      try {
        this.statuses = (await getStatuses({}, this.token)).data.sort((a, b) => a.orderNumber - b.orderNumber);
      } catch (e) {
        this.handleError(e);
      }
    },

    handleQueryParams() {
      if (this.$route.query.success) {
        this.showSuccess = true;
        setTimeout(() => {
          this.showSuccess = false;
        }, config.SUCCESS_HEADER_TIMEOUT);
      }
    },

    change() {
      this.changed = true;
    },

    reload() {
      this.statuses = null;
      this.loading = true;
      this.getStatuses();
      setTimeout(() => (this.loading = false), this.loadingTime);
    },

    async save() {
      try {
        this.statuses.map((status, index) => (status.orderNumber = index + 1));
        this.loading = true;
        await updateStatusesBatch(this.statuses, this.token);
        this.reload();
        this.showSuccess = true;
        setTimeout(() => {
          this.showSuccess = false;
        }, config.SUCCESS_HEADER_TIMEOUT);
      } catch (e) {
        this.handleError(e);
      }
    }
  },

  mounted() {
    this.getStatuses();
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

.list-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  cursor: grab;

  &:last-child {
    border: 0;
  }

  &.disabled {
    color: #aaa;
    font-style: italic;
  }
}

.admin-header {
  display: block;

  .headline {
    margin-bottom: 0.4rem;
  }
}

.ghost {
  opacity: 60%;
  border-left: 4px solid $vitu-green;
}
</style>
