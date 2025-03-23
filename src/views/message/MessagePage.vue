<template>
    <div>
        <el-container class="main-container">
            <el-main>
                <div class="trend" id="trend">
                    <div class="trend-header">
                        <el-scrollbar>
                            <div class="main-tab">
                                <!-- 修改后的 tab 栏 -->
                                <div class="tabs">
                                    <div :class="{ 'is-active': activeTab === 'unread' }" @click="changeTab('unread')">
                                        <span>未读消息</span>
                                    </div>
                                    <div :class="{ 'is-active': activeTab === 'all' }" @click="changeTab('all')">
                                        <span>全部消息</span>
                                    </div>
                                </div>
                            </div>
                        </el-scrollbar>
                    </div>
                    <div class="trend-body">
                        <!-- 消息列表 -->
                        <ul class="message-list">
                            <li v-for="message in filteredMessages" :key="message.id" @click="goToComment(message)"
                                :class="{ 'unread-message': message.isRead === 0 }">
                                <div class="message-card">
                                    <div class="message-header">
                                        <div class="message-title" v-html="message.title"></div>
                                        <div class="message-time">{{ moment(message.createTime).fromNow() }}</div>
                                    </div>
                                    <div class="message-content" v-html="message.content"></div>
                                </div>
                            </li>
                            <div v-if="activeTab === 'unread' && filteredMessages.length == 0" class="comment-container-box">
                                <el-empty description="还没有未读消息"/>
                            </div>
                            <div v-if="activeTab === 'all' && allMessages.length == 0" class="comment-container-box">
                                <el-empty description="没有历史消息"/>
                            </div>
                        </ul>
                        <!-- 分页组件 -->
                        <el-pagination
                            v-if="totalMessages > 0"
                            layout="prev, pager, next, jumper, ->, total"
                            small
                            background
                            :total="totalMessages"
                            :page-size="pageSize"
                            :current-page="currentPage"
                            @update:current-page="changePage"
                        ></el-pagination>
                    </div>
                </div>
            </el-main>
        </el-container>
    </div>
</template>

<script setup lang="ts">
import useTabStore from '../../stores/tabStore';
import useUserStore from '../../stores/userStore';
import { useRoute, useRouter } from "vue-router";
import 'element-plus/theme-chalk/display.css';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { getAllComments, readComment } from '../../api/commentAPI'; // 假设这里有获取消息的 API
import moment from 'moment';

const route = useRoute();
const router = useRouter();
const tabStore = useTabStore();
const userStore = useUserStore();

// 存储所有消息
const allMessages = ref([]);
// 当前激活的 tab
const activeTab = ref('unread');
// 当前页码
const currentPage = ref(1);
// 每页显示的消息数量
const pageSize = ref(10);
// 总消息数
const totalMessages = ref(0);

// 根据当前激活的 tab 过滤消息
const filteredMessages = computed(() => {
    if (activeTab.value === 'unread') {
        return allMessages.value.filter(message => message.isRead === 0);
    }
    return allMessages.value;
});

// 计算当前页的消息
const paginatedMessages = computed(() => {
    const startIndex = (currentPage.value - 1) * pageSize.value;
    const endIndex = startIndex + pageSize.value;
    return filteredMessages.value.slice(startIndex, endIndex);
});

let timer: number | null = null;

// 卸载定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});

// 获取消息列表
const getMessages = async () => {
    try {
        const response = await getAllComments({
            page: currentPage.value,
            pageSize: pageSize.value,
            type: activeTab.value
        });
        allMessages.value = response.data.allComments;
        totalMessages.value = response.data.total;
    } catch (error) {
        console.error('获取消息列表失败:', error);
    }
};

// 跳转到具体的 comment 位置
const goToComment = (message) => {
    router.push({ path: `/p/${message.pid}` });
    readComment(message.id);
};

// 切换 tab
const changeTab = (tab) => {
    activeTab.value = tab;
    currentPage.value = 1; // 切换 tab 时重置页码
    getMessages();
};

// 切换页码
const changePage = (page) => {
    currentPage.value = page;
    getMessages();
};

// 页面加载时获取消息列表
onMounted(() => {
    if (userStore.isLogin) {
        getMessages();
        timer = setInterval(getMessages, 5000); // 每5s请求一次
    }
});
</script>

<style scoped>
.trend {
    box-shadow: var(--custom-aside-box-shadow);
    border-radius: var(--custom-border-radius);
    margin: 2px;
}

.trend-header {
    padding: 10px;
    border-radius: var(--custom-border-radius) var(--custom-border-radius) 0 0;
    background: var(--el-bg-color-overlay);
    border-bottom: 1px solid var(--custom-trend-td-bottom-color);
}

html.dark .trend-header {
    background-color: var(--custom-trend-header-bg-color);
}

.trend-body {
    padding: 0 10px 1px 10px;
    min-height: 98vh;
    background: var(--el-bg-color-overlay);
    border-radius: 0 0 var(--custom-border-radius) var(--custom-border-radius);
}

html.dark .trend-body {
    background-color: var(--custom-trend-header-bg-color);
}

.is-active {
    color: var(--el-menu-active-color) !important;
}

.tabs {
    display: flex;
}

.tabs > div {
    display: flex;
    text-decoration: none;
    white-space: nowrap;
    color: var(--custom-tabs-color);
    transition: all .2s;
    cursor: pointer;
}

.tabs > div:not(:last-child) {
    margin-right: 25px;
}

.tabs > div:hover {
    color: var(--el-menu-active-color);
}

.activity {
    display: flex;
    justify-content: flex-end;
    margin-top: -22px;
}

.aside-block {
    height: 200px;
    border-radius: var(--custom-border-radius);
    background-color: var(--custom-trend-header-bg-color);
}

.aside-block.one {
    background: linear-gradient(45deg, #dca 12%, transparent 0, transparent 88%, #dca 0),
    linear-gradient(135deg, transparent 37%, #a85 0, #a85 63%, transparent 0),
    linear-gradient(45deg, transparent 37%, #dca 0, #dca 63%, transparent 0) #753;
    background-size: 25px 25px;
}

.aside-block.two {
    background: url(http://localhost:8080/static/image/brick.webp);
    background-size: 300px;
}

.aside-block.three {
    background: url(http://localhost:8080/static/image/tg.svg),
    linear-gradient(-20deg, #dcb0ed 0%, #99c99c 100%) repeat center center;
    background-blend-mode: soft-light;
    background-size: 300px, cover;
}

.message-list {
    list-style-type: none;
    padding: 0;
}

.message-card {
    background-color: var(--el-bg-color-overlay);
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 10px;
    margin-bottom: 10px;
    transition: box-shadow 0.3s ease;
}

.message-card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.message-title {
    font-weight: bold;
    font-size: 1.1rem;
}

.message-time {
    font-size: 0.8rem;
    color: var(--custom-trend-tr-time-color);
}

.message-content {
    margin-top: 5px;
    line-height: 1.4;
}

.unread-message {
    background-color: rgba(135, 206, 250, 0.1);
    border-left: 4px solid #f50000;
}
</style>

<style>
html.dark .el-pagination.is-background .btn-next {
    background-color: #333841 !important;
}

html.dark .el-pagination.is-background .btn-prev:disabled,
html.dark .el-pagination.is-background .btn-next:disabled {
    background-color: #303030 !important;
}

html.dark .el-progress.is-warning .el-progress-bar__inner {
    background-color: #9acd31;
}

html.dark .el-progress-bar__outer {
    background-color: var(--el-bg-color);
}

.el-progress-bar__innerText {
    color: #303133;
}

.fade-leave-active, .fade-enter-active {
    transition: all .5s;
}

.fade-enter {
    opacity: 0;
}

.fade-leave-to {
    opacity: 0;
}

.main-container .el-main {
    padding: unset !important;
}

@media only screen and (min-width: 991px) {
    .main-container .el-main {
        margin-right: 15px;
    }
}
</style>