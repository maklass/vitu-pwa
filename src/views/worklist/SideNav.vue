<template>
  <nav-sidebar top="60px" class="side-nav" :collapsible="true" :collapseText="$t('collapse')" contentClass="worklist-main">
    <nav-sidebar-header :title="$tc('worklist.worklist', 1)" :route="{ name: 'worklist' }">
      <template slot="icon">
        <div class="nav-header-icon">
          <clipboard-text-icon />
        </div>
      </template>
    </nav-sidebar-header>
    <nav-sidebar-item :title="$tc('worklist.worklist', 1)" :route="{ name: 'clinical-cases' }">
      <template #icon>
        <clipboard-text-icon />
      </template>
    </nav-sidebar-item>
    <nav-sidebar-item :title="$tc('worklist.patient', 2)" :route="{ name: 'patients' }">
      <template #icon>
        <account-icon />
      </template>
    </nav-sidebar-item>
    <nav-sidebar-item :title="$tc('upload', 1)" :route="{ name: 'temp-upload' }">
      <template #icon>
        <file-upload-icon />
      </template>
    </nav-sidebar-item>
  </nav-sidebar>
</template>

<script>
import NavSidebar from "@/components/ui/NavSidebar";
import NavSidebarHeader from "@/components/ui/NavSidebarHeader";
import NavSidebarItem from "@/components/ui/NavSidebarItem";
import AccountIcon from "vue-material-design-icons/Account";
import ClipboardTextIcon from "vue-material-design-icons/ClipboardText";
import FileUploadIcon from "vue-material-design-icons/FileUpload";

export default {
  components: {
    AccountIcon,
    ClipboardTextIcon,
    FileUploadIcon,
    NavSidebar,
    NavSidebarHeader,
    NavSidebarItem
  }
};
</script>

<style lang="scss" scoped>
.side-nav {
  background: $vitu-background;
}

.nav-header-icon {
  background: white;
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.15);
  padding-bottom: 0.1rem;
  color: rgba(0, 0, 0, 0.5);
  margin-left: -0.2rem;
}
</style>
