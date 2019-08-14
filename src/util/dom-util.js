/**
 * Attempts to show the given element in full screen mode. This will only work, if a user interaction lead to the
 * call of this method.
 *
 * @param {Object} ref - the reference to the DOM object or the Vue.js object that should go in full screen mode
 */
export const toggleFullScreen = ref => {
  if (ref.$el) {
    ref = ref.$el;
  }

  if (ref.requestFullScreen) {
    ref.requestFullScreen();
  } else if (ref.webkitRequestFullScreen) {
    ref.webkitRequestFullScreen();
  } else if (ref.mozRequestFullScreen) {
    ref.mozRequestFullScreen();
  }
};
