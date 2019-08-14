<template>
  <div class="side-nav-item" @click="$emit('click')">
    <div class="icon">
      <slot name="icon"></slot>
    </div>
    <div class="title">
      {{ title }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true
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
    background: #eee;
  }
}

.icon {
  color: rgba(0, 0, 0, 0.6);
  margin-right: 1rem;
  font-size: 1.4rem;
}

.title {
  transition: opacity 0.2s ease;
  transition-delay: 0.05s;
}
</style>
