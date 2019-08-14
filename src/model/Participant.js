import hark from "hark";

export class Participant {
  constructor(id, pvtid, stream, caption, local, loading, mirrored) {
    this.id = id;
    this.pvtid = pvtid;
    this.stream = stream;
    this.caption = caption;
    this.local = local;
    this.loading = loading;
    this.speaking = false;
    this.pluginHandle = null;
    this.mirrored = mirrored;
    this.pin = null;
  }

  setStream(stream) {
    this.stream = stream;
    this.registerSpeakingListeners();
  }

  registerSpeakingListeners() {
    let speechEvents = hark(this.stream);
    speechEvents.on("speaking", () => (this.speaking = true));
    speechEvents.on("stopped_speaking", () => (this.speaking = false));
  }
}

export class LocalParticipant extends Participant {
  register(room, pin, token) {
    this.pluginHandle.send({
      message: {
        request: "join",
        room: room,
        ptype: "publisher",
        display: this.caption,
        pin,
        token: token || "test"
      }
    });
  }

  publish(audio = true, video = true, screen = false) {
    let media = {
      audioRecv: false,
      videoRecv: false,
      audioSend: audio,
      videoSend: video
    };
    if (screen) {
      media.video = "screen";
      media.audioSend = false;
    }
    this.pluginHandle.createOffer({
      media,
      pin: this.pin,
      simulcast: false,
      success: jsep => this.onPublishSuccess(jsep, audio, video),
      error: this.onPublishError
    });
  }

  onPublishSuccess(jsep, audio = true, video = true) {
    this.pluginHandle.send({
      pin: this.pin,
      message: { request: "configure", audio, video, pin: this.pin },
      jsep
    });
  }

  onPublishError(error) {
    // Adblock plus error
    console.error(error);
  }

  unpublish() {
    this.pluginHandle.send({
      message: { request: "unpublish", pin: this.pin }
    });
  }

  setBitrate(bitrate) {
    this.pluginHandle.send({
      message: { request: "configure", bitrate, pin: this.pin }
    });
  }

  muteAudio() {
    this.pluginHandle.muteAudio();
  }

  unmuteAudio() {
    this.pluginHandle.unmuteAudio();
  }

  muteVideo() {
    this.pluginHandle.muteVideo();
  }

  unmuteVideo() {
    this.pluginHandle.unmuteVideo();
  }

  handleRemoteJsep(message) {
    this.pluginHandle.handleRemoteJsep(message);
  }
}

export default {
  Participant,
  LocalParticipant
};
