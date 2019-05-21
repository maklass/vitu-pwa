import axios from "axios";
import config from "../config/config";

const urlEntry = `${config.VITU_PROCESS_URL}/entry/`;
const urlStatus = `${config.VITU_PROCESS_URL}/status`;

export function fetchStatuses(params = {}, token) {
  const headers = {
    Accept: "application/json"
  };

  if (token) {
    headers.Authorization = "Bearer " + token;
  }

  const options = {
    params,
    headers
  };

  return axios.get(urlStatus, options);
}

export function fetchEntries(params = {}, token) {
  const headers = {
    Accept: "application/json"
  };

  if (token) {
    headers.Authorization = "Bearer " + token;
  }

  const options = {
    params,
    headers
  };

  return axios.get(urlEntry, options);
}

export function addEntry(orbisCaseNo, orbisPID, patientFirstname, patientLastname, diagnoseOfTumor, patientDateOfBirth, patientSex, status, vituID, token) {
  const headers = {
    Accept: "application/json",
    Content: "application/json"
  };

  if (token) {
    headers.Authorization = "Bearer " + token;
  }

  const options = {
    headers
  };

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

  return axios.post(urlEntry, resource, options);
}

export function updateEntry(entry, token) {
  if (!entry || !entry.id) {
    throw new Error();
  }

  const headers = {
    Accept: "application/json",
    Content: "application/json"
  };

  if (token) {
    headers.Authorization = "Bearer " + token;
  }

  const options = {
    headers
  };

  const url = `${urlEntry}${entry.id}`;

  return axios.put(url, entry, options);
}
