<template>
  <p>
    <span v-for="(nav, ind) in navs" class="tab">{{ nav }}</span>
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
 * 从左边移入从左向右滑
 * 从右边移入从右向左滑
 * 除了第一个有bug，第一次移入是从右向左
 */
.tab {
  position: relative;
  padding: 0 8px;
  &::before {
    content: "";
    width: 0;
    height: 100%;
    position: absolute;
    left: 100%;
    top: 0;
    border-bottom: 2px solid hotpink;
    transition: all 0.2s linear;
  }
  &:hover::before {
    width: 100%;
    left: 0;
  }
  &:hover ~ &::before {
    left: 0;
    width: 0;
  }
}
</style>
