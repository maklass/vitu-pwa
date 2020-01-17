import axios from "axios";

/**
 * Performs an ajax get request using axios
 *
 * @param {string} url - request url
 * @param {Object} [params={}] - the query parameters for the get request as object (e.g. { zoneId: "Europe/Berlin" } )
 * @param {string} [token] - the token
 * @returns {Promise} - the Promise containing the result of the HTTP request
 */
export const get = (url, params = {}, token) => {
  const headers = {
    Accept: "application/json"
  };

  if (token) {
    headers.Authorization = "Bearer " + token;
  }

  const config = {
    headers,
    params
  };

  return axios.get(url, config);
};

/**
 * Performs an ajax post request using axios
 *
 * @param {string} url - request url
 * @param {Object} [content={}] - request body data in json format
 * @param {string} [token] - the token
 * @param {Object} [params={}] - the query parameters for the get request as object (e.g. { zoneId: "Europe/Berlin" } )
 * @returns {Promise} - the Promise containing the result of the HTTP request
 */
export const post = (url, content = {}, token, params = {}) => {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json"
  };

  if (token) {
    headers.Authorization = "Bearer " + token;
  }

  const config = {
    headers,
    params
  };

  return axios.post(url, content, config);
};

/**
 * Performs an ajax put request using axios
 *
 * @param {string} url - request url
 * @param {Object} [content={}] - request body data in json format
 * @param {string} [token] - the token
 * @returns {Promise} - the Promise containing the result of the HTTP request
 */
export const put = (url, content = {}, token) => {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json"
  };

  if (token) {
    headers.Authorization = "Bearer " + token;
  }

  const config = {
    headers
  };

  return axios.put(url, content, config);
};

/**
 * Performs a delete request using axios
 *
 * @param {string} url - request url
 * @param {Object} [content={}] - request body data in json format
 * @param {string} [token] - the token
 * @returns {Promise} - the Promise containing the result of the HTTP request
 */
export const remove = (url, content = {}, token) => {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json"
  };

  if (token) {
    headers.Authorization = "Bearer " + token;
  }

  const config = {
    headers,
    data: content
  };

  return axios.delete(url, config);
};
