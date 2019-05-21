<template>
  <div>
    <b-card no-body class="tab-container">
      <b-tabs card class="tabs" v-model="tabIndex" justified>
        <b-tab active class="tab-pane">
          <template slot="title">
            <account-multiple-icon class="tab-icon" />
          </template>
          <participant-list :participants="participants" />
        </b-tab>
        <b-tab class="tab-pane" :title-link-class="{ update_trigger_hack: '' }">
          <template slot="title">
            <forum-icon class="tab-icon" />
            <sup v-if="newMessages > 0">
              <b-badge variant="danger">{{ newMessages }}</b-badge>
            </sup>
          </template>
          <chat :messages="messages" :visible="tabIndex === 1" @message="onownmessage" @startTyping="sendStartTyping" @endTyping="sendStopTyping" :subject="subject" :typingText="typingText" />
        </b-tab>
        <b-tab class="tab-pane">
          <template slot="title">
            <format-list-checkbox-icon class="tab-icon" />
          </template>
          <div class="cases-panel">
            <div v-if="demo">
              <div>
                1. Maxi Musterfrau
              </div>
              <div>
                2. Martin Mustermann
              </div>
            </div>
            <div v-else v-for="(entry, index) in entries" :key="entry.id">{{ index + 1 }} {{ entry.patient.firstName }} {{ entry.patient.lastName }}</div>
          </div>
        </b-tab>
        <b-tab class="tab-pane" v-if="keycloak.hasRealmRole('vitu-moderator')">
          <template slot="title">
            <wrench-icon class="tab-icon" />
          </template>
          <div class="moderator-panel">
            <button v-if="!screenShared" class="btn btn-primary" @click="onShareScreen">
              {{ $t("conference.shareScreen") }}
            </button>
            <button v-else class="btn btn-primary" @click="onUnshareScreen">
              {{ $t("conference.unshareScreen") }}
            </button>
          </div>
        </b-tab>
      </b-tabs>
    </b-card>
  </div>
</template>

<script>
import { mapState } from "vuex";
import AccountMultipleIcon from "vue-material-design-icons/AccountMultiple";
import ForumIcon from "vue-material-design-icons/Forum";
import WrenchIcon from "vue-material-design-icons/Wrench";
import FormatListCheckboxIcon from "vue-material-design-icons/FormatListCheckbox";
import Chat from "./Chat";
import ParticipantList from "./ParticipantList";
import { setTimeout } from "timers";
import config from "../config/config";

export default {
  props: {
    entries: {
      type: Array,
      default() {
        return [];
      }
    },
    room: {
      type: Number
    }
  },

  data() {
    return {
      connection: null,
      connected: false,
      socketUrl: `${config.WEBSOCKET_URL}/message/${this.room}`,
      messages: [],
      newMessages: 0,
      participants: [],
      tabIndex: 0,
      pingInterval: 30000,
      pingIntervalHandle: null,
      typingText: "",
      screenShared: false
    };
  },

  computed: {
    ...mapState({
      token: state => state.authentication.keycloak.token,
      fullUserName: state => state.authentication.keycloak.idTokenParsed.name,
      subject: state => state.authentication.keycloak.subject,
      keycloak: state => state.authentication.keycloak
    }),

    demo() {
      return config.DEMO;
    }
  },

  methods: {
    sendMessage(message) {
      this.connection.send(
        JSON.stringify({
          type: "MESSAGE",
          message
        })
      );
    },

    sendStartTyping() {
      this.connection.send(
        JSON.stringify({
          type: "TYPING_START"
        })
      );
    },

    sendStopTyping() {
      this.connection.send(
        JSON.stringify({
          type: "TYPING_STOP"
        })
      );
    },

    ping() {
      this.connection.send(
        JSON.stringify({
          type: "PING"
        })
      );
    },

    connect() {
      let params = new URLSearchParams();
      if (this.token) {
        params.append("access_token", this.token);
      }
      this.connection = new WebSocket(`${this.socketUrl}?${params}`);
      this.connection.onopen = this.onopen;
      this.connection.onclose = this.onclose;
      this.connection.onmessage = this.onmessage;
      this.connection.onerror = this.onerror;
    },

    onownmessage(message) {
      this.sendMessage(message);
    },

    onopen() {
      this.connected = true;
    },

    onclose() {
      this.connected = false;
      setTimeout(this.connect, 1000);
    },

    onmessage(e) {
      let message = JSON.parse(e.data);

      switch (message.type) {
        case "MESSAGE":
          this.messages.push(message);
          if (this.tabIndex !== 1) {
            this.newMessages++;
          }
          break;
        case "PARTICIPANT_LIST":
          this.participants = message.payload;
          break;
        case "TYPING_START":
          if (message.fromId !== this.subject) {
            this.typingText = message.from;
          }
          break;
        case "ERROR":
          throw new Error(message.payload);
      }
    },

    onerror(error) {
      console.error("WebSocket Error ", error);
      throw new Error(error);
    },

    onShareScreen() {
      this.$emit("shareScreen");
      this.screenShared = true;
    },

    onUnshareScreen() {
      this.$emit("unshareScreen");
      this.screenShared = false;
    }
  },

  mounted() {
    this.connect();
  },

  beforeDestroy() {
    if (this.connection) {
      console.log("Closing Socket connection");
      clearInterval(this.pingIntervalHandle);
      this.connection.onclose = () => {};
      this.connection.close();
    }
  },

  watch: {
    tabIndex(newValue) {
      if (newValue === 1) {
        this.newMessages = 0;
      }
    }
  },

  components: {
    AccountMultipleIcon,
    Chat,
    FormatListCheckboxIcon,
    ForumIcon,
    ParticipantList,
    WrenchIcon
  }
};
</script>

<style lang="scss" scoped>
.tab-icon {
  font-size: 1.2rem;
}

.tabs {
  display: flex;
  flex-direction: column;
}

.tab-pane {
  margin: 0;
  padding: 0;
}

.tab-pane,
.tabs,
.tab-container {
  height: 100%;
}

.moderator-panel {
  padding: 15px;
}

.cases-panel {
  padding: 15px;
}
</style>

<style lang="scss">
.tab-container {
  .card-header {
    background: white;
  }

  .tab-content {
    flex: 1;
    overflow: hidden;
  }
}
</style>