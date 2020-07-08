<template>
  <div>
    <div class="comment">
      <div :style="[{ color: getColorForString(comment.name) }]"><account-circle-icon class="icon" title="" /></div>
      <div class="ml-2 mt-1">
        <div class="metadata">
          <span class="name">{{ comment.name }} </span>
          <span class="text-muted">{{ $d(comment.date, "long") }}</span>
        </div>
        <div class="comment-text" v-html="markdown"></div>
      </div>
    </div>
  </div>
</template>

<script>
import AccountCircleIcon from "vue-material-design-icons/AccountCircle";
import { markdownToHtml, stringToColor } from "@/util/util";

export default {
  props: {
    comment: {
      type: Object,
      required: true
    }
  },

  computed: {
    markdown() {
      if (!this.comment || !this.comment.text) {
        return "";
      }
      return markdownToHtml(this.comment.text);
    }
  },

  methods: {
    getColorForString(str) {
      return stringToColor(str);
    }
  },

  components: {
    AccountCircleIcon
  }
};
</script>

<style lang="scss" scoped>
.comment {
  display: flex;
}

.comment-text {
  word-break: break-word;
}

.name {
  font-weight: bold;
}

.icon {
  font-size: 2.4rem;
}
</style>
