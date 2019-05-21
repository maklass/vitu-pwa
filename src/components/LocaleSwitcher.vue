<template>
  <b-nav-item-dropdown :text="locale" right>
    <b-dropdown-item v-for="language in languages" :key="language" @click="switchLocale(language)">{{ language }}</b-dropdown-item>
  </b-nav-item-dropdown>
</template>

<script>
export default {
  name: "LocaleSwitcher",
  computed: {
    locale() {
      return this.$i18n.locale.toUpperCase();
    },
    languages() {
      return Object.keys(this.$i18n.messages).map(l => l.toUpperCase());
    }
  },
  methods: {
    switchLocale(locale) {
      if (locale && this.languages.includes(locale)) {
        this.$i18n.locale = locale.toLowerCase();
        localStorage.setItem("locale", this.$i18n.locale);
      }
    }
  }
};
</script>
