<template>
  <div class="login-card container" :style="{ color }">
    <div class="display-3">{{ title }}</div>
    <p class="lead">{{ text }}</p>
    <b-btn :variant="buttonVariant" size="lg" @click="$emit('click')">{{ buttonText }}</b-btn>
  </div>
</template>

<script>
export default {
  name: "LoginCard",
  props: {
    title: {
      type: String,
      default: "Login"
    },
    subtitle: {
      type: String,
      default: ""
    },
    text: {
      type: String,
      default: ""
    },
    buttonText: {
      type: String,
      default: ""
    },
    buttonVariant: {
      type: String,
      default: "outline-light"
    },
    color: {
      type: String,
      default: "white"
    }
  }
};
</script>

<style lang="scss" scoped>
@media screen and (max-width: 768px) {
  body .login-card {
    padding: 10rem 0 5rem;
  }
  .display-3 {
    font-size: 3.5rem;
  }
}
.login-card {
  text-align: center;
  animation: fadeIn 1s, slideIn 0.7s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes slideIn {
  from {
    transform: translate3d(0, 3rem, 0);
  }
  to {
    transform: translate3d(0, 0, 0);
  }
}
</style>
