<template>
  <div>
    <div class="comments">
      <div class="new-comment">
        <div :style="[{ color: getColorForString(fullUserName) }]"><account-circle-icon class="icon" title="" /></div>
        <form ref="form" autocomplete="off" v-on:submit.prevent="onSubmit" class="form ml-2 mt-1">
          <div class="form-group">
            <textarea ref="comment" required class="form-control" :placeholder="$t('addComment') + '...'" rows="2" @input="mixin_autoResize_resize_by_event" v-model.trim="newComment.text"></textarea>
          </div>
          <div class="btn-panel">
            <button class="btn btn-secondary btn-cancel mr-2" type="button" @click="onCancel" v-if="commentEntered">{{ $t("cancel") }}</button>
            <button class="btn btn-primary" :disabled="!commentEntered">{{ $t("commentVerb") }}</button>
          </div>
        </form>
      </div>
      <hr />
      <div>
        <spinner v-if="loading" />
        <div v-else>
          <div v-if="sortedComments && sortedComments.length">
            <div class="option-panel mb-2">
              <button type="button" :class="['btn btn-link pl-0', { 'text-muted': sortAscending }]" @click="setSortAscending(false)">{{ $t("newestFirst") }}</button>
              <button type="button" :class="['btn btn-link', { 'text-muted': !sortAscending }]" @click="setSortAscending(true)">{{ $t("oldestFirst") }}</button>
            </div>
            <div v-for="(comment, i) in sortedComments" :key="comment.id">
              <div class="comment-wrapper">
                <comment class="comment" :comment="comment" />
                <div v-if="keycloak.hasRealmRole('vitu-moderator')">
                  <b-dropdown variant="link" right no-caret>
                    <template slot="button-content">
                      <dots-vertical-icon title="" class="option-icon" />
                    </template>
                    <b-dropdown-item @click="onDelete(comment.id)" class="text-danger">{{ $t("deleteComment") }}</b-dropdown-item>
                  </b-dropdown>
                </div>
              </div>
              <hr v-if="i !== sortedComments.length - 1" />
            </div>
          </div>
          <div v-else>{{ $t("noComments") }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AccountCircleIcon from "vue-material-design-icons/AccountCircle";
import Comment from "@/components/moderator/Comment";
import DotsVerticalIcon from "vue-material-design-icons/DotsVertical";
import cloneDeep from "lodash";
import uuid from "uuid/v4";
import { mapState } from "vuex";
import { stringToColor } from "@/util/util";
import autoResize from "@/mixins/auto-resize";
import { addComment, fetchComments } from "@/api/worklist-api";
import { mapFhirResponse, deleteResourceById } from "@molit/fhir-api";
import config from "@/config/config";
import { get } from "lodash";
import Spinner from "@/components/ui/Spinner";

const commentTemplate = {
  text: null,
  date: null,
  id: null,
  name: null
};

const POLL_RATE = 10000;

export default {
  mixins: [autoResize],

  props: {
    patientId: {
      type: String,
      required: true
    },

    episodeOfCareId: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      comments: [],
      loading: true,
      newComment: null,
      sortAscending: false,
      pollTimeout: null
    };
  },

  computed: {
    ...mapState({
      keycloak: state => state.authentication.keycloak,
      token: state => state.authentication.keycloak.token
    }),

    fhirBaseUrl() {
      return config.FHIR_URL;
    },

    fullUserName() {
      if (this.keycloak) {
        return this.keycloak.idTokenParsed.name;
      } else {
        return "";
      }
    },

    commentEntered() {
      return this.newComment && this.newComment.text && this.newComment.text !== "";
    },

    sortedComments() {
      if (!this.comments) {
        return [];
      } else {
        return this.comments.slice().sort((a, b) => {
          if (this.sortAscending) {
            return a.date - b.date;
          } else {
            return b.date - a.date;
          }
        });
      }
    }
  },

  methods: {
    async onSubmit() {
      if (this.$refs.form && !this.$refs.form.checkValidity()) {
        this.$refs.form.reportValidity();
        return;
      }

      this.newComment.date = new Date().toISOString();
      this.newComment.name = this.fullUserName;

      try {
        this.loading = true;
        await addComment(this.fhirBaseUrl, this.token, this.newComment.text, this.newComment.date, this.patientId, this.episodeOfCareId, this.newComment.name);
        this.comments = [];
        await this.fetchComments();
        this.reset();
        this.loading = false;
      } catch (e) {
        this.loading = false;
        this.$emit("error", e);
      }
    },

    setSortAscending(sortAscending) {
      this.sortAscending = sortAscending;
    },

    onCancel() {
      this.reset();
    },

    async onDelete(id) {
      try {
        this.loading = true;
        await deleteResourceById(this.fhirBaseUrl, "Observation", id, this.token);
        this.comments = [];
        await this.fetchComments();
        this.loading = false;
      } catch (e) {
        this.loading = false;
        this.$emit("error", e);
      }
    },

    reset() {
      this.resetNewComment();
      this.resetTextarea();
    },

    resetNewComment() {
      this.newComment = cloneDeep(commentTemplate);
      this.newComment.id = uuid();
    },

    resetTextarea() {
      this.$nextTick(() => {
        this.mixin_autoResize_resize(this.$refs.comment);
      });
    },

    getColorForString(str) {
      return stringToColor(str);
    },

    async fetchComments() {
      const response = await fetchComments(this.fhirBaseUrl, this.token, this.patientId);

      const total = get(response, "data.total", 0);
      this.$emit("updateCommentsTotal", total);

      const resources = mapFhirResponse(response);
      this.comments = resources.map(observation => {
        return {
          id: observation.id,
          date: new Date(observation.effectiveDateTime),
          text: observation.valueString,
          name: get(observation, "performer[0].display")
        };
      });
    },

    async poll() {
      try {
        await this.fetchComments();
        this.loading = false;
      } catch (e) {
        this.loading = false;
        this.$emit("error", e);
      }
      this.pollTimeout = setTimeout(this.poll, POLL_RATE);
    }
  },

  beforeDestroy() {
    if (this.pollTimeout) {
      clearTimeout(this.pollTimeout);
    }
  },

  created() {
    this.resetNewComment();
  },

  mounted() {
    this.poll();
  },

  components: {
    AccountCircleIcon,
    Comment,
    DotsVerticalIcon,
    Spinner
  }
};
</script>

<style lang="scss" scoped>
.comments {
  margin-bottom: 1rem;
  margin-top: 1rem;
}

.comment-wrapper {
  display: flex;
}

.comment {
  flex: 1;
}

.form {
  margin-bottom: 1rem;
  flex: 1;
}

.btn-panel {
  text-align: right;
}

.new-comment {
  display: flex;

  textarea {
    overflow: hidden;
  }
}

.icon {
  font-size: 2.4rem;
}

.option-icon {
  font-size: 1.2rem;
}

.text-danger {
  color: $vitu-danger;
}

.bold {
  font-weight: bold;
}

.option-panel {
  button:focus,
  button:hover {
    text-decoration: none;
  }
}
</style>
