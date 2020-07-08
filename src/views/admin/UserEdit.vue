<template>
  <div>
    <notification-panels :showError="showError" :errorMessage="error" :showSuccess="showSuccess" :successMessage="success" @closeSuccess="closeSuccess" @closeError="closeError" />
    <div class="container">
      <breadcrumps :breadcrumps="[{ name: $t('admin.adminArea'), route: { name: 'admin' } }, { name: $t('admin.userList'), route: { name: 'users' } }, { name: $t('admin.user') }]" />
      <div class="page-header">
        <h5 v-if="!isExistingUser">{{ $t("admin.addUser") }}</h5>
        <h5 v-else>{{ $t("admin.editUser") }}</h5>
      </div>
      <div class="page-body">
        <div v-if="user && !saving">
          <form @submit.prevent="save" ref="form" autocomplete="off">
            <div class="pt-3" v-if="user.fromFederation">
              <form-information :text="$t('userFromFederationInfo')" />
              <hr />
            </div>
            <fieldset :disabled="user.fromFederation">
              <legend>{{ $t("admin.account") }}</legend>
              <div class="form-group row">
                <label for="firstName" class="col-md-3 col-form-label">{{ $t("firstName") }}*</label>
                <div class="col-md-9">
                  <input type="text" class="form-control" id="firstName" required :placeholder="$t('firstName')" v-model="user.firstName" />
                </div>
              </div>
              <div class="form-group row">
                <label for="lastName" class="col-md-3 col-form-label">{{ $t("lastName") }}*</label>
                <div class="col-md-9">
                  <input type="text" class="form-control" id="lastName" required :placeholder="$t('lastName')" v-model="user.lastName" />
                </div>
              </div>
              <div class="form-group row">
                <label for="username" class="col-md-3 col-form-label">{{ $t("username") }}*</label>
                <div class="col-md-9">
                  <input type="text" class="form-control" id="username" required :placeholder="$t('username')" v-model="user.username" :disabled="isExistingUser" />
                </div>
              </div>
              <div class="form-group row">
                <label for="email" class="col-md-3 col-form-label">{{ $t("email") }}*</label>
                <div class="col-md-9">
                  <input type="email" class="form-control" id="email" required :placeholder="$t('email')" v-model="user.email" />
                </div>
              </div>
              <div class="form-group row" v-if="!user.fromFederation">
                <label for="organization" class="col-md-3 col-form-label">{{ $t("organization") }}</label>
                <div class="col-md-9">
                  <resource-select
                    :fhirBaseUrl="fhirBaseUrl"
                    :resourceName="'Organization'"
                    :titleAttribute="organizationSelector.titleAttribute"
                    :subtitleAttributes="organizationSelector.subtitleAttributes"
                    :searchAttributes="organizationSelector.searchAttributes"
                    :queryParams="organizationSelector.queryParams"
                    :searchInputPlaceholder="$t('search')"
                    :token="token"
                    :required="false"
                    @error="handleError"
                    v-model="organization"
                    :value="{ name: user.company }"
                  />
                </div>
              </div>
            </fieldset>
            <fieldset>
              <legend>{{ $t("password") }}</legend>
              <div class="form-group row" v-if="isExistingUser">
                <div class="col-form-label col-md-3 pt-0"></div>
                <div class="col-md-9">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="set-password" v-model="setPassword" :disabled="user.fromFederation" />
                    <label class="form-check-label" for="set-password">{{ $t("setNewPassword") }}</label>
                  </div>
                </div>
              </div>
              <div class="form-group row">
                <div class="col-form-label col-md-3 pt-0">{{ $t("hint") }}</div>
                <div :class="['col-md-9', { 'text-muted': !setPassword }]">{{ $t("hintTemporaryPassword") }}</div>
              </div>
              <div class="form-group row">
                <label for="password" class="col-md-3 col-form-label">{{ $t("password") }}*</label>
                <div class="col-md-9">
                  <input autocomplete="new-password" type="password" :disabled="!setPassword" pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}" class="form-control" id="password" required :placeholder="$t('password')" v-model="password" />
                  <small class="form-text text-muted">{{ $t("passwordCriteria") }}</small>
                </div>
              </div>
              <div class="form-group row">
                <label for="password-confirmation" class="col-md-3 col-form-label">{{ $t("passwordConfirmation") }}*</label>
                <div class="col-md-9">
                  <input
                    autocomplete="new-password"
                    type="password"
                    :disabled="!setPassword"
                    ref="passwordConfirm"
                    class="form-control"
                    id="password-confirmation"
                    required
                    :placeholder="$t('passwordConfirmation')"
                    v-model="passwordConfirmation"
                  />
                </div>
              </div>
            </fieldset>
            <fieldset>
              <legend>{{ $t("roles.roles") }}</legend>
              <div class="form-group row">
                <div class="col-form-label col-md-3 pt-0">{{ $t("roles.roles") }}</div>
                <div class="col-md-9">
                  <div class="form-check" v-for="role in roles" :key="role.id">
                    <input class="form-check-input" type="checkbox" :id="role.id" :value="role" v-model="user.realmRoles" />
                    <label class="form-check-label" :for="role.id">{{ role.name }}</label>
                  </div>
                </div>
              </div>
            </fieldset>
          </form>
        </div>
        <spinner class="spinner" v-if="loading" line-fg-color="#148898" line-bg-color="#99bfbf" size="medium" :speed="1.5" />
      </div>
      <div class="page-footer" v-if="user">
        <div class="spacer"></div>
        <button class="btn btn-secondary btn-cancel" @click="cancel">{{ $t("cancel") }}</button>
        <button class="btn btn-primary" @click="onSubmit" :disabled="saveButtonDisabled">{{ $t("admin.save") }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { addUser, updateUser, getUserById, getRoles, resetPassword, deleteRolesFromUser } from "@/api/security-api";
import Spinner from "vue-simple-spinner";
import notifications from "@/mixins/notifications";
import ResourceSelect from "@/components/ui/ResourceSelect";
import config from "@/config/config";
import { differenceBy } from "lodash";
import Breadcrumps from "@/components/ui/Breadcrumps";
import FormInformation from "@/components/ui/FormInformation";
import NotificationPanels from "@/components/ui/NotificationPanels";

export default {
  mixins: [notifications],

  data() {
    return {
      organizationSelector: {
        searchAttributes: [
          {
            name: "Name",
            value: "name:contains"
          }
        ],
        queryParams: {
          _sort: "name",
          active: true
        },
        titleAttribute: {
          value: "name",
          type: "sring"
        },
        subtitleAttributes: [
          {
            name: "",
            value: "",
            type: "string"
          }
        ]
      },
      organization: { name: null },
      roles: null,
      user: null,
      password: null,
      passwordConfirmation: null,
      changed: false,
      setPassword: false,
      saving: false
    };
  },

  computed: {
    ...mapState({
      token: state => state.authentication.keycloak.token
    }),
    fhirBaseUrl() {
      return config.FHIR_URL;
    },
    isExistingUser() {
      return this.$route.params.id && this.$route.params.id !== "new";
    },

    saveButtonDisabled() {
      return false;
    },

    loading() {
      return (!this.user && !this.error) || this.saving;
    }
  },

  methods: {
    cancel() {
      this.$router.push({ name: "users" });
    },

    handleKeycloakError(e) {
      if (e && e.response && e.response.data && e.response.data.errorMessage && e.response.data.errorMessage.includes("same username")) {
        this.error = this.$t("admin.usernameAlreadyPresent", { username: this.user.username });
        window.scrollTo(0, 0);
      } else if (e && e.response && e.response.data && e.response.data.errorMessage && e.response.data.errorMessage.includes("same email")) {
        this.error = this.$t("admin.emailAlreadyPresent", { email: this.user.email });
        window.scrollTo(0, 0);
      } else {
        this.handleError(e, this);
      }
    },

    async save() {
      try {
        this.saving = true;
        if (this.isExistingUser) {
          const rolesToRemove = differenceBy(this.roles, this.user.realmRoles, "id");
          if (rolesToRemove && rolesToRemove.length) {
            await deleteRolesFromUser(this.token, this.user.id, rolesToRemove);
          }
          if (this.user.realmRoles) {
            this.user.realmRoles = this.user.realmRoles.map(r => r.name);
          }
          if (this.organization) {
            this.user.company = this.organization.name;
          }
          if (this.setPassword) {
            await resetPassword(this.user, this.password, this.token);
          }
          await updateUser(this.user, this.token);
          this.$router.push({ name: "users", query: { success: "admin.editUserSuccessful" } });
        } else {
          if (this.setPassword) {
            this.user.credentials = [
              {
                temporary: true,
                value: this.password,
                type: "password"
              }
            ];
          }
          if (this.organization) {
            this.user.organizationId = this.organization.id;
          }
          await addUser(this.user, this.token);
          this.$router.push({ name: "users", query: { success: "admin.createUserSuccessful" } });
        }
      } catch (e) {
        this.handleKeycloakError(e);
        this.saving = false;
      }
    },

    mapRoles(roles) {
      if (!roles) {
        return [];
      }
      return roles.map(r => {
        return {
          id: r.id,
          name: r.name
        };
      });
    },

    onSubmit() {
      if (this.setPassword) {
        if (this.passwordConfirmation !== this.password) {
          this.$refs.passwordConfirm.setCustomValidity(this.$t("passwordsNotMatching"));
        } else {
          this.$refs.passwordConfirm.setCustomValidity("");
        }
      }

      if (!this.$refs.form.checkValidity()) {
        this.$refs.form.reportValidity();
        return;
      }

      this.save();
    }
  },

  async mounted() {
    if (!this.isExistingUser) {
      this.setPassword = true;
    }

    try {
      this.roles = this.mapRoles((await getRoles(this.token)).data);
    } catch (e) {
      this.handleError(e, this);
    }

    if (this.isExistingUser) {
      try {
        this.user = (await getUserById(this.$route.params.id, this.token)).data;
        this.user.realmRoles = this.mapRoles(this.user.realmRoles);
        if (this.user.company) {
          this.organization.name = this.user.company;
        }
      } catch (e) {
        this.handleError(e, this);
      }
    } else {
      this.user = {
        username: null,
        firstName: null,
        lastName: null,
        organizationId: null,
        realmRoles: [],
        email: null,
        emailVerified: true
      };
    }
  },

  components: {
    Breadcrumps,
    FormInformation,
    NotificationPanels,
    Spinner,
    ResourceSelect
  }
};
</script>

<style lang="scss" scoped>
.active-container {
  display: flex;
  align-items: center;
}

.form-check-input {
  margin-top: 0.5rem;
}

.btn-cancel {
  margin-right: 0.5rem;
}

fieldset {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 1rem;

  legend {
    font-size: 1.3rem;
    padding-top: 1rem;
  }
}

.page-footer {
  border: 0;
  padding-top: 0;
}

.page-body {
  padding-top: 0;
}

.spinner {
  margin-top: 1rem;
}
</style>
