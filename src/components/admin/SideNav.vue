<template>
  <nav-sidebar top="60px" class="side-nav" :collapsible="true" :collapseText="$t('collapse')" contentClass="admin-main">
    <nav-sidebar-header :title="$t('admin.adminArea')" :route="{ name: 'admin' }">
      <template #icon>
        <div class="nav-header-icon">
          <wrench-icon />
        </div>
      </template>
    </nav-sidebar-header>
    <nav-sidebar-item :title="$tc('admin.user', 1)" :route="{ name: 'users' }">
      <template #icon>
        <account-icon />
      </template>
    </nav-sidebar-item>
    <nav-sidebar-item :title="$tc('admin.organization', 2)" :route="{ name: 'organizations' }">
      <template #icon>
        <bank-icon />
      </template>
    </nav-sidebar-item>
    <nav-sidebar-item :title="$tc('conference.conference', 1)" :route="{ name: 'conference-settings' }">
      <template #icon>
        <message-video-icon />
      </template>
    </nav-sidebar-item>
    <nav-sidebar-item :title="$tc('admin.statusList', 1)" :route="{ name: 'statuses' }">
      <template #icon>
        <clipboard-text-icon />
      </template>
    </nav-sidebar-item>
    <nav-sidebar-item :title="$t('auditLog')" :route="{ name: 'auditevents' }">
      <template #icon>
        <document-search-icon />
      </template>
    </nav-sidebar-item>
  </nav-sidebar>
</template>

<script>
import NavSidebar from "@/components/ui/NavSidebar";
import NavSidebarHeader from "@/components/ui/NavSidebarHeader";
import NavSidebarItem from "@/components/ui/NavSidebarItem";
import DocumentSearchIcon from "vue-material-design-icons/FileDocumentOutline";
import AccountIcon from "vue-material-design-icons/Account";
import BankIcon from "vue-material-design-icons/Bank";
import ClipboardTextIcon from "vue-material-design-icons/ClipboardText";
import MessageVideoIcon from "vue-material-design-icons/MessageVideo";
import WrenchIcon from "vue-material-design-icons/Wrench";

export default {
  components: {
    BankIcon,
    AccountIcon,
    DocumentSearchIcon,
    ClipboardTextIcon,
    MessageVideoIcon,
    NavSidebar,
    NavSidebarHeader,
    NavSidebarItem,
    WrenchIcon
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
