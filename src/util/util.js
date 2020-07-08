import DOMPurify from "dompurify";
import generate from "nanoid/generate";
import marked from "marked";

/**
 * Helper function to stringify the values of an Object.
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

/**
 * Adds a colon to the timezone offset of the given date string.
 *
 * @param {String} dateString - the date in ISO date format
 */
export const addColonToISODateString = dateString => {
  if (!dateString) {
    return dateString;
  }
  //add colon to timezone offset
  return dateString.replace(/([+-]\d\d)(\d\d)$/, "$1:$2");
};

/**
 * Generates an id.
 *
 * @param {Number} [length=8] - the length of the id
 * @param {String} [alphabet="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"] - the alphabet to be used for id generation
 * @returns {String} - the generated id
 */
export const generateId = (length = 8, alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ") => {
  return generate(alphabet, length);
};

/**
 * Creates a check digit for the given id and returns it.
 * See: https://wiki.openmrs.org/display/docs/Check+Digit+Algorithm
 *
 * @param {String} id - the id
 * @param {String} [validChars="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"] - the validChars to be used for check digit generation
 * @returns {Number} - the generated check digit
 */
export const luhnCheckDigit = (id, validChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVYWXZ") => {
  if (!id) {
    throw new Error("Id must not be null.");
  }
  id = id.toUpperCase().trim();
  let sum = 0;
  for (let i = 0; i < id.length; i++) {
    let ch = id.charAt(id.length - i - 1);
    if (validChars.indexOf(ch) < 0) {
      throw new Error("Invalid character(s) found!");
    }
    let digit = ch.charCodeAt(0) - 48;
    let weight;
    if (i % 2 == 0) {
      weight = 2 * digit - parseInt(digit / 5) * 9;
    } else {
      weight = digit;
    }
    sum += weight;
  }
  sum = Math.abs(sum) + 10;
  let digit = (10 - (sum % 10)) % 10;
  return digit;
};

/**
 * Generates an id with prefix and check digit.
 *
 * @param {String} [prefix="Z"] - the prefix of the id
 * @param {Number} [length=8] -the length of the generated id (excluding prefix and check digit)
 * @param {String} [alphabet="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"] - the alphabet to be used for id generation
 * @returns {String} - the generated id
 */
export const generateCheckedId = (prefix = "Z", length = 8, alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVYWXZ") => {
  let id = `${prefix}${generateId(length, alphabet)}`;
  id += `${luhnCheckDigit(id, alphabet)}`;
  return id;
};

/**
 * Generates a color based on the given string.
 *
 * @param {String} str - the string
 * @returns {String} - the generated color
 */
export const stringToColor = str => {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).substr(-2);
  }
  return color;
};

/**
 * Creates safe HTML from markdown by using DOMPurify and marked.js.
 *
 * @param {String} markdown - the markdown text
 * @returns {String} - the generated HTML
 */
export const markdownToHtml = markdown => {
  if (!markdown || typeof markdown !== "string") {
    return "";
  }

  return DOMPurify.sanitize(marked(markdown, { sanitize: true }));
};

/**
 * converts a given File into a Base64 string
 *
 * @param {*} file - the file
 */
export const convertFileToBase64 = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};
