<template>
  <div class="participant-list">
    <participant-item v-for="participant in sortedParticipants" :key="participant.id" :title="participant.name" :class="{ speaking: participant.speaking }">
      <template slot="icon">
        <div class="side-nav-collapse-icon">
          <volume-high-icon title="" class="speaking" v-if="participant.speaking" />
          <account-circle-icon title="" v-else />
        </div>
      </template>
    </participant-item>
  </div>
</template>

<script>
import ParticipantItem from "./ParticipantItem";
import AccountCircleIcon from "vue-material-design-icons/AccountCircle";
import VolumeHighIcon from "vue-material-design-icons/VolumeHigh";

export default {
  props: {
    participants: {
      type: Array,
      default() {
        return [];
      }
    }
  },

  computed: {
    sortedParticipants() {
      if (!this.participants) {
        return [];
      }
      return this.participants
        .slice()
        .sort((a, b) => {
          if (a.name && b.name) {
            return a.name.localeCompare(b.name);
          }
          return 0;
        })
        .map((p, i) => {
          p.id = p.userId + "-" + i;
          return p;
        });
    }
  },

  components: {
    AccountCircleIcon,
    ParticipantItem,
    VolumeHighIcon
  }
};
</script>

<style lang="scss" scoped>
.participant-list {
  width: 100%;
  height: 100%;
  padding: 15px;
  right: 0;
  background: white;
}

.speaking {
  color: $vitu-green;
}
</style>
