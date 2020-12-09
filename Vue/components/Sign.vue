<template>
  <canvas style="border: 1px solid;" ref="canvas" width="300" height="150" />
</template>

<script>
import { onMounted, ref } from 'vue'
export default {
  name: 'Sign',
  setup() {
    const canvas = ref(null)

    onMounted(_ => {
      const writing = (
        beginX,
        beginY,
        stopX,
        stopY,
        ctx
      ) => {
        ctx.beginPath()  // 开启一条新路径
        ctx.globalAlpha = 1  // 设置图片的透明度
        ctx.lineWidth = 3  // 设置线宽
        ctx.strokeStyle = 'red'  // 设置路径颜色
        ctx.moveTo(beginX, beginY)  // 从(beginX, beginY)这个坐标点开始画图
        ctx.lineTo(stopX, stopY)  // 定义从(beginX, beginY)到(stopX, stopY)的线条（该方法不会创建线条）
        ctx.closePath()  // 创建该条路径
        ctx.stroke()  // 实际地绘制出通过 moveTo() 和 lineTo() 方法定义的路径。默认颜色是黑色。
        
      }

      let beginX, beginY, stopX, stopY
      const ctx = canvas.value.getContext('2d')
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)

      canvas.value.addEventListener('touchstart', event => {
        event.preventDefault() // 阻止在canvas画布上签名的时候页面跟着滚动
        event = event.touches[0]
        beginX = event.clientX - canvas.value.offsetLeft 
        beginY = event.pageY - canvas.value.offsetTop
      })

      canvas.value.addEventListener('touchmove', event => {
        event.preventDefault() // 阻止在canvas画布上签名的时候页面跟着滚动
        event = event.touches[0]
        stopX = event.clientX - canvas.value.offsetLeft
        stopY = event.pageY - canvas.value.offsetTop
        writing(beginX, beginY, stopX, stopY, ctx)
        beginX = stopX // 这一步很关键，需要不断更新起点，否则画出来的是射线簇
        beginY = stopY
      })
    })

    return { canvas }
  }
}
</script>