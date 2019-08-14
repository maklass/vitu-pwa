/**
 * Returns the elements that occur in both array1 and array2.
 *
 * @param {Array} array1 - the first array
 * @param {Array} array2 - the second array
 * @returns {Array} - an array that is the intersection between array1 and array2
 */
export const intersection = (array1, array2) => {
  if (!array1 || !array2) {
    return [];
  }

  return array1.filter(element => array2.includes(element));
};
