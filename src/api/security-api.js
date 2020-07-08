import config from "../config/config";
import { get, post, put, remove } from "./base-api";

const URL_USER = `${config.SECURITY_URL}/user/`;
const URL_ROLE = `${config.SECURITY_URL}/role/`;

/**
 * Fetches all users from the authentication server.
 *
 * @param {String} token - the authentication token
 * @param {Number} [first] - the first item number
 * @param {Number} [max] - max number of items
 * @param {String} [search] - search string
 * @returns {Promise} - the web service response as Promise
 */
export const getUsers = (token, first = 0, max = 50, search) => {
  const queryParams = {
    first,
    max,
    search
  };

  return get(URL_USER, queryParams, token);
};

/**
 * Returns the total number of users.
 *
 * @param {String} [token] - the authentication token
 * @returns {Promise} - the web service response as Promise
 */
export const getUserCount = token => {
  return get(`${URL_USER}count`, {}, token);
};

/**
 * Fetches the user with the given id.
 *
 * @param {String} id - the id of the user to fetch
 * @param {String} [token] - the authentication token
 * @returns {Promise} - the web service response as Promise
 */
export const getUserById = (id, token) => {
  return get(`${URL_USER}${id}`, {}, token);
};

/**
 * Adds a user to the authentication server.
 *
 * @param {Object} user - the user
 * @param {String} token - the authentication token
 * @returns {Promise} - the web service response as Promise
 */
export const addUser = (user, token) => {
  return post(URL_USER, user, token);
};

/**
 * Upates a user on the authentication server.
 *
 * @param {Object} user - the user
 * @param {String} token - the authentication token
 * @returns {Promise} - the web service response as Promise
 */
export const updateUser = (user, token) => {
  return put(`${URL_USER}${user.id}`, user, token);
};

/**
 * Resets a user's password.
 *
 * @param {Object} user - the user
 * @param {String} newPassword - the new password
 * @param {String} token - the authentication token
 * @param {Boolean} [temporary = true] - whether the password should be temporary
 * @returns {Promise} - the web service response as Promise
 */
export const resetPassword = (user, newPassword, token, temporary = true) => {
  const payload = {
    temporary,
    type: "password",
    value: newPassword
  };
  return put(`${URL_USER}${user.id}/reset-password`, payload, token);
};

/**
 * Removes a user from the database.
 *
 * @param {string|number} id - the user id
 * @param {String} [token] - the authentication token
 * @returns {Promise} - the web service response as Promise
 */
export const deleteUser = (id, token) => {
  return remove(`${URL_USER}${id}`, {}, token);
};

/**
 * Fetches all roles from the authentication server.
 *
 * @param {String} [token] - the authentication token
 * @returns {Promise} - the web service response as Promise
 */
export const getRoles = token => {
  return get(URL_ROLE, {}, token);
};

/**
 * Deletes the given roles from the user with the given id.
 *
 * @param {String} token - the authentication token
 * @param {string|number} userId - the user id
 * @param {Array} roles - the roles to delete
 * @returns {Promise} - the web service response as Promise
 */
export const deleteRolesFromUser = (token, userId, roles) => {
  return remove(`${URL_ROLE}${userId}`, roles, token);
};
