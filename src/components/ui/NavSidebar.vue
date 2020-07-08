<template>
  <nav :class="['nav', 'flex-column', { collapsed }]" :style="{ top, width }">
    <div class="nav-inner">
      <slot></slot>
      <div style="flex: 1" v-if="collapsible"></div>
      <div role="separator" class="divider" v-if="collapsible"></div>
      <nav-sidebar-collapse-item :title="collapseText" @click="toggleCollapse" v-if="collapsible">
        <template slot="icon">
          <div class="side-nav-collapse-icon">
            <chevron-left-icon />
          </div>
        </template>
      </nav-sidebar-collapse-item>
    </div>
  </nav>
</template>

<script>
import NavSidebarCollapseItem from "./NavSidebarCollapseItem";
import ChevronLeftIcon from "vue-material-design-icons/ChevronLeft";

export default {
  props: {
    top: {
      type: String,
      default: "0"
    },
    collapsible: {
      type: Boolean,
      default: false
    },
    collapseText: {
      type: String,
      default: "Collapse"
    },
    width: {
      type: String,
      default: "260px"
    },
    smallWidth: {
      type: String,
      default: "60px"
    },
    contentClass: {
      type: String
    }
  },

  data() {
    return {
      collapsed: false,
      small: false,
      mql: window.matchMedia("(max-width: 767px)"),
      contentTransition: "margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
    };
  },

  methods: {
    initializeContentClass() {
      let content = document.querySelector(`.${this.contentClass}`);
      if (content) {
        if (this.small) {
          content.style["margin-left"] = this.smallWidth;
        } else {
          content.style["margin-left"] = this.width;
        }
        this.$nextTick(() => (content.style["transition"] = this.contentTransition));
      }
    },

    collapseSidebar() {
      let content = document.querySelector(`.${this.contentClass}`);
      if (content) {
        content.style["margin-left"] = this.smallWidth;
      }
    },

    unfoldSidebar() {
      let content = document.querySelector(`.${this.contentClass}`);
      if (content) {
        content.style["margin-left"] = this.width;
      }
    },

    toggleCollapse() {
      this.collapsed = !this.collapsed;
      if (!this.small && !this.collapsed) {
        this.unfoldSidebar();
      } else {
        this.collapseSidebar();
      }
    },

    mediaChanged(e) {
      if (e.matches) {
        this.collapsed = true;
        this.small = true;
        this.collapseSidebar();
      } else {
        this.collapsed = false;
        this.small = false;
        this.unfoldSidebar();
      }
    },

    initializeMatchMediaListener() {
      if (this.mql.matches) {
        this.collapsed = true;
        this.small = true;
      } else {
        this.collapsed = false;
        this.small = false;
      }

      this.mql.addListener(this.mediaChanged);
    },

    removeMatchMediaListener() {
      if (this.mql) {
        this.mql.removeListener(this.mediaChanged);
      }
    }
  },

  created() {
    if (this.collapsible) {
      this.initializeMatchMediaListener();
    }
  },

  mounted() {
    this.initializeContentClass();
  },

  destroyed() {
    if (this.collapsible) {
      this.removeMatchMediaListener();
    }
  },

  components: {
    ChevronLeftIcon,
    NavSidebarCollapseItem
  }
};
</script>

<style lang="scss" scoped>
.nav {
  position: fixed;
  bottom: 0;
  overflow-x: hidden;
  overflow-y: hidden;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
}

.nav-inner {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.side-nav-collapse-icon {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
}

.collapsed {
  width: $navbar-height !important;
}

.divider {
  height: 0;
  overflow: hidden;
  border-top: 1px solid rgba(0, 0, 0, 0.15);
}
</style>

<style lang="scss">
.collapsed {
  .side-nav-collapse-icon {
    transform: rotate(180deg);
  }

  .title,
  .count {
    opacity: 0;
  }
}
</style>
