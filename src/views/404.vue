<template>
  <div>
    <navbar-login />
    <div class="container">
      <div class="title">
        404
      </div>
      <div class="subtitle">
        {{ $t("error.pageNotFound") }}
      </div>
      <div class="description">
        {{ $t("error.pageNotFoundDescription") }}
      </div>
      <div class="button-panel">
        <router-link tag="button" :to="{ name: 'home' }" class="btn btn-primary">{{ $t("home.backToHome") }}</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import NavbarLogin from "@/components/NavbarLogin";

export default {
  components: {
    NavbarLogin
  }
};
</script>

<style lang="scss" scoped>
.title {
  font-size: 5rem;
  text-align: center;
  font-weight: 100;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 0.5rem;
}

.description {
  text-align: center;
  margin-bottom: 1rem;
}

.button-panel {
  text-align: center;
}
</style>
