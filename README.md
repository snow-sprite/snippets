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

- canvas
  - 绘制矩形 // strokeRect无填充
  [预览](https://snow-sprite.github.io/snippets/grid/1. strokeRect.html)
  - 绘制填充矩形 // fillRect填充
  [预览](https://snow-sprite.github.io/snippets/grid/2. fillRect.html)
  - 绘制路径
  [预览](https://snow-sprite.github.io/snippets/grid/3. 路径.html)
