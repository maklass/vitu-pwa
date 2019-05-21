<template>
  <div class="item">
    <div class="icon">
      <slot name="icon"></slot>
    </div>
    <div class="title">
      {{ title }}
    </div>
    <div class="spacer"></div>
    <!-- <div class="count" :style="[{opacity: count ? '' : 0}]">
        <span class="badge badge-secondary badge-pill">{{count}}</span>
      </div> -->
  </div>
</template>

<script>
export default {
  name: "ParticipantItem",

  props: {
    title: {
      type: String,
      required: true
    }
  }
};
</script>

<style lang="scss" scoped>
.item {
  display: flex;
  padding: 0;
  height: 3em;
  align-items: center;
}

.icon {
  color: rgba(0, 0, 0, 0.6);
  margin-right: 0.5em;
  font-size: 1.4em;
}

.title {
  transition: opacity 0.2s ease;
  transition-delay: 0.05s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
