<template>
  <p>
    <span v-for="(nav, ind) in navs" class="tab2">{{ nav }}</span>
  </p>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
export default class Index extends Vue {
  navs = ["是首页", "nav", "不限长导航", "导航", "awesome underline nav"];
}
</script>
<style lang="scss">
#app {
  text-align: center;
}

/** 
 * 不论鼠标从左边划入还是从右边划入，下划线一直是从左向右滑
 */
.tab2 {
  position: relative;
  padding: 0 8px;
  &::before {
    content: "";
    width: 0;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    border-bottom: 2px solid hotpink;
    transition: all 0.2s linear;
  }
  &:hover::before {
    width: 100%;
  }
}
</style>
