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

  publish(audio = true, video = true, screen = false, audioDeviceId) {
    let media = {
      replaceAudio: true,
      audioRecv: false,
      videoRecv: false,
      audioSend: audio,
      videoSend: video
    };

    if (audioDeviceId) {
      media = {
        ...media,
        audio: {
          deviceId: {
            exact: audioDeviceId
          }
        }
      };
    }

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
    if (this.pluginHandle) {
      this.pluginHandle.muteAudio();
    }
  }

  unmuteAudio() {
    if (this.pluginHandle) {
      this.pluginHandle.unmuteAudio();
    }
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
