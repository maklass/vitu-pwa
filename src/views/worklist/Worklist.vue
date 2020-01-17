<template>
  <div class="worklist">
    <main class="worklist-main">
      <router-view />
    </main>
  </div>
</template>

<script>
import SideNav from "@/components/admin/SideNav";

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
</style>
