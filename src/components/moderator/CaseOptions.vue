<template>
  <div class="pt-3">
    <form ref="form" autocomplete="off" v-on:submit.prevent="onSubmit">
      <fieldset>
        <div class="form-group form-row">
          <label class="col-md-3 col-form-label" for="status">{{ $t("worklist.status") }}*</label>
          <div class="col-md-9">
            <select required id="status" class="form-control" v-model="status">
              <option selected disabled :value="null">{{ $t("pleaseSelect") }}</option>
              <option v-for="(status, index) in statuses" :key="status.code" :value="status">{{ index + 1 + " - " + status.display }}</option>
            </select>
          </div>
        </div>
        <div class="form-group form-row" v-if="status && status.code === 'cancelled'">
          <label class="col-md-3 col-form-label" for="reasonForCancellation">{{ $t("worklist.reasonForCancellation") }}*</label>
          <div class="col-md-9">
            <select class="form-control" id="reasonForCancellation" v-model="reasonForCancellation">
              <option selected disabled :value="null">{{ $t("pleaseSelect") }}</option>
              <option v-for="reason in reasonsForCancellation" :key="reason.code" :value="reason.code">{{ reason.display }}</option>
            </select>
          </div>
        </div>
        <div class="form-group form-row" v-if="status && status.code === 'cancelled' && reasonForCancellation === 'other'">
          <label class="col-md-3 col-form-label" for="reasonForCancellationOther">{{ $t("worklist.reasonCode.other") }}*</label>
          <div class="col-md-9">
            <input required id="reasonForCancellationOther" type="text" class="form-control" :placeholder="$t('worklist.reasonCode.other')" v-model="reasonForCancellationOther" />
          </div>
        </div>
      </fieldset>
    </form>
    <div class="page-footer">
      <div class="spacer"></div>
      <button class="btn btn-primary" @click="onSubmit">{{ $t("admin.save") }}</button>
    </div>
  </div>
</template>

<script>
import { get } from "lodash";

export default {
  props: {
    task: {
      type: Object,
      required: true
    },

    statuses: {
      type: Array,
      required: true
    },

    reasonsForCancellation: {
      type: Array,
      required: true
    }
  },

  data() {
    return {
      reasonForCancellation: null,
      reasonForCancellationOther: null,
      status: null
    };
  },

  methods: {
    onSubmit() {
      if (this.$refs.form && !this.$refs.form.checkValidity()) {
        this.$refs.form.reportValidity();
        return;
      }

      this.$emit("updateTask", this.task, this.status, this.reasonForCancellation, this.reasonForCancellationOther);
    },

    getStatusByCode(code) {
      if (!code || !this.statuses) {
        return null;
      }

      return this.statuses.find(s => s.code === code);
    }
  },

  mounted() {
    this.status = this.getStatusByCode(get(this.task, "businessStatus.coding[0].code", null));
    this.reasonForCancellation = get(this.task, "extension[0].extension[0].valueCodeableConcept.coding[0].code", null);
    this.reasonForCancellationOther = get(this.task, "extension[0].extension[1].valueString", null);
  }
};
</script>

<style lang="scss" scoped></style>
