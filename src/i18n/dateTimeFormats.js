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
    }
  }
};

export default dateTimeFormats;
