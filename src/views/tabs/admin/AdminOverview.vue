<template>
  <div class="status-box" v-loading="loading" element-loading-text="正在加载">
    <div v-if="!loading">
      <div class="forum-status">
        <el-card shadow="hover" class="status-card" style="width: 200px;">
          <el-statistic title="用户数" :value="forum.userNumber" />
        </el-card>
        <el-card shadow="hover" class="status-card" style="width: 200px;">
          <el-statistic title="文章数" :value="forum.postNumber" />
        </el-card>
        <el-card shadow="hover" class="status-card" style="width: 200px;">
          <el-statistic title="竞赛数" :value="forum.competitionNumber" />
        </el-card>
      </div>
      <!-- <el-empty description="其它状态正在生产中" style="padding-top: 0;" /> -->
    </div>
  </div>
</template>

<script setup>
import { onBeforeMount, reactive } from 'vue';
import { getForumAPI } from "../../../api/admin/overviewAPI";
import { useRouter } from "vue-router";

const router = useRouter();

const forum = reactive({
  userNumber: 0,
  postNumber: 0,
  competitionNumber: 0,
})


const colors = [
  { color: '#006400', percentage: 10 },
  { color: '#2E8B57', percentage: 20 },
  { color: '#8FBC8F', percentage: 30 },
  { color: '#9ACD32', percentage: 40 },
  { color: '#48D1CC', percentage: 50 },
  { color: '#EEDC82', percentage: 60 },
  { color: '#BDB76B', percentage: 70 },
  { color: '#DAA520', percentage: 80 },
  { color: '#F4A460', percentage: 90 },
  { color: '#A52A2A', percentage: 100 },
]

onBeforeMount(() => {
  getSystemInfo();
})

const getSystemInfo = async () => {
  const res = await getForumAPI();
  if (res.code === 200) {
    forum.userNumber = res.data.userNumber;
    forum.postNumber = res.data.postNumber;
    forum.competitionNumber = res.data.competitionNumber;
  } else {
    ElMessage.error(res.msg);
  }
}

</script>

<style scoped>
.percentage-value {
  display: block;
  margin-top: 10px;
  font-size: 28px;
}

.percentage-label {
  display: block;
  margin-top: 10px;
  font-size: 12px;
}

.demo-progress .el-progress--line {
  margin-bottom: 15px;
  width: 350px;
}

.demo-progress .el-progress--circle {
  margin-right: 15px;
}

.system-status,
.forum-status {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  padding: 50px 0;
}

.system-status {
  border-bottom: 1px solid #e4e7ec;
}

html.dark .system-status {
  border-bottom-color: #333840;
}
</style>

<style>
.status-card .el-statistic__head,
.status-card .el-statistic__content {
  display: flex;
  justify-content: left;
}

.status-box .el-loading-spinner {
  margin-top: 100px !important;
}

.status-card {
  transition: unset !important;
}
</style>