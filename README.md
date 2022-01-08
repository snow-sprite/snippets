# snippets

> 实用片段

- Vue

  - components
    ```javascript
    Sign.vue; // Canvas签名
    ```
  - directives
    ```
    longPress.ts // 长按(v-long-press="fn" or <with param>: v-long-press="() => fn(param)")
    ```
    ```
    debouce.ts // 防抖(v-debounce="fn")
    ```
    ```
    throttle.ts // 节流(v-throttle="fn")
    ```
    ```
    watermark.ts // 添加水印(v-watermark="msg" or v-watermark="{ text: msg, font: '48px', color: 'rgba(0, 250, 154, .2)', width: 150, height: 150, rotate: 30 }")
    ```

- css

  - NavSlide.vue; // 导航下划线（with bug：第一个 nav 第一次悬浮的时候下划线是从右边开始的）
  [预览](https://github.com/snow-sprite/snippets/raw/main/docs/demo/left-right.gif?raw=true)

  - NavSlideLeft.vue; // 导航下划线一直是从左下角开始往右滑动的
  [预览](https://github.com/snow-sprite/snippets/raw/main/docs/demo/left.gif?raw=true)

  - Cards.vue; // 卡片鼠标悬浮上移，窄屏`css`兼容
  [预览](https://github.com/snow-sprite/snippets/raw/main/docs/demo/cards.gif?raw=true)

  - grid布局
  [预览](https://snow-sprite.github.io/snippets/grid/grid.html)

  - shape-outside && clip-path内容根据自定义规则形状显示，超出隐藏
  [预览](https://snow-sprite.github.io/snippets/shape/shape-outside.html)
  
  - buttons按钮样式效果
  [预览](https://snow-sprite.github.io/snippets/css-effects/buttons-effect.html)

- canvas
  - 绘制矩形 // strokeRect无填充
  [预览](https://snow-sprite.github.io/snippets/canvas/1.strokeRect.html)
  - 绘制填充矩形 // fillRect填充
  [预览](https://snow-sprite.github.io/snippets/canvas/2.fillRect.html)
  - 绘制路径
  [预览](https://snow-sprite.github.io/snippets/canvas/3.路径.html)
  - 绘制弧度
  [预览](https://snow-sprite.github.io/snippets/canvas/4.弧度.html)
  - 绘制虚线
  [预览](https://snow-sprite.github.io/snippets/canvas/5.虚线.html)
  - 渐变
  [预览](https://snow-sprite.github.io/snippets/canvas/6.渐变.html)
  - 文字
  [预览](https://snow-sprite.github.io/snippets/canvas/7.文字.html)
  - 绘制图片
  [预览](https://snow-sprite.github.io/snippets/canvas/8.绘制图片.html)
  - 绘制视频
  [预览](https://snow-sprite.github.io/snippets/canvas/9.简易视频播放器.html)
  - 几何变换
  [预览](https://snow-sprite.github.io/snippets/canvas/10.几何变换.html)
  - save && restore
  [预览](https://snow-sprite.github.io/snippets/canvas/11.save&&restore.html)
  - 图形混合模式
  [预览](https://snow-sprite.github.io/snippets/canvas/12.图形混合模式.html)
  - 匀速运动
  [预览](https://snow-sprite.github.io/snippets/canvas/13.匀速运动.html)
  - 匀减速运动
  [预览](https://snow-sprite.github.io/snippets/canvas/14.匀减速运动.html)
