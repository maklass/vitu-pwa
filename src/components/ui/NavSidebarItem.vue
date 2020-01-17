<template>
  <router-link :to="route" class="router-link">
    <div class="side-nav-item">
      <div class="icon">
        <slot name="icon"></slot>
      </div>
      <div class="title">
        {{ title }}
      </div>
      <div class="spacer"></div>
      <div class="count" :style="[{ opacity: count ? '' : 0 }]">
        <span class="badge badge-secondary badge-pill">{{ count }}</span>
      </div>
      <slot name="right"></slot>
    </div>
  </router-link>
</template>

<script>
export default {
  name: "SideNavItem",

  props: {
    title: {
      type: String,
      required: true
    },
    route: {
      type: Object | String,
      required: true
    },
    count: {
      type: Number,
      default: 0
    },
    external: {
      type: Boolean,
      default: false
    },
    highlightColor: {
      type: String,
      default: ""
    }
  }
};
</script>

<style lang="scss" scoped>
.side-nav-item {
  display: flex;
  cursor: pointer;
  padding: 0 18px;
  height: 3em;
  align-items: center;

  &:hover {
    background: rgba(0, 0, 0, 0.07);
  }
}

.router-link {
  color: rgba(0, 0, 0, 0.8);

  &:hover {
    text-decoration: none;
  }
}

.icon {
  margin-right: 1rem;
  margin-bottom: 0.1rem;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  color: rgba(0, 0, 0, 0.6);
}

.router-link-active {
  color: $vitu-green;
  font-weight: 500;

  .side-nav-item {
    background: rgba(0, 0, 0, 0.07);
  }

  .icon {
    color: $vitu-green;
  }
}

.title,
.count {
  transition: opacity 0.2s ease;
  transition-delay: 0.05s;
}
</style>
