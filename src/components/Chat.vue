<template>
  <div class="chat">
    <div class="messages" ref="messages">
      <div v-for="message in messages" :key="message.id" :class="[{ 'message-own': isOwnMessage(message) }, { 'message-other': !isOwnMessage(message) }, 'message-container']">
        <div class="message-metadata">
          <div class="from">{{ message.from }}</div>
          <div class="timestamp text-muted">{{ formatTime(message.timestamp) }}</div>
        </div>
        <div class="message">{{ message.message }}</div>
      </div>
    </div>
    <!-- <div class="text-muted typing-status" v-if="typingText && typingText !== ''">{{ typingText }}&hellip;</div> -->
    <div class="input-panel">
      <div class="form-group">
        <textarea
          autofocus
          class="chat-input form-control"
          v-model="newMessage"
          autocomplete="off"
          spellcheck="true"
          :placeholder="$t('chat.writeMessage')"
          :rows="linesInNewMessage"
          ref="input"
          @keypress.enter="onEnter"
          @keydown="onTyping"
        />
        <i18n path="chat.inputHelp" tag="small" class="form-text input-help">
          <kbd place="enter">Enter</kbd>
          <kbd place="shift">⇧</kbd>
        </i18n>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    messages: {
      type: Array,
      default() {
        return [];
      }
    },

    visible: {
      type: Boolean,
      default: true
    },

    subject: {
      type: String,
      default: ""
    },

    typingText: {
      type: String,
      default: ""
    }
  },

  data() {
    return {
      newMessage: "",
      inputMaxRows: 6,
      typing: false
    };
  },

  computed: {
    linesInNewMessage() {
      if (this.newMessage) {
        return Math.min((this.newMessage.match(/\n/g) || []).length + 1, this.inputMaxRows);
      } else {
        return 1;
      }
    }
  },

  methods: {
    onEnter(event) {
      if (event.shiftKey) {
        this.newMessage += "";
      } else {
        if (this.newMessage && this.newMessage.trim() !== "") {
          this.sendMessage();
          this.newMessage = "";
        }
        event.preventDefault();
      }
    },

    onTyping() {
      this.typing = true;
      this.$emit("startTyping");
    },

    formatTime(timestamp) {
      if (timestamp) {
        return this.$d(new Date(timestamp), "time");
      }
      return timestamp;
    },

    sendMessage() {
      this.$emit("message", this.newMessage);
    },

    isOwnMessage(message) {
      return message.fromId === this.subject;
    }
  },

  watch: {
    messages() {
      this.$nextTick(() => {
        let messages = this.$refs.messages;
        messages.scrollTop = messages.scrollHeight;
      });
    },

    visible(newValue) {
      if (newValue === true) {
        this.$refs.input.focus();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.chat {
  height: 100%;
  width: 100%;
  background: white;
  display: flex;
  flex-direction: column;
}

.from {
  font-weight: bold;
  text-overflow: ellipsis;
  overflow: hidden;
  padding-right: 8px;
  width: 100%;
}

.messages {
  overflow-y: auto;
  white-space: pre-line;
  margin-top: auto;
}

.message {
  line-height: 20px;
}

.message-container.message-own {
  background: $vitu-green;
  color: white;
  margin-left: 45px;

  .text-muted {
    color: #eee !important;
  }
}

.message-container.message-other {
  margin-right: 45px;
}

.message-container {
  margin: 0 15px 15px 15px;
  background: $vitu-background;
  border-radius: 0.25rem;
  padding: 8px;
}

.message-metadata {
  display: flex;
  justify-content: space-between;
  white-space: nowrap;
  font-size: 0.9rem;
}

.chat-input {
  resize: none;
}

.input-panel {
  border-top: 1px solid $border-color;
  padding: 15px;
  background: white;
}

.form-group {
  margin-bottom: 0;
}

.typing-status {
  margin: 4px 15px;
}

.input-help {
  margin-top: 0.3rem;
}

kbd {
  background-color: $vitu-dark-grey;
}
</style>
