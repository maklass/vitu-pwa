<template>
  <div class="breadcrumps">
    <span v-for="(breadcrump, index) in breadcrumps" :key="breadcrump.name">
      <router-link :to="breadcrump.route" v-if="breadcrump.route">{{ breadcrump.name }}</router-link>
      <span v-if="!breadcrump.route">{{ breadcrump.name }}</span>
      <span v-if="index !== breadcrumps.length - 1"><chevron-right-icon />&nbsp;</span>
    </span>
  </div>
</template>

<script>
import ChevronRightIcon from "vue-material-design-icons/ChevronRight";

export default {
  props: {
    /**
     * [ { name: "Admin", route: { name: "admin" }} ]
     */
    breadcrumps: {
      type: Array,
      default() {
        return [];
      }
    }
  },

  components: {
    ChevronRightIcon
  }
};
</script>

<style lang="scss" scoped>
.breadcrumps {
  padding: 0.8rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 0.8rem;

  a {
    color: inherit;
  }
}
</style>
