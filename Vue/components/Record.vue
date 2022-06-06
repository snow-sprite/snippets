<template>
  <div class="record-wrap">
    <div
      v-if="isSupportScreenRecord"
      class="record-btn-box"
      title="F1开启录制，F2停止录制"
    >
      <span
        class="play-pause"
        :class="isRecording ? 'el-icon-video-pause' : 'el-icon-video-play'"
        @click="toggleRecord"
      ></span>
      <span class="record-title">屏幕录制</span>
    </div>
    <div v-if="isSupportCameraRecord">
      <video
        class="camera-video"
        autoplay
        playsinline
        @mousedown="handleMouseDown"
        @mouseup="handleMouseUp"
      ></video>
    </div>
  </div>
</template>

<script>
import RecordRTC from "recordrtc";
import { simpleDownloadByUrl } from "@/utils/download";
export default {
  data() {
    return {
      isSupportScreenRecord: false,
      isSupportCameraRecord: false,
      isRecording: false,
      // 屏幕
      screenRecorder: null, // globally accessible
      // 音视频
      cameraVideoRef: null,
      cameraRecorder: null,
      // 录屏快捷键
      isF1: false,
      // 结束录屏快捷键
      isF2: false,
    };
  },
  mounted() {
    this.setRecord();
    document.addEventListener("keydown", this.listenRecordEvent);
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this.listenRecordEvent);
  },
  methods: {
    setRecord() {
      if (
        !navigator.getDisplayMedia &&
        !navigator.mediaDevices.getDisplayMedia
      ) {
        var error = "您的浏览器不支持录屏。";
        this.isSupportScreenRecord = false;
        throw new Error(error);
      } else {
        this.isSupportScreenRecord = true;
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
    captureCamera(callback) {
      let that = this;
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: true })
        .then((camera) => {
          that.isSupportCameraRecord = true;
          this.cameraVideoRef = document.querySelector(".camera-video");
          callback(camera);
        })
        .catch(function (error) {
          console.error(error);
          that.isSupportCameraRecord = false;
        });
    },
    // 停止录制屏幕
    stopRecordingScreenCallback() {
      let url = URL.createObjectURL(this.screenRecorder.getBlob());
      simpleDownloadByUrl(url, "审片录制.mp4");

      this.screenRecorder.screen.stop();
      this.screenRecorder.destroy();
      this.screenRecorder = null;
    },
    // 停止录制音/视频
    stopRecordingAudioCallback() {
      this.cameraVideoRef.src = this.cameraVideoRef.srcObject = null;
      this.cameraVideoRef.muted = false;
      this.cameraVideoRef.volume = 1;
      this.cameraVideoRef.src = URL.createObjectURL(
        this.cameraRecorder.getBlob()
      );

      this.cameraRecorder.camera.stop();
      this.cameraRecorder.destroy();
      this.cameraRecorder = null;
    },
    captureScreen(callback) {
      let that = this;
      this.invokeGetDisplayMedia(
        (screen) => {
          this.addStreamStopListener(screen, () => {
            console.log("停止录制");
            that.isRecording = false;
          });
          that.isRecording = true;
          callback(screen);
        },
        (error) => {
          console.error(error);
          that.isRecording = false;
          if (error.name !== "NotAllowedError") {
            that.$message({
              type: "error",
              message: error,
            });
          }
        }
      );
    },
    startRecord() {
      // 开始录制屏幕
      this.captureScreen((screen) => {
        this.screenRecorder = RecordRTC(screen, {
          type: "video",
        });

        this.screenRecorder.startRecording();

        // release screen on stopRecording
        this.screenRecorder.screen = screen;
        console.log("start", this.screenRecorder);
      });
      // 开始录制音/视频
      this.captureCamera((camera) => {
        this.cameraVideoRef.muted = true;
        this.cameraVideoRef.volume = 0;
        this.cameraVideoRef.srcObject = camera;

        this.cameraRecorder = RecordRTC(camera, {
          type: "video",
        });
        this.cameraRecorder.startRecording();
        // release camera on stopRecording
        this.cameraRecorder.camera = camera;
      });
    },
    stopRecord() {
      if (this.screenRecorder) {
        console.log("11");

        this.screenRecorder.stopRecording(this.stopRecordingScreenCallback);
      }
      if (this.cameraRecorder) {
        console.log("22");

        this.cameraRecorder.stopRecording(this.stopRecordingAudioCallback);
      }
    },
    toggleRecord() {
      if (this.isRecording) {
        this.stopRecord();
      } else {
        this.startRecord();
      }
    },
    handleMouseDown(e) {
      let box = document.querySelector(".camera-video");
      let disx = e.pageX - box.offsetLeft,
        disy = e.pageY - box.offsetTop,
        documentEle = document.documentElement || document.body;

      document.onmousemove = function (e) {
        let x, y;
        if (e.pageX - disx > 0) {
          if (e.pageX - disx > documentEle.clientWidth - 150) {
            x = documentEle.clientWidth - 150;
          } else {
            x = e.pageX - disx;
          }
        } else {
          x = 0;
        }

        if (e.pageY - disy > 0) {
          if (e.pageY - disy > documentEle.clientHeight - 150) {
            y = documentEle.clientHeight - 150;
          } else {
            y = e.pageY - disy;
          }
        } else {
          y = 0;
        }

        box.style.left = x + "px";
        box.style.top = y + "px";
      };
    },
    handleMouseUp() {
      document.onmousemove = document.onmouseup = null;
    },
    listenRecordEvent(e) {
      let event = e || event || window.event;
      switch (event.keyCode) {
        case 112:
          e.preventDefault();
          this.isF1 = true;
          this.isF2 = false;
          break;
        case 113:
          e.preventDefault();
          this.isF1 = false;
          this.isF2 = true;
          break;
      }

      if (this.isRecording) {
        if (event.keyCode == 112) {
          this.$message({
            type: "info",
            message: "您已开始录屏，无需再次开启",
          });
          return;
        } else if (event.keyCode == 113) {
          this.stopRecord();
        }
      } else {
        if (event.keyCode == 112) {
          this.startRecord();
        } else if (event.keyCode == 113) {
          this.stopRecord();
        }
      }
    },
  },
};
</script>
<style lang="scss" scoped>
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
.record-wrap {
  position: relative;
  .record-btn-box {
    position: absolute;
    left: -45px;
    top: 0;
    display: flex;
    justify-content: space-around;
    color: #333;
    z-index: 100;
    width: 90px;
    height: 40px;
    border-radius: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 6px rgba(0, 0, 0, 0.04);
    background: #fff;
    font-size: 14px;
    padding: 5px;
    box-sizing: border-box;
    transition: left 0.2s linear, opacity 0.2s linear;
    opacity: 0.6;
    &:hover {
      left: 2px;
      opacity: 1;
    }
  }
  .play-pause {
    cursor: pointer;
    font-size: 28px;
    line-height: 30px;
  }
  .play-pause:active {
    -ms-transform: translate(1px, 1px);
    transform: translate(1px, 1px);
    // box-shadow: 1px 1px #afc4ea, 2px 2px #afc4ea;
  }
  .record-title {
    width: 30px;
    text-align: center;
    line-height: 1;
    padding-top: 2px;
  }
}
.camera-video {
  position: fixed;
  width: 150px;
  height: 150px;
  left: 0;
  top: 55px;
  border-radius: 50%;
  border: 1px solid #{var(--box-border)};
}
</style>
