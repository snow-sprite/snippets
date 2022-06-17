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
    <div
      v-if="isSupportCameraRecord && isRecording"
      class="camera-video-wrapper"
    >
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
import { saveBlobFileToDisk } from "@/utils/download";
import { getFileName } from "@/utils/util";

export default {
  data() {
    return {
      isSupportScreenRecord: false,
      isSupportCameraRecord: false,
      isStarting: false,
      isRecording: false,
      // 屏幕
      screenRecorder: null, // globally accessible
      // 视频
      cameraVideoRef: null,
      cameraRecorder: null,
      // 音频
      microphoneRecorder: null,
      // 录屏快捷键
      isF1: false,
      // 结束录屏快捷键
      isF2: false,
      messageAlert: null,
      isRecordingScreen: false,
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
        audio: true,
      };

      // above constraints are NOT supported YET
      // that's why overriding them
      displaymediastreamconstraints = {
        video: true,
        // 加了此属性 会捕获屏幕中播放的声音（如视频原声）
        // 详见：https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        audio: true,
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
    // 捕获摄像头视频
    captureCamera(callback) {
      let that = this;
      navigator.mediaDevices
        .getUserMedia({
          video: true,
          // audio: true,
        })
        .then((camera) => {
          if (this.messageAlert) {
            this.messageAlert.close();
          }
          that.isStarting = false;
          that.isRecording = true;
          that.isSupportCameraRecord = true;
          that.$nextTick(() => {
            that.cameraVideoRef = document.querySelector(".camera-video");
            callback(camera);
          });
        })
        .catch(function (error) {
          that.isStarting = false;
          that.isRecording = false;
          console.error(error);
          that.isSupportCameraRecord = false;
          that.cameraVideoRef = null;
          if (error.name != "NotFoundError") {
            // 如果未查到音视频输入设备 无需报错
            that.$message({
              type: "error",
              message: error,
            });
          }

          if (error.name == "NotFoundError") {
            // 如果未找到视频输入设备 尝试调起麦克风
            that.recordeMicrophone();
          }
        });
    },
    // 捕获音频输入源
    captureMicrophone(callback) {
      let that = this;
      navigator.mediaDevices
        .getUserMedia({
          // video: true,
          audio: true,
        })
        .then((microphone) => {
          callback(microphone);
        })
        .catch(function (error) {
          if (error.name != "NotFoundError") {
            // 如果未查到音视频输入设备 无需报错
            that.$message({
              type: "error",
              message: error,
            });
          }

          if (error.name == "NotFoundError") {
            // 如果未找到音频输入设备 直接调起屏幕
            that.recordingCamera();
          }
        });
    },
    // 停止录制屏幕
    stopRecordingScreenCallback() {
      let allBlobs = this.screenRecorder.getBlob();

      let finalFile = new File([allBlobs], getFileName("mp4"), {
        type: "video/webm;codecs=h264",
      });

      saveBlobFileToDisk(finalFile, "屏幕录制", "mp4");

      this.screenRecorder.screen.stop();
      this.screenRecorder.destroy();
      this.screenRecorder = null;
    },
    // 停止录制视频
    stopRecordingCameraCallback() {
      let cameraBlob = this.cameraRecorder.getBlob();
      this.isRecording = false;
      if (this.cameraVideoRef) {
        this.cameraVideoRef.src = this.cameraVideoRef.srcObject = null;
        this.cameraVideoRef.muted = false;
        this.cameraVideoRef.volume = 1;
        this.cameraVideoRef.src = URL.createObjectURL(cameraBlob);
      }

      URL.revokeObjectURL(cameraBlob);
      this.cameraRecorder.camera.stop();
      this.cameraRecorder.destroy();
      this.cameraRecorder = null;
    },
    // 停止录制麦克风
    stopRecordingMicrophoneCallback() {
      if (this.microphoneRecorder) {
        this.microphoneRecorder.destroy();
        this.microphoneRecorder = null;
      }
    },
    captureScreen(callback) {
      let that = this;
      this.invokeGetDisplayMedia(
        (screen) => {
          this.addStreamStopListener(screen, () => {
            that.isRecording = false;
            // 取消之后也要关闭录制
            that.stopRecord();
          });
          that.isRecording = true;
          callback(screen);
        },
        (error) => {
          console.error(error);
          that.isRecording = false;
          // 报错之后也要关闭录制
          that.stopRecord();
          that.$message({
            type: "error",
            message: error,
          });
        }
      );
    },
    startRecord() {
      // 开始录制视频
      this.captureCamera((camera) => {
        if (this.cameraVideoRef) {
          this.cameraVideoRef.muted = true;
          this.cameraVideoRef.volume = 0;
          this.cameraVideoRef.srcObject = camera;
        }

        this.cameraRecorder = RecordRTC(camera, {
          type: "video",
          disableLogs: true,
        });
        this.cameraRecorder.startRecording();
        // release camera on stopRecording
        this.cameraRecorder.camera = camera;

        //! 因为调用摄像头会有延迟 所以在调起摄像头之后才开始调用屏幕录制
        this.recordeMicrophone();
      });
    },
    recordeMicrophone() {
      // 开始录制音频
      this.captureMicrophone((microphoneStream) => {
        if (this.microphoneRecorder) {
          this.microphoneRecorder.destroy();
          this.microphoneRecorder = null;
        }
        this.microphoneRecorder = RecordRTC(microphoneStream, {
          type: "audio",
          mimeType: "audio/webm",
          sampleRate: 44100,
          recorderType: RecordRTC.StereoAudioRecorder,
          numberOfAudioChannels: 1,
          desiredSampRate: 16000,
          disableLogs: true,
        });
        this.microphoneRecorder.startRecording();
        //! 因为调用摄像头会有延迟 所以在调起音频之后才开始调用屏幕录制
        this.recordingCamera(microphoneStream);
      });
    },
    recordingCamera(microphoneStream) {
      if (this.isRecordingScreen) return;
      // 表明已经开始录屏了
      this.isRecordingScreen = true;

      var finalStream = new MediaStream();
      if (microphoneStream) {
        this.getTracks(microphoneStream, "audio").forEach(function (track) {
          finalStream.addTrack(track);
        });
      }

      this.captureScreen((screenStream) => {
        this.getTracks(screenStream, "video").forEach(function (track) {
          finalStream.addTrack(track);
        });
        this.screenRecorder = RecordRTC(finalStream, {
          type: "video",
          mimeType: "video/webm;codecs=h264",
          timeSlice: 1000,
          bufferSize: 16384,
          disableLogs: true,
        });

        this.screenRecorder.startRecording();
        // 暂存一下视频
        this.screenRecorder.screen = finalStream;
      });
    },
    stopRecord() {
      this.isRecordingScreen = false;
      if (this.screenRecorder) {
        this.screenRecorder.stopRecording(this.stopRecordingScreenCallback);
      }
      if (this.cameraRecorder) {
        this.cameraRecorder.stopRecording(this.stopRecordingCameraCallback);
      }
      if (this.microphoneRecorder) {
        this.microphoneRecorder.stopRecording(
          this.stopRecordingMicrophoneCallback
        );
      }
    },
    toggleRecord() {
      if (!this.isRecording) {
        if (this.isStarting) {
          if (this.messageAlert) {
            this.messageAlert.close();
            this.messageAlert = null;
          }
          this.messageAlert = this.$message({
            type: "info",
            message: "正在调用摄像头，请稍后..",
          });
          return;
        }

        this.isStarting = true;
        this.startRecord();
      } else {
        this.stopRecord();
      }
    },
    getTracks(stream, kind) {
      if (!stream || !stream.getTracks) {
        return [];
      }

      return stream.getTracks().filter(function (t) {
        return t.kind === (kind || "audio");
      });
    },
    handleMouseDown(e) {
      // 拖拽移动摄像头
      let box = document.querySelector(".camera-video-wrapper");
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
          this.toggleRecord();
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
    color: #7a7a7a;
    z-index: 100;
    width: 90px;
    height: 40px;
    border-radius: 0 16px 16px 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 6px rgba(0, 0, 0, 0.04);
    background: #fff;
    font-size: 14px;
    padding: 5px;
    box-sizing: border-box;
    transition: left 0.2s linear, opacity 0.2s linear, background 0.2s linear,
      color 0.2s linear;
    opacity: 0.6;
    border: 1px solid #858585;
    &:hover {
      left: 0px;
      opacity: 1;
      background: #fff;
      color: #333;
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
  }
}
.camera-video-wrapper {
  position: fixed;
  left: 0;
  top: 55px;
  border-radius: 50%;
  border: 1px solid #{var(--box-border)};
  z-index: 99;
  width: 130px;
  height: 130px;
  overflow: hidden;

  .camera-video {
    width: auto;
    height: 100%;
    cursor: move;
    position: relative;
    left: calc(50% - 115px);
  }
}
</style>
