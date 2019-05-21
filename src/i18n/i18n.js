import Vue from "vue";
import VueI18n from "vue-i18n";
import de from "./de";
import en from "./en";
import dateTimeFormats from "./dateTimeFormats";

const locale = localStorage.getItem("locale") ? localStorage.getItem("locale").toLowerCase() : "de";

const messages = {
  de,
  en
};

Vue.use(VueI18n);

export default new VueI18n({
  locale,
  messages,
  dateTimeFormats
});
