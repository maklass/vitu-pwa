<template>
  <router-link :to="route" tag="div">
    <div class="side-nav-header">
      <div class="logo">
        <slot name="icon"></slot>
      </div>
      <div class="title">{{ title }}</div>
    </div>
  </router-link>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: ""
    },
    route: {
      type: String | Object,
      default: ""
    }
  }
};
</script>

<style lang="scss" scoped>
.side-nav-header {
  display: flex;
  padding: 0 16px;
  height: 3em;
  align-items: center;
  font-size: 1.2rem;
  color: black;
  cursor: pointer;
}

.divider {
  height: 0;
  overflow: hidden;
  border-top: 1px solid rgba(0, 0, 0, 0.15);
}

.title {
  white-space: nowrap;
}

.icon {
  color: rgba(0, 0, 0, 0.6);
  margin-right: 1em;
  font-size: 1.4em;
}

.logo {
  margin-right: 1em;
}

.title {
  transition: opacity 0.2s ease;
  transition-delay: 0.05s;
}
</style>

<style lang="scss">
.logo {
  img {
    width: 28px;
  }
}
</style>
