- components
  - Sign.vue; // Canvas 签名
  - Record.vue // 录屏（包括摄像头、音频）
    使用:
    ```javascript
      <body>
        <div class="recordContain unselect">
          <Record></Record>
        </div>
      </body>
      <style lang="scss" scoped>
        body {
          position: relative;
          .recordContain {
            position: absolute;
            left: 0;
            top: 100px;
          }
        }
      </style>
    ```
