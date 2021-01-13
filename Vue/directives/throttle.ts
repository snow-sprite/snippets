export default {
  created() { },
  beforeMount() {},
  mounted(el: HTMLElement, { value }: { value: Function }) {
    if (typeof value !== 'function') {
      throw new Error("The v-debouce event is bound to an event");
    }

    let throttle = (delay: number = 300) => {
      let timer: number = 0,
        preTime: number = 0
      return () => {
        let currentTime = +Date.now()
        
        if (currentTime - preTime < delay) {
          clearTimeout(timer)
          timer = setTimeout(() => {
            value()
            preTime = currentTime
            clearTimeout(timer)
            timer = 0
          }, delay)
        } else {
          value()
          preTime = currentTime
        }
      }
    }

    el.addEventListener('mousemove', throttle())
    
  },
  beforeUpdate() { },
  updated() { },
  beforeUnmount() { },
  unMounted() { }
}
