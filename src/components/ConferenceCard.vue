<template>
  <div @click="$emit('click')" class="card conference-card">
    <div class="headline text-muted">
      <div v-if="conference.tumorConference">{{ conference.tumorConference.description }}</div>
      <div v-if="!conference.tumorConference">{{ conference.description }}</div>
      <div v-if="conference.tumorConference && conference.tumorConference.date">{{ $d(new Date(conference.tumorConference.date), "long") }}</div>
    </div>
    <div class="spacer" />
    <div class="conference-card-footer">
      <div class="icon">
        <slot name="icon" />
      </div>
      <div class="cases" v-if="showEntries">
        <div class="count" v-if="conference.tumorConference">{{ conference.tumorConference.entries.length }}</div>
        <div v-if="conference.tumorConference">{{ $tc("planner.casesAssigned", conference.tumorConference.entries.length) }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    conference: {
      type: Object,
      required: true
    },

    showEntries: {
      type: Boolean,
      default: true
    }
  }
};
</script>

<style lang="scss" scoped>
.conference-card {
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  cursor: pointer;
  background: white;
  min-height: 8rem;

  .icon {
    color: map-get($theme-colors, "primary");
    font-size: 2.25rem;
  }

  .headline {
    font-weight: bold;
    font-size: initial;
    color: map-get($theme-colors, "primary");
  }

  .conference-card-footer {
    display: flex;

    .icon {
      align-self: flex-end;
      font-size: 1.5rem;
    }

    .cases {
      text-align: right;
      flex: 1;

      color: map-get($theme-colors, "primary");
      .count {
        font-size: 1.5rem;
        font-weight: bold;
      }
    }
  }
}
</style>
