export default {
  mounted(el: HTMLElement, { value }: { value: Function }) {
    if (typeof value !== 'function') {
      throw new Error("The v-debouce event is bound to an event");
    }

    let timer: number = 0
    let start = (e: MouseEvent | TouchEvent) => {
      if (timer) {
        timer && clearTimeout(timer)
        timer = 0
      }
      timer = setTimeout(() => {
        value(e)
      }, 300)
    }

    el.addEventListener('click', start)
  },
  updated() { },
  unMounted() { }
}