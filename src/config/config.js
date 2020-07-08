const config = {
  AUTHENTICATION: process.env.VUE_APP_AUTHENTICATION === "true",
  BASE_URL: process.env.VUE_APP_BASE_URL,
  FHIR_URL: process.env.VUE_APP_FHIR_URL,
  FHIR_ORGANIZATION: process.env.VUE_APP_FHIR_ORGANIZATION ? process.env.VUE_APP_FHIR_ORGANIZATION : "",
  KEYCLOAK_URL: process.env.VUE_APP_KEYCLOAK_URL,
  KEYCLOAK_REALM: process.env.VUE_APP_KEYCLOAK_REALM,
  KEYCLOAK_CLIENT_ID: process.env.VUE_APP_KEYCLOAK_CLIENT,
  JANUS_URL: process.env.VUE_APP_JANUS_URL,
  VIDEO_BACKEND_URL: process.env.VUE_APP_VIDEO_BACKEND_URL,
  WEBSOCKET_URL: process.env.VUE_APP_WEBSOCKET_URL,
  VITU_PROCESS_URL: process.env.VUE_APP_VITU_PROCESS_URL,
  SECURITY_URL: process.env.VUE_APP_SECURITY_URL,
  DEMO: process.env.VUE_APP_DEMO === "true",
  DEFAULT_CONFERENCE_SETTINGS: {
    showVideo: true,
    bitrate: 256,
    aspectRatio: "16:10",
    cutVideoStreams: true,
    persistentRoomEnabled: true,
    persistentRoomName: "Allgemeiner Konferenzraum",
    showDateTimeInTitle: true,
    maxNumberOfVideos: 8
  },
  SUCCESS_HEADER_TIMEOUT: 10000,
  ADHOC_ROOM_DESCRIPTION: "fc2d99de-29fe-4d08-8dc8-92167876551a",
  MAX_LENGTH_CONFERENCE_NAME: 50,
  DEACTIVATE_DOCUMENTATION: process.env.VUE_APP_DEACTIVATE_DOCUMENTATION === "true",
  VITU_BRANDING: process.env.VUE_APP_VITU_BRANDING !== "false"
};

export default config;
