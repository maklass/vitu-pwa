<template>
  <div class="list-item" @click="$emit('click')">
    <div class="avatar">
      <slot name="icon" />
    </div>
    <div class="information">
      <div class="title">{{ title }}</div>
      <div class="subtitle">{{ subtitle }}</div>
    </div>
    <div class="actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String
    }
  }
};
</script>

<style lang="scss" scoped>
.list-item {
  display: flex;
  align-items: center;
  padding: 0.4rem 0;

  .avatar {
    padding-top: 0.1rem;
    margin-right: 1rem;
    min-width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .information {
    line-height: 1.2;
    flex: 1;
  }

  .subtitle {
    color: rgba(0, 0, 0, 0.5);
  }
}
</style>
