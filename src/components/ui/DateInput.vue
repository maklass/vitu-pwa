<template>
  <div>
    <div class="input date-input">
      <b-form-group :style="dayProps" :invalid-feedback="invalidDayFeedback">
        <b-form-input id="day" :state="dayState" class="form-control day" type="text" maxlength="2" @input="select" :placeholder="dayPlaceholder" v-model="day" />
      </b-form-group>
      <b-form-group :style="monthProps" :invalid-feedback="invalidMonthFeedback">
        <b-form-input id="month" :state="monthState" class="form-control month" type="text" maxlength="2" @input="select" :placeholder="monthPlaceholder" v-model="month" />
      </b-form-group>
      <b-form-group :style="yearProps" :invalid-feedback="invalidYearFeedback">
        <b-form-input id="year" :state="yearState" class="form-control" type="text" maxlength="4" @input="select" :placeholder="yearPlaceholder" :required="required" v-model="year" />
      </b-form-group>
      <label v-if="feedback" :class="[{ 'no-display': dateValid }]" class="invalidDate col-form-label">{{ $t("dateInput.error.dateNotValid") }}</label>
    </div>
  </div>
</template>

<script>
import moment from "moment";

export default {
  props: {
    value: {
      type: String
    },
    validation: {
      type: Boolean,
      default: true
    },
    feedback: {
      type: Boolean,
      default: true
    },
    dayPlaceholder: {
      type: String,
      default: "Day"
    },
    monthPlaceholder: {
      type: String,
      default: "Month"
    },
    yearPlaceholder: {
      type: String,
      default: "Year"
    },
    maxWidthYear: {
      type: String,
      default: "100"
    },
    maxWidthMonth: {
      type: String,
      default: "75"
    },
    maxWidthDay: {
      type: String,
      default: "75"
    },
    margin: {
      type: String,
      default: "10"
    },
    required: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      day: null,
      month: null,
      year: null,
      regDay: new RegExp("^([0-2]?[1-9]|3[01]|10|20)$"),
      regMonth: new RegExp("^([0-1]?[1-9]|1[012])$"),
      regYear: new RegExp("(^[0][1-9]+)|([1-9]\\d*)$")
    };
  },

  computed: {
    yearValid() {
      if (this.year && isNaN(this.year)) {
        return false;
      }
      return this.regYear.test(this.year);
    },
    monthValid() {
      if (this.month && isNaN(this.month)) {
        return false;
      }
      return this.regMonth.test(this.month);
    },
    dayValid() {
      if (isNaN(this.day && this.day)) {
        return false;
      }
      return this.regDay.test(this.day);
    },
    dateValid() {
      if (this.day && this.month && this.year) {
        return this.validateDate(this.year, this.month, this.day);
      }
      return true;
    },
    yearState() {
      if (this.validation) {
        if (!this.dateValid) {
          return false;
        }
        if ((((this.day && this.dayValid) || (this.month && this.monthValid)) && !this.year) || (this.year && !this.yearValid)) {
          return false;
        } else if (this.year && this.yearValid) {
          return true;
        }
      }
      return null;
    },
    monthState() {
      if (this.validation) {
        if (!this.dateValid) {
          return false;
        }
        if ((this.day && this.dayValid && !this.month) || (this.month && !this.monthValid)) {
          return false;
        } else if (this.month && this.monthValid) {
          return true;
        }
      }
      return null;
    },
    dayState() {
      if (this.validation) {
        if (!this.dateValid) {
          return false;
        }
        if (this.day && !this.dayValid) {
          return false;
        } else if (this.day && this.dayValid) {
          return true;
        }
      }
      return null;
    },
    invalidYearFeedback() {
      if (this.feedback) {
        if (!this.dateValid) {
          return "";
        }
        if (isNaN(this.year)) {
          return this.$t("dateInput.error.notANumber");
        }
        if (this.day || this.month) {
          return this.$t("dateInput.error.yearNeeded");
        }
        return this.$t("dateInput.error.title");
      } else {
        return "";
      }
    },
    invalidMonthFeedback() {
      if (this.feedback) {
        if (!this.dateValid) {
          return "";
        }
        if (isNaN(this.month)) {
          return this.$t("dateInput.error.notANumber");
        }
        if (this.day) {
          return this.$t("dateInput.error.monthNeeded");
        }
        return this.$t("dateInput.error.title");
      } else {
        return "";
      }
    },
    invalidDayFeedback() {
      if (this.feedback) {
        if (!this.dateValid) {
          return "";
        }
        if (isNaN(this.day)) {
          return this.$t("dateInput.error.notANumber");
        }
        return this.$t("dateInput.error.title");
      } else {
        return "";
      }
    },
    yearProps() {
      return {
        "margin-right": this.margin + "px",
        "max-width": this.maxWidthYear + "px"
      };
    },
    monthProps() {
      return {
        "margin-right": this.margin + "px",
        "max-width": this.maxWidthMonth + "px"
      };
    },
    dayProps() {
      return {
        "margin-right": this.margin + "px",
        "max-width": this.maxWidthDay + "px"
      };
    }
  },

  methods: {
    /**
     * Method called when a input field reports changes
     */
    select() {
      let fullDate = null;
      if (this.yearValid && !this.monthValid && !this.dayValid) {
        fullDate = this.year;
        this.$emit("input", fullDate);
      } else if (this.yearValid && this.monthValid && !this.dayValid) {
        fullDate = this.year + "-" + this.month;
        this.$emit("input", fullDate);
      } else if (this.validateDate(this.year, this.month, this.day) && this.yearValid && this.monthValid && this.dayValid) {
        fullDate = this.year + "-" + this.month + "-" + this.day;
        this.$emit("input", fullDate);
      } else {
        this.$emit("input", null);
      }
    },

    /**
     * Validates if the selected date is valid.
     * @returns true if valid, false if invalid
     */
    validateDate(year, month, day) {
      if (year && month && day) {
        try {
          let date = new Date(year + "-" + month + "-" + day);
          date = moment(date).format();
          if (moment(date).format("YYYY") === year && parseInt(moment(date).format("MM")) === parseInt(month) && parseInt(moment(date).format("DD")) === parseInt(day)) {
            return true;
          }
          return false;
        } catch (error) {
          return false;
        }
      }
    }
  },
  created() {
    if (this.value) {
      let givenDate = new Date(this.value);
      this.day = moment(givenDate).format("DD");
      this.month = moment(givenDate).format("MM");
      this.year = moment(givenDate).format("YYYY");
    }
  }
};
</script>

<style lang="scss" scoped>
.invalidDate {
  color: #ff4136;
  // font-size: 12.8px;
}

.input {
  display: flex;
}

.no-display {
  display: none;
}
</style>

<style lang="scss">
.date-input {
  .form-group {
    margin-bottom: 0;
  }

  > fieldset.form-group:nth-child(3) {
    margin-right: 0 !important;
  }
}
</style>
