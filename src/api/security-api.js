import config from "../config/config";
import { get } from "./base-api";

const URL_GET_USERS = `${config.SECURITY_URL}/user`;

export const getUsers = token => {
  return get(URL_GET_USERS, {}, token);
};
