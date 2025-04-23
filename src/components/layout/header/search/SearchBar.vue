<template>
  <u-search ref="searchRef" :config="config" class="search-bar hidden-xs-only" @submit="submit"></u-search>
</template>

<script setup lang="ts">
import { getCurrentInstance, ref, onBeforeMount } from 'vue'
import { SearchConfig, SearchInstance } from 'undraw-ui'
import { useRoute, useRouter } from "vue-router";
import { getSearchHotKeywordAPI } from '../../../../api/searchAPI';

const router = useRouter();
const route = useRoute();

onBeforeMount(() => {
  getSearchHotKeyword()
})

const getSearchHotKeyword = async () => {
  const res = await getSearchHotKeywordAPI();
  if (res.code === 200) {
    config.value.keywords = res.data;
    config.value.hotSearchList = res.data;
  } else {
    console.log(res.msg);
  }
}

const searchRef = ref<SearchInstance>()
const config = ref<SearchConfig>({
  keywords: [], // 搜索框关键字滚动
  hotSearchList: [] // top10 热门搜索 最多显示10条数据
})

const currentInstance = getCurrentInstance();
const submit = (val: string) => {
  //searchRef.value?.close()
  getSearchHotKeyword()
  router.push({ name: 'search', query: { keyword: val } })
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