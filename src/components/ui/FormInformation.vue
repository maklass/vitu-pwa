<template>
  <div class="form-information">
    <div><information-outline-icon class="information-icon" /></div>
    <div>{{ text }}</div>
  </div>
</template>

<script>
import InformationOutlineIcon from "vue-material-design-icons/InformationOutline";

export default {
  props: {
    text: {
      type: String
    }
  },

  components: {
    InformationOutlineIcon
  }
};
</script>

<style lang="scss" scoped>
.form-information {
  display: flex;
  align-items: flex-start;
  background: lighten($vitu-background, 3.5%);
  padding: 0.4rem 0.4rem;
  margin-bottom: 1rem;
}

.information-icon {
  font-size: 18px;
  margin-right: 0.5rem;
}
</style>
