import { VNode, DirectiveBinding } from "vue";

export default {
  mounted(el: HTMLElement, binding: DirectiveBinding, vnode: VNode) {
    if (typeof binding.value !== 'function') {
      throw new Error("v-longPress: Error Type!(Must be a Function.)")
    }
    
    el['timer'] = null
    // 启动事件
    el['start'] = (e: MouseEvent | TouchEvent) => {
      if (!el['timer']) {
        el['timer'] = setTimeout(() => {
          el['callback'](e)
        }, 500)
      }
    }

    // 取消事件
    el['cancel']  = () => {
      clearTimeout(el['timer'])
      el['timer'] = null
    }

    // 回调
    el['callback'] = (e: MouseEvent | TouchEvent) => {
      binding.value(e)
    }

    // 注册Event
    el.addEventListener('mousedown', el['start'])
    el.addEventListener('touchstart', el['start'])

    el.addEventListener('mouseout', el['cancel'])
    el.addEventListener('mouseup', el['cancel'])
    el.addEventListener('click', el['cancel'])
    el.addEventListener('touchend', el['cancel'])
    el.addEventListener('touchcancel', el['cancel'])
  },
  updated(el: HTMLElement) { },
  unMounted(el: HTMLElement) {
    el.removeEventListener('mousedown', el['start'])
    el.removeEventListener('touchstart', el['start'])

    el.removeEventListener('mouseout', el['cancel'])
    el.removeEventListener('mouseup', el['cancel'])
    el.removeEventListener('click', el['cancel'])
    el.removeEventListener('touchend', el['cancel'])
    el.removeEventListener('touchcancel', el['cancel'])

    clearTimeout(el['timer'])
    el['timer'] = null
  }
}
