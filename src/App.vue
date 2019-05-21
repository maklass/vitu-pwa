<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss">
@import "~bootstrap/scss/bootstrap";
@import "~bootstrap-vue/src/index.scss";

:focus {
  outline: none;
}

body {
  background: $vitu-background;
}

.ghost {
  opacity: 0.5;
  // border: 2px dashed $vitu-green;
  // box-shadow: inset 0px 0px 0px 1px map-get($theme-colors, "primary");
}

.spacer {
  flex: 1;
}

.info-header {
  background: $vitu-blue;
  color: #eee;
  padding-top: 0.8rem;
  padding-bottom: 0.8rem;

  a {
    color: #eee;
    font-weight: bold;
  }

  a:hover,
  a:active,
  a:focus {
    color: white;
  }
}

.vdp-datepicker__calendar .cell.selected,
.vdp-datepicker__calendar .cell.selected.highlighted,
.vdp-datepicker__calendar .cell.selected:hover {
  background: map-get($theme-colors, "primary") !important;
  color: white;
}

.vdp-datepicker__calendar .cell:not(.blank):not(.disabled).day:hover,
.vdp-datepicker__calendar .cell:not(.blank):not(.disabled).month:hover,
.vdp-datepicker__calendar .cell:not(.blank):not(.disabled).year:hover {
  border-color: map-get($theme-colors, "secondary") !important;
}

.form-control:focus {
  box-shadow: initial;
  -webkit-box-shadow: initial;
  border-color: map-get($theme-colors, "secondary");
}
</style>
