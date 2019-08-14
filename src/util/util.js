/**
 * Helper function to stringify the values of an Object
 *
 * @param value - the value to be stringified
 * @returns {String} - the stringified value
 */
export const toString = value => {
  if (value === null || typeof value === "undefined") {
    return "";
  } else if (value instanceof Object) {
    return Object.keys(value)
      .sort()
      .map(key => toString(value[key]))
      .join(" ");
  } else {
    return String(value);
  }
};
