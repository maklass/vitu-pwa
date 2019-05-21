<template>
  <div>
    <b-container fluid>
      <h3>{{ $t("notes") }}</h3>
    </b-container>
    <div class="notes">{{ notes }}</div>
  </div>
</template>

<script>
export default {
  props: {
    notes: null,
    type: String
  }
};
</script>

<style lang="scss" scoped>
.notes {
  background: white;
  padding: 15px;
}
</style>
