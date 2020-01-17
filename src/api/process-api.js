import config from "../config/config";
import { get, post, put, remove } from "./base-api";

const urlEntry = `${config.VITU_PROCESS_URL}/entry/`;
const urlStatus = `${config.VITU_PROCESS_URL}/status/`;

/**
 * Fetches all statuses from the backend.
 *
 * @param {Object} [params] - query params
 * @param {string} [token] - the authentication token
 * @returns {Promise} - the web service response as Promise
 */
export const getStatuses = (params = {}, token) => {
  return get(urlStatus, params, token);
};

/**
 * Fetches the status with the given id.
 *
 * @param {String} id - the id of the status to fetch
 * @param {String} [token] - the authentication token
 * @returns {Promise} - the web service response as Promise
 */
export const getStatusById = (id, token) => {
  return get(`${urlStatus}${id}`, {}, token);
};

/**
 * Addes an existing entry to an existing conference.
 *
 * @param {Number} tumorConferenceId - the tumor conference id
 * @param {Object} entry - the entry
 * @param {String} token - the token
 * @returns {Promise} the response as promise
 */
export const addEntryToConference = (tumorConferenceId, entry, token) => {
  const url = `${urlEntry}tumorConference/${tumorConferenceId}/entry`;
  return post(url, entry, token);
};

export const updateStatus = (status, token) => {
  if (!status || !status.id) {
    throw new Error("Status or status id was null or undefined");
  }
  return put(`${urlStatus}${status.id}`, status, token);
};

export const updateStatusesBatch = (statuses, token) => {
  if (!statuses) {
    throw new Error("Status or status id was null or undefined");
  }
  return put(`${urlStatus}$batch`, statuses, token);
};

export const fetchEntries = (params = {}, token) => {
  return get(urlEntry, params, token);
};

export const addEntry = (orbisCaseNo, orbisPID, patientFirstname, patientLastname, diagnoseOfTumor, patientDateOfBirth, patientSex, status, vituID, token) => {
  const resource = {
    orbisCaseNo,
    orbisPID,
    patientFirstname,
    patientLastname,
    diagnoseOfTumor,
    patientDateOfBirth,
    patientSex,
    status,
    vituID
  };

  return post(urlEntry, resource, token);
};

export const deleteEntry = (entryId, token) => {
  return remove(`${urlEntry}${entryId}`, {}, token);
};

export function updateEntry(entry, token) {
  if (!entry || !entry.id) {
    throw new Error();
  }

  entry.patientDateOfBirth = entry.patient.dateOfBirth;
  entry.patientFirstname = entry.patient.firstName;
  entry.patientLastname = entry.patient.lastName;
  entry.patientSex = entry.patient.sex;
  entry.diagnoseOfTumor = entry.tumorDiagnose;

  return put(`${urlEntry}${entry.id}`, entry, token);
}
