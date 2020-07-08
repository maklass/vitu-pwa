const ADDITIONAL_HEIGHT = 2;

export default {
  methods: {
    mixin_autoResize_resize_by_event(event) {
      this.mixin_autoResize_resize(event.target);
    },

    mixin_autoResize_resize(el) {
      if (!el) {
        return;
      }

      el.style.height = "auto";
      el.style.height = `${el.scrollHeight + ADDITIONAL_HEIGHT}px`;
    }
  }
};
