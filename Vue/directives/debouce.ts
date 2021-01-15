export default {
  mounted(el: HTMLElement, { value }: { value: Function }) {
    if (typeof value !== 'function') {
      throw new Error("v-debounce: Error Type!(Must be a Function.)");
    }

    el['timer'] = null
    el['start'] = (e: MouseEvent | TouchEvent) => {
      if (el['timer']) {
        el['timer'] && clearTimeout(el['timer'])
        el['timer'] = 0
      }
      el['timer'] = setTimeout(() => {
        value(e)
      }, 300)
    }

    el.addEventListener('click', el['start'])
  },
  updated() { },
  beforeUnmount(el: HTMLElement) {
    el.removeEventListener('click', el['start'])

    clearTimeout(el['timer'])
    el['timer'] = null
  }
}