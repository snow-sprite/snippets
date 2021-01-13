import { VNode, DirectiveBinding } from "vue";

export default {
  mounted(el: HTMLElement, binding: DirectiveBinding, vnode: VNode) {
    if (typeof binding.value !== 'function') {
      throw new Error("longPress must bind Function!")
    }
    
    let timer: number = 0
    // 启动事件
    let start = (e: MouseEvent | TouchEvent) => {
      if (!timer) {
        timer = setTimeout(() => {
          callback(e)
        }, 500)
      }
    }

    // 取消事件
    let cancel = () => {
      timer && clearTimeout(timer)
      // 将timer的标识手动清为0
      timer = 0
    }

    // 回调
    const callback = (e: MouseEvent | TouchEvent) => {
      binding.value(e)
    }

    // 注册Event
    el.addEventListener('mousedown', start)
    el.addEventListener('touchstart', start)

    el.addEventListener('mouseout', cancel)
    el.addEventListener('mouseup', cancel)
    el.addEventListener('click', cancel)
    el.addEventListener('touchend', cancel)
    el.addEventListener('touchcancel', cancel)
  },
  updated(el: HTMLElement) { },
  unmounted(el: HTMLElement) { }
}
