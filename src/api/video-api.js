import config from "../config/config";
import { get, post, put, remove } from "./base-api";

const URL_ROOMS = `${config.VIDEO_BACKEND_URL}/admin/video-room`;
const URL_ROOMS_BATCH = `${config.VIDEO_BACKEND_URL}/admin/video-room/%24batch`;
const URL_SETTINGS = `${config.VIDEO_BACKEND_URL}/admin/settings`;
const URL_ICE_SERVERS = `${config.VIDEO_BACKEND_URL}/ice-servers`;
const URL_ROOM_ACCESS_TOKEN = `${config.VIDEO_BACKEND_URL}/video-room/token`;
const URL_ROOM_ADHOC = `${config.VIDEO_BACKEND_URL}/video-room/adhoc`;
const URL_ROOM_ADHOC_ADD = `${config.VIDEO_BACKEND_URL}/video-room/adhoc/add`;
const URL_ROOM_ACCESSIBLE = `${config.VIDEO_BACKEND_URL}/video-room/accessible`;

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
 * Adds multiple rooms to the room list.
 *
 * @param {String} description - the description
 * @param {Date} start - the start date
 * @param {Date} end - the end date
 * @param {String} token - the token
 * @returns {Promise} the response as Promise
 */
export const addRoomsBatch = (description, start, end, token) => {
  return post(
    URL_ROOMS_BATCH,
    {
      description,
      tumorConference: {
        description,
        date: start,
        entries: []
      }
    },
    token,
    {
      start,
      end
    }
  );
};

/**
 * Removes a room permanently.
 *
 * @param {Number} roomId - the room id
 * @param {String} token - the authentication token
 */
export const deleteRoom = (roomId, token) => {
  if (!roomId) {
    throw new Error("Room id not specified");
  }

  const url = `${URL_ROOMS}/${roomId}`;
  const request = {
    room: roomId
  };

  return remove(url, request, token);
};

/**
 * Gets all participants that are allowed to join a room.
 *
 * @param {Number} roomId - the room id
 * @param {String} token - the authentication token
 * @retorns {Promise} the response as promise
 */
export const getParticipantsInRoom = (roomId, token) => {
  if (!roomId) {
    throw new Error("Room id not specified");
  }

  const url = `${URL_ROOMS}/${roomId}/participants`;
  return get(url, {}, token);
};

/**
 * Removes one or more participants from the room with the given roomId.
 *
 * @param {Number} roomId - the room id
 * @param {String|Array} participants - the ids of the participants to remove
 * @param {String} token - the authentication token
 * @returns {Promise} the response as promise
 */
export const deleteParticipantsFromRoom = (roomId, participants, token) => {
  if (!roomId) {
    throw new Error("Room id not specified");
  }
  if (!participants) {
    throw new Error("No participants specified");
  }

  if (!Array.isArray(participants)) {
    participants = [participants];
  }

  const url = `${URL_ROOMS}/${roomId}/participants`;
  const request = {
    action: "REMOVE",
    allowed: participants,
    room: roomId,
    request: "allowed"
  };

  return remove(url, request, token);
};

/**
 * Adds one or more participants to the room with the given id.
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
 * @param {String} token - the authentication token
 * @param {Number} [size] - the number of resources to be fetched
 * @param {oage} [page] - the page
 * @returns {Promise} the response as promise
 */
export const getRooms = (token, size = 1000, page = 1) => {
  return get(URL_ROOMS, { size, page }, token);
};

/**
 * Fetches the conference settings.
 *
 * @param {String} token - the authentication token
 * @returns {Promise} the response as promise
 */
export const getConferenceSettings = token => {
  return get(URL_SETTINGS, {}, token);
};

/**
 * Updates the conference settings.
 *
 * @param {Object} settings - the settings
 * @param {String} token - the authentication token
 * @returns {Promise} the response as promise
 */
export const updateConferenceSettings = (settings, token) => {
  return put(URL_SETTINGS, settings, token);
};

/**
 * Returns the adhoc room. The adhoc room will be created on the server, if it does not exist.
 *
 * @param {String} token - the authentication token
 * @returns {Promise} the response as promise
 */
export const getAdhocRoom = token => {
  return post(URL_ROOM_ADHOC, {}, token);
};

/**
 * Adds the user referenced in the <code>token</token> to the adhoc room.
 *
 * @param {String} token - the authentication token
 * @returns {Promise} the response as promise
 */
export const addUserToAdhocRoomByToken = token => {
  return post(URL_ROOM_ADHOC_ADD, {}, token);
};

/**
 * Returns all rooms that are accessible by the user referenced in the authentication token.
 *
 * @param {String} token - the authentication token
 * @returns {Promise} the response as promise
 */
export const getRoomsAccessible = token => {
  return get(URL_ROOM_ACCESSIBLE, {}, token);
};
