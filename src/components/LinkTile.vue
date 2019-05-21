<template>
  <router-link :to="route" class="link">
    <b-card class="text-center card">
      <div>
        <slot name="header"></slot>
      </div>
      <div>
        {{ title }}
      </div>
    </b-card>
  </router-link>
</template>

<script>
export default {
  name: "LinkTile",
  props: {
    title: {
      type: String,
      default: ""
    },
    route: {
      type: String,
      default: ""
    }
  }
};
</script>

<style lang="scss" scoped>
.card {
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2), 0 12px 40px 0 rgba(0, 0, 0, 0.19);
}

.link:hover {
  text-decoration: none;
}
</style>
