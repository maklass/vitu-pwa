const dateTimeFormats = {
  de: {
    long: {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: false
    },

    time: {
      hour: "numeric",
      minute: "numeric",
      hour12: false
    },

    weekdayAndTime: {
      hour: "numeric",
      minute: "numeric",
      hour12: false,
      weekday: "long"
    }
  },
  en: {
    long: {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true
    },

    time: {
      hour: "numeric",
      minute: "numeric",
      hour12: true
    },

    weekdayAndTime: {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      weekday: "long"
    }
  }
};

export default dateTimeFormats;
