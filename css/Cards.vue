<template>
  <ul class="wraper">
    <li class="card" v-for="lis in list" :key="lis.name" title="悬浮显示阴影">
      <div class="thumb">
        <img :src="lis.thumb" alt="" />
      </div>
      <div class="name">
        <span class="inline-block">{{ lis.name }}</span
        >&nbsp;
        <span class="inline-block" style="font-size: 12px;">{{
          lis.rate
        }}</span>
      </div>
      <div class="desc">
        <span>{{ lis.desc }}</span> <span>{{ lis.sing }}</span>
      </div>
    </li>
  </ul>
</template>

<script>
export default {
  name: "List",
  data() {
    return {
      list: [
        {
          name: "山",
          desc: "五A级景区",
          rate: "⭐⭐⭐⭐⭐",
          thumb:
            "https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg",
          sing: "happy new year"
        },
        {
          name: "小鸟",
          desc: "小鸟说“早早早”",
          rate: "⭐⭐⭐⭐",
          thumb:
            "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
          sing: "happy new year"
        },
        {
          name: "小鹿",
          desc: "小鹿抬头",
          rate: "⭐⭐⭐",
          thumb:
            "https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg",
          sing: "happy new year"
        },
        {
          name: "小马",
          desc: "三月马儿吃草",
          rate: "⭐⭐⭐⭐⭐",
          thumb:
            "https://fuss10.elemecdn.com/1/34/19aa98b1fcb2781c4fba33d850549jpeg.jpeg",
          sing: "happy new year"
        }
      ]
    };
  }
};
</script>

<style lang="scss" scoped>
* {
  margin: 0;
  padding: 0;
}
.wraper {
  width: 80%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  // 必要时折行
  flex-wrap: wrap;
  li {
    list-style: none;
  }
  .card {
    position: relative;
    left: 0;
    cursor: pointer;
    transition: transform 0.3s;
    &:hover {
      transform: translate(0, -10px);
      box-shadow: 4px 4px 5px 4px #ccc;
    }
    .name {
      .inline-block {
        display: inline-block;
      }
      font-weight: 600;
      font-size: 18px;
      color: tomato;
    }
    .rate {
      text-align: right;
    }
    .desc {
      padding-top: 10px;
      display: flex;
      justify-content: space-around;
      flex-wrap: wrap;
      color: cadetblue;
    }
    .thumb {
      img {
        padding: 0;
        width: 100%;
        height: 160px;
      }
    }
  }
}

@media (max-width: 600px) {
  .wraper {
    .card {
      width: calc(80% - 20px);
      margin: 0 auto 10px;
    }
  }
}
@media (min-width: 600px) {
  .wraper {
    .card {
      width: calc(50% - 20px);
      margin-bottom: 10px;
    }
  }
}
@media (min-width: 768px) {
  .wraper {
    .card {
      width: calc(33% - 20px);
      margin-bottom: 10px;
    }
  }
}

@media (min-width: 1200px) {
  .wraper {
    .card {
      width: calc(25% - 20px);
    }
  }
}
</style>
