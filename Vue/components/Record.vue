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
      class="camera-video-wrapper"
      v-if="isSupportCameraRecord && isRecording"
    >
      <video
        class="camera-video"
        autoplay
        loop
        playsinline
        @mousedown="handleMouseDown"
        @mouseup="handleMouseUp"
      ></video>
      <div class="came-full-box">
        <span
          class="came-full-btn el-icon-full-screen"
          @click="setBigCamera"
        ></span>
      </div>
    </div>
    <!-- camera fullscreen -->
    <div class="camera-fullwrapper" v-show="isFullCamera">
      <span
        class="el-icon-close fz24 close-icon fr"
        @click.stop="hideFullCamera"
      ></span>
      <div class="camera-container">
        <video
          class="camera-instance"
          :style="{ left: cameraLeft }"
          autoplay
          loop
          playsinline
          @mousedown="handleMouseDown"
          @mouseup="handleMouseUp"
        ></video>
      </div>
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
      // 全屏摄像头视频
      cameraBigVideoRef: null,
      cameraRecorder: null,
      // 音频
      microphoneRecorder: null,
      // 录屏快捷键
      isF1: false,
      // 结束录屏快捷键
      isF2: false,
      messageAlert: null,
      isRecordingScreen: false,
      isFullCamera: false,
      cameraLeft: 0,
      cameraStream: null,
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
          if (
            error.name == "NotFoundError" ||
            error.name == "NotAllowedError"
          ) {
            // 如果未查到音视频输入设备 无需报错
            // that.$message({
            //   type: "error",
            //   message: `未捕获到摄像头或没有摄像头访问权限`,
            //   duration: 3000,
            // });
          } else {
            that.$message({
              type: "error",
              message: `摄像头调用失败，${error.message}`,
              duration: 3000,
            });
          }

          if (
            error.name == "NotFoundError" ||
            error.name == "NotAllowedError"
          ) {
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
          console.error(error);
          if (
            error.name == "NotFoundError" ||
            error.name == "NotAllowedError"
          ) {
            // 如果未查到音视频输入设备 无需报错
            // that.$message({
            //   type: "error",
            //   message: `未捕获到麦克风或没有麦克风访问权限`,
            //   duration: 3000,
            // });
          } else {
            that.$message({
              type: "error",
              message: `麦克风调用失败，${error.message}～`,
              duration: 3000,
            });
          }

          if (
            error.name == "NotFoundError" ||
            error.name == "NotAllowedError"
          ) {
            // 如果未找到音频输入设备 或 无访问权限 直接调起屏幕
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

      if (this.cameraBigVideoRef) {
        this.cameraBigVideoRef.src = this.cameraBigVideoRef.srcObject = null;
        this.cameraVideoRef.muted = false;
        this.cameraVideoRef.volume = 1;
      }

      // 如果开启了摄像头大形态 关闭大摄像头弹窗
      this.isFullCamera = false;
      // 同时清除摄像头流信息
      this.cameraStream = null;

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
          if (
            error.name != "NotAllowedError" &&
            error.name != "NotFoundError"
          ) {
            that.$message({
              type: "error",
              message: `录制屏幕出错，${error.message}`,
            });
          }
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
          // 保存一下摄像头流 给放大摄像头后的视频用
          this.cameraStream = camera;
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

    setBigCamera() {
      this.isFullCamera = true;
      this.$nextTick(() => {
        this.cameraBigVideoRef = document.querySelector(".camera-instance");
        // 将小摄像头流文件赋值到此大摄像头
        this.cameraBigVideoRef.muted = true;
        this.cameraBigVideoRef.volume = 0;
        this.cameraBigVideoRef.srcObject = this.cameraStream;

        // 根据auto宽 设置摄像头位置
        // TODO 100ms后执行是因为 获取到的offsetWidth与实际显示有出入 导致css样式错乱 摄像头圆形区域内不能填充 待解决
        setTimeout(() => {
          if (this.cameraBigVideoRef) {
            this.cameraLeft = `calc(50% - ${
              this.cameraBigVideoRef.offsetWidth / 2
            }px)`;
          }
        }, 100);
      });
    },
    // 隐藏全屏摄像头
    hideFullCamera() {
      this.isFullCamera = false;
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
    width: 230px;
    height: 100%;
    cursor: move;
    position: relative;
    left: calc(50% - 115px);
  }
  &:hover {
    .came-full-box::before {
      display: block;
    }
    .came-full-btn {
      display: inline-block;
    }
  }
  .came-full-box {
    width: 100%;
    height: 25px;
    position: relative;
    bottom: 28px;
    left: 0px;
    text-align: center;
    line-height: 28px;
    transition: all 0.3s ease 1s;
    &::before {
      display: none;
      content: "";
      width: 100%;
      height: 30px;
      position: absolute;
      border-radius: 10px;
      bottom: 0px;
      left: 0;
      background: linear-gradient(
        rgba(248, 248, 248, 0),
        25%,
        rgba(0, 0, 0, 0.8)
      );
      transition: all 0.3s ease 0s;
      z-index: 1;
    }
  }

  .came-full-btn {
    position: relative;
    z-index: 2;
    display: none;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    color: #979797;
    transition: all 0.3s ease 1s;
  }
}
.camera-fullwrapper {
  width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 99;
  background: rgba(0, 0, 0, 0.9);
  .camera-container {
    height: 100vh;
    width: 100vh;
    margin: 0 auto;
    border-radius: 50%;
    overflow: hidden;
    .camera-instance {
      position: relative;
      top: 0;
      height: 100%;
      width: auto;
    }
  }
}
.fz24 {
  font-size: 24px;
}
.close-icon {
  position: relative;
  top: 10px;
  right: 20px;
  cursor: pointer;
}
</style>
