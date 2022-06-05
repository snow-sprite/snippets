<template>
  <div>
    <div v-if="isSupportRecord">
      <button @click="startRecordScreen">Start Recording</button>
      <button @click="stopRecordScreen">Stop Recording</button>
      <video class="screen-video" controls autoplay playsinline></video>
    </div>
    <hr />
    <div v-if="isSupportRecord">
      <button @click="startRecordVideo">Start Recording</button>
      <button @click="stopRecordVideo">Stop Recording</button>
      <video class="audio-video" controls autoplay playsinline></video>
    </div>
  </div>
</template>

<script>
import RecordRTC from "recordrtc";

export default {
  data() {
    return {
      isSupportRecord: true,
      // 屏幕
      screenVideoRef: null,
      screenRecorder: null, // globally accessible

      // 音视频
      audioVideoRef: null,
      audioRecorder: null,
    };
  },
  mounted() {
    this.screenVideoRef = document.querySelector(".screen-video");
    this.audioVideoRef = document.querySelector(".audio-video");
    this.setRecord();
  },
  methods: {
    setRecord() {
      if (
        !navigator.getDisplayMedia &&
        !navigator.mediaDevices.getDisplayMedia
      ) {
        var error = "您的浏览器不支持录屏。";
        this.isSupportRecord = false;
        throw new Error(error);
      }
    },
    invokeGetDisplayMedia(success, error) {
      var displaymediastreamconstraints = {
        video: {
          displaySurface: "monitor", // monitor, window, application, browser
          logicalSurface: true,
          cursor: "always", // never, always, motion
        },
      };

      // above constraints are NOT supported YET
      // that's why overriding them
      displaymediastreamconstraints = {
        video: true,
      };

      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia(displaymediastreamconstraints)
          .then(success)
          .catch(error);
      } else {
        navigator
          .getDisplayMedia(displaymediastreamconstraints)
          .then(success)
          .catch(error);
      }
    },
    addStreamStopListener(stream, callback) {
      stream.addEventListener(
        "ended",
        () => {
          callback();
          callback = function () {};
        },
        false
      );
      stream.addEventListener(
        "inactive",
        () => {
          callback();
          callback = function () {};
        },
        false
      );
      stream.getTracks().forEach((track) => {
        track.addEventListener(
          "ended",
          () => {
            callback();
            callback = function () {};
          },
          false
        );
        track.addEventListener(
          "inactive",
          () => {
            callback();
            callback = function () {};
          },
          false
        );
      });
    },
    stopRecordingScreenCallback() {
      this.screenVideoRef.src = this.screenVideoRef.srcObject = null;
      this.screenVideoRef.src = URL.createObjectURL(
        this.screenRecorder.getBlob()
      );

      this.screenRecorder.screen.stop();
      this.screenRecorder.destroy();
      this.screenRecorder = null;
    },
    stopRecordingAudioCallback() {
      this.audioVideoRef.src = this.audioVideoRef.srcObject = null;
      this.audioVideoRef.muted = false;
      this.audioVideoRef.volume = 1;
      this.audioVideoRef.src = URL.createObjectURL(
        this.audioRecorder.getBlob()
      );

      this.audioRecorder.camera.stop();
      this.audioRecorder.destroy();
      this.audioRecorder = null;
    },
    captureScreen(callback) {
      this.invokeGetDisplayMedia(
        (screen) => {
          this.addStreamStopListener(screen, () => {
            console.log("停止录制");
          });
          callback(screen);
        },
        (error) => {
          console.error(error);
        }
      );
    },
    startRecordScreen() {
      this.captureScreen((screen) => {
        this.screenVideoRef.srcObject = screen;

        this.screenRecorder = RecordRTC(screen, {
          type: "video",
        });

        this.screenRecorder.startRecording();

        // release screen on stopRecording
        this.screenRecorder.screen = screen;
        console.log("start", this.screenRecorder);
      });
    },
    stopRecordScreen() {
      if (this.screenRecorder) {
        this.screenRecorder.stopRecording(this.stopRecordingScreenCallback);
      }
    },

    // 录视频音频------------------------
    captureCamera(callback) {
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: true })
        .then((camera) => {
          callback(camera);
        })
        .catch(function (error) {
          console.error(error);
        });
    },
    startRecordVideo() {
      this.captureCamera((camera) => {
        this.audioVideoRef.muted = true;
        this.audioVideoRef.volume = 0;
        this.audioVideoRef.srcObject = camera;

        this.audioRecorder = RecordRTC(camera, {
          type: "video",
        });
        this.audioRecorder.startRecording();
        // release camera on stopRecording
        this.audioRecorder.camera = camera;
      });
    },
    stopRecordVideo() {
      this.audioRecorder.stopRecording(this.stopRecordingAudioCallback);
    },
  },
};
</script>
<style>
html,
body {
  margin: 0 !important;
  padding: 0 !important;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", Arial,
    sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  font-size: 1em;
}

video {
  width: 30%;
  border-radius: 5px;
  border: 1px solid black;
}
</style>
