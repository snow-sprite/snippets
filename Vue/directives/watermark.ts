export default {
  created() {},
  beforeMount() {},
  mounted(el: HTMLElement, { value }: { value: Object | String }) {
    if (typeof value !== "string" && typeof value !== "object") {
      throw new Error("v-watermark: Error type!(Must be an Object or String.)");
    }
    el['_canvas'] = document.createElement("canvas");
    el['_ctx'] = el['_canvas']['getContext']("2d");
    el['_textAreaWidth'] = 150
    el['_textAreaHeight'] = 150
    el['$setMark'] = (value: Object | String) => {
      el['_canvas']['width'] = value['width'] || el['_textAreaWidth']
      el['_canvas']['height'] = value['height'] || el['_textAreaHeight']

      if (!el['_ctx']) throw new Error("Browser dosen't support Cancas！")
      el['_ctx'].clearRect(0, 0, el['_textAreaWidth'], el['_textAreaHeight'])
      el['_ctx'].font = `${value['font'] || '48px'} MicrosoftYaHei, PingFangSC`
      el['_ctx'].translate(el['_canvas']['width'] / 2, el['_canvas']['height'] / 2)
      el['_ctx'].textAlign = 'center'
      
      // rotate可能会为0
      if (value['rotate'] !== null && value['rotate'] !== undefined) {
        el['_ctx'].rotate(+value['rotate'] * Math.PI / 180)
      } else {
        el['_ctx'].rotate(-40 * Math.PI / 180)
      }
      
      el['_ctx'].strokeStyle = value['color'] || 'rgba(100, 100, 100, .2)'
      el['_ctx'].fillStyle = value['color'] || 'rgba(100, 100, 100, .2)'
      el['_ctx'].strokeText(value['text'] || value || '@Cid', 0, 0, el['_canvas']['width'])
      el['_ctx'].fillText(value['text'] || value || '@Cid', 0, 0, el['_canvas']['width'])
      
      el['style'].backgroundImage = `url(${el['_canvas']['toDataURL']('image/png')})`
    }
    el['$setMark'](value)
  },
  beforeUpdate() {},
  updated(el: HTMLElement, { value }: { value: Object | String }) {
    el['$setMark'](value)
  },
  beforeUnmount() {},
  unMounted() {}
};
