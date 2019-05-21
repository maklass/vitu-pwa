import config from "../config/config";
import { get, post } from "./base-api";

const URL_ICE_SERVERS = `${config.VIDEO_BACKEND_URL}/ice-servers`;
const URL_ROOMS = `${config.VIDEO_BACKEND_URL}/admin/video-room`;
const URL_ROOM_ACCESS_TOKEN = `${config.VIDEO_BACKEND_URL}/video-room/token`;

/**
 * Fetches ICE servers
 *
 * @param {stirng} token - the token
 */
export const getIceServers = async token => {
  return get(URL_ICE_SERVERS, null, token);
};

/**
 * Adds a room to the room list.
 *
 * @param {String} description - the description
 * @param {Date} date - the date
 * @param {String} token - the token
 * @returns {Promise} the response as Promise
 */
export const addRoom = (description, date, token) => {
  return post(
    URL_ROOMS,
    {
      description,
      tumorConference: {
        description,
        date,
        entries: []
      }
    },
    token
  );
};

/**
 * Addes an existing entry to an existing conference.
 *
 * @param {Number} roomId - the conference id
 * @param {Object} entry - the entry
 * @param {String} token - the token
 * @returns {Promise} the response as promise
 */
export const addEntryToConference = (roomId, entry, token) => {
  const url = `${URL_ROOMS}/${roomId}/entry`;
  return post(url, entry, token);
};

/**
 * Adds 1 or more participants to the conference with the given id.
 *
 * @param {Number} roomId - the room id
 * @param {String|Array} participants - the ids of the participants to add
 * @param {String} token - the authentication token
 * @returns {Promise} the response as promise
 */
export const addParticipantsToRoom = (roomId, participants, token) => {
  if (!participants || !roomId) {
    return;
  }

  const url = `${URL_ROOMS}/${roomId}/participants`;
  const request = {
    tokens: [],
    requestAllowed: {
      request: "allowed",
      room: roomId,
      action: "ADD"
    }
  };

  if (!Array.isArray(participants)) {
    participants = [participants];
  }

  for (let i = 0; i < participants.length; i++) {
    request.tokens.push({
      userId: participants[i],
      validFrom: Date.now()
    });
  }

  return post(url, request, token);
};

/**
 * Returns the access token for a given room and the user the given token refers to.
 *
 * @param {Number} roomId - the room id
 * @param {String} token - the authentication token
 * @returns {Promise} the response as promise
 */
export const getAccessTokenForRoom = (roomId, token) => {
  if (!roomId) {
    return;
  }

  const url = `${URL_ROOM_ACCESS_TOKEN}/${roomId}`;

  return get(url, {}, token);
};

/**
 * Fetch all existing rooms.
 *
 * @param {String} token - the token
 * @returns {Promise} the response as promise
 */
export const getRooms = token => {
  return get(URL_ROOMS, {}, token);
};
