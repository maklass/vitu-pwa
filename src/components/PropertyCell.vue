<template>
  <div class="cell">
    <div class="title" :style="{ color: this.color }">{{ title }}</div>
    <div class="value" style="white-space: pre-wrap">{{ value }}</div>
  </div>
</template>

<script>
export default {
  name: "PropertyCell",
  props: {
    title: {
      type: String,
      default: "-"
    },
    value: {
      default: "-"
    },
    color: {
      type: String,
      default: "#004a6b"
    }
  }
};
</script>

<style lang="scss" scoped>
.cell {
  border: 1px solid #dee2e6;
  margin: 0 -1px -1px 0;
  padding: 0.5rem;
}

.title {
  margin-bottom: 1rem;
  font-weight: bold;
}

.value {
  font-style: italic;
  font-weight: bold;
  color: #777;
}
</style>
