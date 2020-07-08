<template>
  <div class="worklist">
    <side-nav />
    <main class="worklist-main">
      <router-view />
    </main>
  </div>
</template>

<script>
import SideNav from "@/views/worklist/SideNav";

export default {
  components: {
    SideNav
  }
};
</script>

<style lang="scss" scoped>
.worklist {
  background: white;
  flex: 1;
}

.worklist-main {
  margin-left: 260px;
}
</style>
