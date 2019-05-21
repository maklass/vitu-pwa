<template>
  <div class="participant-list">
    <participant-item v-for="participant in participants" :key="participant.userId" :title="participant.name">
      <template slot="icon">
        <div class="side-nav-collapse-icon">
          <account-circle-icon />
        </div>
      </template>
    </participant-item>
  </div>
</template>

<script>
import ParticipantItem from "./ParticipantItem";
import AccountCircleIcon from "vue-material-design-icons/AccountCircle";

export default {
  props: {
    participants: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  components: {
    AccountCircleIcon,
    ParticipantItem
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
</style>
