import Janus from "@/assets/js/janus.js";

let janus;

export const initializeJanus = () => {
  return new Promise((resolve, reject) => {
    Janus.init({
      debug: "all",
      callback: () => {
        if (!Janus.isWebrtcSupported()) {
          reject("No WebRTC support... ");
          return;
        }
        resolve();
      }
    });
  });
};

export const createJanus = (url, iceServers, iceTransportPolicy = "relay") => {
  return new Promise((resolve, reject) => {
    janus = new Janus({
      server: url,
      iceTransportPolicy,
      iceServers: iceServers,
      success: () => resolve(janus),
      error: error => reject(error),
      destroyed: () => onJanusDestroyed
    });
  });
};

export const attach = (opaqueId, onConsentDialog, onWebrtcState, onCleanup) => {
  return new Promise((resolve, reject) => {
    janus.attach({
      plugin: "janus.plugin.videoroom",
      opaqueId: opaqueId,
      success: pluginHandle => resolve(pluginHandle),
      error: error => reject(error),
      consentDialog: onConsentDialog,
      mediaState: onMediaState,
      webrtcState: onWebrtcState,
      // onmessage: onJanusPluginAttachMessage,
      // onlocalstream: onJanusPluginAttachLocalStream,
      oncleanup: onCleanup
    });
  });
};

export const register = (pluginHandle, room, caption, pin) => {
  pluginHandle.send({
    message: {
      request: "join",
      room: room,
      ptype: "publisher",
      display: caption,
      pin
    }
  });
};

export const destroy = () => {
  if (janus) {
    janus.destroy();
  }
};

const onJanusDestroyed = () => {
  Janus.log("Janus destroyed");
};

const onMediaState = (medium, on) => {
  Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium);
};
