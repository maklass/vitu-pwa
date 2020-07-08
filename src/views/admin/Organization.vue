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
    <div class="container">
      <breadcrumps
        :breadcrumps="[
          { name: $tc('admin.organization', 2), route: { name: 'organizations' } },
          { name: $tc('admin.organization', 1), route: { name: 'organization' } }
        ]"
      />
      <spinner class="spinner" v-if="spinner.loading" line-fg-color="#148898" line-bg-color="#99bfbf" size="medium" :speed="1.5" />
      <div class="page-header" v-if="!spinner.loading">
        <h5 class="headline">{{ $tc("admin.organization", 1) }}</h5>
        <div class="spacer"></div>
        <div v-if="organization && mode !== 'edit' && mode !== 'new'" class="btn" v-on:click="enterEditMode()">
          <edit-icon class="icon"></edit-icon>
        </div>
      </div>
      <div class="page-body" v-if="!spinner.loading">
        <div class="main">
          <form autocomplete="off" ref="form" v-on:submit.prevent="onSubmit" v-if="!spinner.loading">
            <fieldset>
              <div class="form-group form-row">
                <label class="col-md-3 col-form-label" for="patientId">{{ $t("name") }}<span v-if="mode === 'edit' || mode === 'new'">*</span></label>
                <div class="col-md-9">
                  <input required :readonly="mode !== 'edit' && mode !== 'new'" id="patientId" type="text" class="form-control" v-model="name" :placeholder="$t('name')" v-on:keyup.enter="onSubmit" />
                </div>
              </div>
              <div class="form-group form-row">
                <label class="col-md-3 col-form-label">{{ $t("parentOrganization") }}</label>
                <div class="col-md-9">
                  <div v-if="mode !== 'edit' && mode !== 'new'">
                    <input v-if="partOf" readonly class="form-control" :value="partOf.name" />
                    <input v-else readonly class="form-control" :placeholder="$t('parentOrganization')" />
                  </div>
                  <div v-else>
                    <div>
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
                        v-model="partOf"
                        :value="partOf"
                      />
                      <!-- <small class="form-text text-muted">{{ $t("organizationInfo") }}</small> -->
                    </div>
                  </div>
                </div>
              </div>
              <hr />
            </fieldset>
            <fieldset>
              <legend>{{ $t("address") }}</legend>
              <div class="form-group form-row">
                <label class="col-md-3 col-form-label" for="line">{{ $t("address") }}</label>
                <div class="col-md-9">
                  <div v-if="address.line">
                    <input :readonly="mode !== 'edit' && mode !== 'new'" id="line" type="text" class="form-control" v-model="address.line[0]" :placeholder="$t('address')" v-on:keyup.enter="onSubmit" />
                  </div>
                </div>
              </div>
              <div class="form-group form-row">
                <label class="col-md-3 col-form-label" for="city">{{ $t("city") }}</label>
                <div class="col-md-9">
                  <input :readonly="mode !== 'edit' && mode !== 'new'" id="city" type="text" class="form-control" v-model="address.city" :placeholder="$t('city')" v-on:keyup.enter="onSubmit" />
                </div>
              </div>
              <div class="form-group form-row">
                <label class="col-md-3 col-form-label" for="postalCode">{{ $t("postalCode") }}</label>
                <div class="col-md-2">
                  <input :readonly="mode !== 'edit' && mode !== 'new'" id="postalCode" type="text" class="form-control" v-model="address.postalCode" :placeholder="$t('postalCode')" v-on:keyup.enter="onSubmit" />
                </div>
                <label class="col-md-2 col-form-label" for="country">{{ $t("country") }}</label>
                <div class="col-md-5">
                  <div v-if="mode !== 'edit' && mode !== 'new'">
                    <input v-if="countryConcept" readonly class="form-control" :value="countryConcept.display" />
                    <input v-else readonly class="form-control" :placeholder="$t('country')" />
                  </div>
                  <div v-else>
                    <concept-select
                      :fhirBaseUrl="fhirBaseUrl"
                      :resourceName="'CodeSystem'"
                      url="http://fhir.de/CodeSystem/deuev/anlage-8-laenderkennzeichen"
                      :token="token"
                      :required="false"
                      v-model="countryConcept"
                      :value="countryConcept"
                    />
                  </div>
                </div>
              </div>
            </fieldset>
            <hr />
            <fieldset>
              <legend>{{ $t("contact") }}</legend>
              <div class="form-group form-row">
                <label class="col-md-3 col-form-label" for="firstName">{{ $t("firstName") }}</label>
                <div class="col-md-3">
                  <div v-if="contact.name && contact.name.given">
                    <input :readonly="mode !== 'edit' && mode !== 'new'" id="firstName" type="text" class="form-control" v-model="contact.name.given[0]" :placeholder="$t('firstName')" v-on:keyup.enter="onSubmit" />
                  </div>
                </div>
                <label class="col-md-2 col-form-label" for="lastName">{{ $t("lastName") }}</label>
                <div class="col-md-4">
                  <div v-if="contact.name">
                    <input :readonly="mode !== 'edit' && mode !== 'new'" id="lastName" type="text" class="form-control" v-model="contact.name.family" :placeholder="$t('lastName')" v-on:keyup.enter="onSubmit" />
                  </div>
                </div>
              </div>
              <div class="form-group form-row">
                <label class="col-md-3 col-form-label" for="email">{{ $t("email") }}</label>
                <div class="col-md-9">
                  <input :readonly="mode !== 'edit' && mode !== 'new'" id="email" type="email" class="form-control" v-model="contact.telecom[0].value" :placeholder="$t('email')" v-on:keyup.enter="onSubmit" />
                </div>
              </div>
              <div class="form-group form-row">
                <label class="col-md-3 col-form-label" for="phone">{{ $t("phone") }}</label>
                <div class="col-md-3">
                  <input :readonly="mode !== 'edit' && mode !== 'new'" id="phone" type="tel" class="form-control" v-model="contact.telecom[1].value" :placeholder="$t('phone')" v-on:keyup.enter="onSubmit" />
                </div>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
      <div class="page-footer" v-if="mode === 'edit' || mode === 'new'">
        <div class="spacer"></div>
        <button class="btn btn-secondary btn-cancel spacing" @click="onCancel">{{ $t("cancel") }}</button>
        <button class="btn btn-primary" @click="onSubmit">{{ $t("admin.save") }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import editIcon from "vue-material-design-icons/Pencil";
import ConceptSelect from "@/components/ui/ConceptSelect";
import ResourceSelect from "@/components/ui/ResourceSelect";
import Breadcrumps from "@/components/ui/Breadcrumps";
import NotificationPanels from "@/components/ui/NotificationPanels";
import notifications from "@/mixins/notifications";
import { getOrganization, updateOrganization, addOrganization } from "@/api/worklist-api";
import { fetchByUrl } from "@molit/fhir-api";
import Spinner from "vue-simple-spinner";
import config from "@/config/config";
import { mapState } from "vuex";
import moment from "moment";
import { handleAxiosError } from "@/util/error-util";
export default {
  mixins: [notifications],
  components: {
    ConceptSelect,
    editIcon,
    Breadcrumps,
    NotificationPanels,
    Spinner,
    ResourceSelect
  },
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
      organization: null,
      organizationCreated: null,
      name: null,
      address: {
        line: [],
        city: null,
        postalCode: null,
        state: null,
        country: null
      },
      contact: {
        name: {
          given: [],
          family: null
        },
        telecom: [
          {
            system: "email",
            value: null
          },
          {
            system: "phone",
            value: null
          }
        ]
      },
      partOf: null,
      countryConcept: null,
      contacts: [],
      showSuccess: false,
      success: null,
      spinner: { loading: false },
      error: null,
      mode: null
    };
  },
  computed: {
    ...mapState({
      token: state => state.authentication.keycloak.token,
      roles: state => state.authentication.keycloak.realmAccess.roles
    }),
    fhirBaseUrl() {
      return config.FHIR_URL;
    }
  },
  methods: {
    formatDate(date) {
      return moment(date).format("DD.MM.YYYY");
    },

    onError(error) {
      this.error = handleAxiosError(error);
      window.scrollTo(0, 0);
    },

    onCancel() {
      if (this.$route.params.id === "new") {
        this.$router.push({ name: "organizations" });
      } else {
        this.mode = null;
      }
    },

    enterEditMode() {
      this.mode = "edit";
    },

    async onSubmit() {
      if (!this.$refs.form.checkValidity()) {
        this.$refs.form.reportValidity();
        return;
      }

      this.spinner.loading = true;

      try {
        let partOfId = null;
        if (this.partOf) {
          partOfId = this.partOf.id;
        }

        if (this.countryConcept) {
          this.address.country = this.countryConcept.display;
        }

        if (this.mode === "edit") {
          let response = await updateOrganization(this.fhirBaseUrl, this.organization, this.address, this.contact, this.name, "Organization/" + partOfId, this.token);
          this.organization = response.data;
          this.mode = null;
        } else if (this.mode === "new") {
          const response = await addOrganization(this.fhirBaseUrl, this.address, this.contact, this.name, "/Organization/" + partOfId, this.token);
          this.organization = response.data;
          this.mode = null;
        }
      } catch (e) {
        this.onError(e);
      }

      this.spinner.loading = false;
      this.showSuccess = true;
      this.success = this.$t("admin.updatedOrganizationSuccessfully");
    }
  },

  mounted() {
    if (this.$route.query.success) {
      this.showSuccess = true;
      this.success = this.$t(this.$route.query.success);
    }
  },

  async created() {
    if (this.$route.params.id === "new") {
      this.mode = "new";
    } else {
      try {
        this.spinner.loading = true;
        let response = await getOrganization(this.fhirBaseUrl, this.$route.params.id, {}, this.token);
        this.organization = response.data;
        this.name = this.organization.name;
        let conceptResponse = await fetchByUrl(this.fhirBaseUrl + "/CodeSystem", { url: "http://fhir.de/CodeSystem/deuev/anlage-8-laenderkennzeichen" }, this.token);
        let concepts = conceptResponse.data.entry[0].resource.concept;

        if (this.organization.address && this.organization.address[0]) {
          if (this.organization.address[0].line) {
            this.address.line = this.organization.address[0].line;
          }
          if (this.organization.address[0].city) {
            this.address.city = this.organization.address[0].city;
          }
          if (this.organization.address[0].postalCode) {
            this.address.postalCode = this.organization.address[0].postalCode;
          }
          if (this.organization.address[0].country) {
            for (let i = 0; i < concepts.length; i++) {
              if (concepts[i].display === this.organization.address[0].country) {
                this.countryConcept = concepts[i];
              }
            }
          }
        }
        if (this.organization.contact && this.organization.contact[0]) {
          if (this.organization.contact[0].name) {
            this.contact.name = this.organization.contact[0].name;
          }
          if (this.organization.contact[0].telecom) {
            this.contact.telecom = this.organization.contact[0].telecom;
          }
        }
        if (this.organization.partOf && this.organization.partOf.reference !== "Organization/null") {
          let split = this.organization.partOf.reference.split("/");
          let response = await getOrganization(this.fhirBaseUrl, split[1], {}, this.token);
          this.partOf = response.data;
        }

        setTimeout(() => {
          this.spinner.loading = false;
        }, 200);
        if (this.$route.query.mode === "edit") {
          this.mode = "edit";
        }
      } catch (error) {
        this.spinner.loading = false;
        this.handleError(error);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.spacing {
  margin-right: 10px;
}
.spinner {
  padding-top: 15px;
}
.icon {
  color: $vitu-green;
}
</style>
