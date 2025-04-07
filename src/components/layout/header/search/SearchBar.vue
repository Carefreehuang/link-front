<template>
  <u-search ref="searchRef" :config="config" class="search-bar hidden-xs-only" @submit="submit"></u-search>
</template>

<script setup lang="ts">
import {getCurrentInstance, ref} from 'vue'
import { SearchConfig, SearchInstance } from 'undraw-ui'
import {useRoute, useRouter} from "vue-router";

const router = useRouter();
const route = useRoute();

const searchRef = ref<SearchInstance>()
const config = ref<SearchConfig>({
  keywords: ['计算机设计大赛', '挑战杯', '正大杯', '蓝桥杯', 'CCPC'], // 搜索框关键字滚动
  hotSearchList: [
      '正大杯',
      '蓝桥杯',
      '计算机设计大赛',
      '挑战杯',
      'ACM',
      'CCPC',
  ] // top10 热门搜索 最多显示10条数据
})

const currentInstance = getCurrentInstance();
const submit = (val: string) => {
  //searchRef.value?.close()
  router.push({name: 'search', query: {keyword: val}})
}
</script>

<style scoped>
.search-bar {
  width: 250px !important;
  margin-right: 15px;
}
</style>

<style>
.search-bar .card-box {
  width: 251px !important;
  margin-top: 2px;
}
html.dark .search-bar .card-box {
  background-color: var(--el-bg-color) !important;
  border: 1px solid #1d1e1f;
}

.search-bar .search {
  transition: unset !important;
  border-radius: 6px !important;
}
html.dark .search-bar .search {
  background-color: var(--el-bg-color) !important;
}
</style>