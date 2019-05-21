<template>
  <div class="home">
    <Navbar />
    <div class="container-fluid info-header" v-if="demo">
      <i18n path="demo.welcome">
        <a href="https://molit.eu/projekte/vitu/" place="url" target="_blank">molit.eu/projekte/vitu</a>
      </i18n>
    </div>
    <div class="container-fluid">
      <div class="grid">
        <link-tile :title="$tc('worklist.worklist', 1)" class="link-tile" route="worklist">
          <template slot="header">
            <div class="link-tile-icon">
              <clipboard-text-icon />
            </div>
          </template>
        </link-tile>
        <link-tile :title="$tc('planner.conferencePlanner', 1)" class="link-tile" route="planner">
          <template slot="header">
            <div class="link-tile-icon">
              <calendar-range-icon />
            </div>
          </template>
        </link-tile>
        <link-tile :title="$tc('conference.videoConference', 1)" class="link-tile" route="conference">
          <template slot="header">
            <div class="link-tile-icon">
              <message-video-icon />
            </div>
          </template>
        </link-tile>
        <link-tile :title="$tc('documentation.documentation', 1)" class="link-tile" route="documentation">
          <template slot="header">
            <div class="link-tile-icon">
              <folder-account-icon />
            </div>
          </template>
        </link-tile>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar";
import LinkTile from "@/components/LinkTile";
import ClipboardTextIcon from "vue-material-design-icons/ClipboardText";
import CalendarRangeIcon from "vue-material-design-icons/CalendarRange";
import MessageVideoIcon from "vue-material-design-icons/MessageVideo";
import FolderAccountIcon from "vue-material-design-icons/FolderAccount";

import config from "../config/config";

export default {
  name: "home",

  computed: {
    demo() {
      return config.DEMO;
    }
  },

  components: {
    Navbar,
    LinkTile,
    ClipboardTextIcon,
    CalendarRangeIcon,
    MessageVideoIcon,
    FolderAccountIcon
  }
};
</script>

<style lang="scss" scoped>
.home {
  background: linear-gradient($vitu-angle, $vitu-green 0%, $vitu-light-green 100%);
  min-height: 100vh;
}

.link-tile {
  color: $vitu-blue;
  font-size: 1.5rem;
  line-height: 1.15;
  font-weight: 600;
}

.link-tile-icon {
  color: map-get($theme-colors, "primary");
  font-size: 4.4rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15em, 15em));
  grid-gap: 2rem;
  justify-content: center;
  margin-top: 2rem;
}
</style>
