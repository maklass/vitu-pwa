<template>
  <div class="admin">
    <side-nav />
    <main class="admin-main">
      <router-view />
    </main>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar";
import SideNav from "@/components/admin/SideNav";

export default {
  components: {
    Navbar,
    SideNav
  }
};
</script>

<style lang="scss" scoped>
.admin {
  background: white;
  flex: 1;
}

.admin-main {
  margin-left: 260px;
}
</style>
