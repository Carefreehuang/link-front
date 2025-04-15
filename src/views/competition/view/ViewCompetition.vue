<template>
  <div class="post-container" v-if="loadingError">
    <div class="post-container-body error">
      <el-empty :description="loadingErrorText"></el-empty>
    </div>
  </div>

  <div class="post-container" v-else>
    <el-container>
      <el-main class="post-container-main">
        <el-image :src="competition.competitionImg" fit="cover" style="width: 100%;">
        </el-image>
        <div class="post-container-box">
          <el-skeleton :loading="loading" animated>
            <template #template>
              <el-skeleton-item variant="text" class="post-title-skeleton"></el-skeleton-item>
              <el-skeleton-item variant="text" class="post-attach-skeleton"></el-skeleton-item>
            </template>
            <template #default>
              <div class="post-container-header">
                <div class="post-title" v-text="competition.competitionName"></div>
                <div class="title-sub">
                  <router-link :to="{ path: '/u/' + author.name }" class="hidden-sm-and-up">
                    <el-avatar size="small" :src="author.avatar" shape="square" style="margin-right: 5px;" />
                  </router-link>
                  <ul class="post-attach">
                    <li>
                      <div class="post-attach-icon" style="margin-top: 1.4px;"><i class="czs-eye"
                          style="font-size: 18px;" /></div>
                      <span v-text="competition.views" />
                    </li>
                  </ul>
                </div>
                <el-divider border-style="dashed" style="margin: 0 0 12px" />
              </div>
            </template>
          </el-skeleton>
          <el-skeleton :loading="loading" animated v-if="loading" class="post-content-skeleton">
            <el-skeleton-item variant="text"></el-skeleton-item>
          </el-skeleton>
          <div class="post-container-body" v-show="!loading">
            <div id="content" />
            <div class="post-tags hidden-sm-and-up" style="margin-top: 10px;">
              <el-tag v-for="(tag, index) of competition.tag" size="small" class="post-tag"
                :type="randomTagType(index)">
                <router-link :to="{ path: '/t/' + tag.label }" class="post-tag-link">
                  {{ tag.name }}
                </router-link>
              </el-tag>
            </div>
          </div>
        </div>

        <PostList :posts="posts" v-if="!loading" :total-items="totalItems" :total-page="totalPages"
          :current-page="currentPage" :size-per-page="sizePerPage" :is-all-post="false" @changePage="changeCurrentPage"
          :loading="loading" />
      </el-main>

    </el-container>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onBeforeMount, onMounted, reactive, ref, watch } from "vue";
import { getPostInfoAPI, getPostsByCompetitionAPI } from '../../../api/postAPI'
import 'vditor/dist/index.css';
import useUserStore from '../../../stores/userStore';
import Operations from "../../../components/post/Operations.vue";
import 'element-plus/theme-chalk/display.css';
import Comments from "../../../components/comment/Comments.vue";
import moment from "moment";
import VditorPreview from 'vditor/dist/method.min';
import useThemeStore from '../../../stores/themeStore';
import HotTagAside from "../../../components/layout/aside/index/HotTagAside.vue";
import CountdownAside from "../../../components/layout/aside/index/CountdownAside.vue";
import PostAuthorAside from "../../../components/layout/aside/post/PostAuthorAside.vue";
import { useRoute, useRouter } from "vue-router";
import { getCompetitionInfoAPI, viewCompetitionAPI } from "../../../api/competitionAPI";

const userStore = useUserStore();
const themeStore = useThemeStore();
const route = useRoute();
const router = useRouter();

const props = defineProps({
  pid: String, /* 从URL中获取 */
  tagLabel: String,
})

const posts = ref([]);
const currentPage = ref(1);
const sizePerPage = ref(30);
const totalItems = ref();
const totalPages = ref();

const competition = reactive({
  id: String,
  competitionName: String,
  description: String,
  categoryId: Number,
  tag: Object,
  officialWebsite: String,
  registrationStart: String,
  registrationEnd: String,
  competitionStart: String,
  competitionEnd: String,
  competitionImg: String,
  createdTime: String,
  updatedTime: String,
  createdAt: String,
  updatedAt: String,
  status: Number,
  views: Number,
  likes: Number,
})

const post = reactive({
  id: String,
  tags: Array,
  title: String,
  content: String,
  authorUid: String,
  createTime: String,
  replyNumber: Number,
  viewNumber: Number,
})
const author = reactive({
  id: Number,
  uid: String,
  name: String,
  avatar: String,
  nickname: String,
  role: Object,
})
const loading = ref(false)
const loadingError = ref(false)

const hljsTheme = ref();
const contentTheme = ref();
onBeforeMount(() => {
  getCompetitionInfo(props.pid);
  let localStorageTheme = localStorage.getItem('vueuse-color-scheme');
  hljsTheme.value = localStorageTheme === 'dark' ? 'native' : 'emacs';
  contentTheme.value = localStorageTheme === 'dark' ? 'dark' : 'light';
})
watch(() => themeStore.currentTheme, (New, Old) => {
  if (New === 'dark') {
    hljsTheme.value = 'native';
    themeStore.hljsTheme = 'native';
    contentTheme.value = 'dark';
    renderMarkdown(post.content);
  } else {
    hljsTheme.value = 'emacs';
    themeStore.hljsTheme = 'emacs';
    contentTheme.value = 'light';
    renderMarkdown(post.content);
  }
})

const getPostsByCompetitionId = async () => {
  const res = await getPostsByCompetitionAPI(props.pid, currentPage.value);
  posts.value = res.data.posts;

}

onMounted(() => {
  getPostsByCompetitionId();
  viewCompetiton();
})

const viewCompetiton = async () => {
  await viewCompetitionAPI(props.pid);
}

// 渲染主题内容
const renderMarkdown = (content) => {
  VditorPreview.preview(document.getElementById('content'), content, {
    anchor: 2,
    hljs: {
      enable: true, /*启用代码高亮*/
      style: hljsTheme.value, /* 代码美化风格，预览：https://xyproto.github.io/splash/docs/longer/all.html */
      lineNumber: true, /*显示代码行号*/
    },
    theme: {
      current: contentTheme.value,
    },
    preview: {
      markdown: {
        autoSpace: true,
        fixTermTypo: true,
      }
    }
  });
}

function changeCurrentPage(newPage) {
  currentPage.value = newPage;
  getTagAndPosts(newPage);

  if (newPage === 1) {
    router.push({ path: '/t/' + props.tagLabel })
  } else {
    router.push({ path: '/t/' + props.tagLabel, query: { page: newPage } })
  }
}

function getTagAndPosts(page) {
  loading.value = true;
  setTimeout(() => {
    getTagAPI(props.tagLabel, page).then(response => {
      posts.value = response.data.posts;
      tag.value = response.data.tag;
      document.title = tag.value.name + ' - ' + global_title;
      totalItems.value = posts.value.length;
      totalPages.value = response.data.totalPages;
      loadingError.value = false;
      console.log(response)
    }).catch(error => {
      loadingErrorText.value = error.message;
      loadingError.value = true;
      console.log(error)
    }).finally(() => {
      loading.value = false;
    })
  }, 500)
}

// 加载帖子出错显示的文字内容
const loadingErrorText = ref();

/**
 * 获取帖子信息
 * @param pid 帖子ID
 */
function getPostInfo(pid: String) {
  if (pid.length === 19) {
    loading.value = true;
    setTimeout(() => {
      getPostInfoAPI(pid).then(response => {
        let responseData = response.data;

        post.id = responseData.post.id;
        post.tags = responseData.post.tags;
        post.title = responseData.post.title;
        document.title = responseData.post.title;
        post.content = responseData.post.content;
        post.authorUid = responseData.post.uid;
        post.createTime = responseData.post.createTime;
        post.replyNumber = responseData.post.replyNumber;
        post.viewNumber = responseData.post.viewNumber;

        author.id = responseData.id;
        author.uid = responseData.uid;
        author.name = responseData.username;
        author.nickname = responseData.nickname;
        author.avatar = responseData.avatar;
        author.role = responseData.role;

        renderMarkdown(post.content);
        loadingError.value = false;

        console.log(responseData)
      }).catch(error => {
        loadingError.value = true;
        if (error === '权限不足') {
          loadingErrorText.value = '权限不足，请登录后再尝试';
        } else {
          loadingErrorText.value = '加载帖子出错，请稍后重试';
        }
        if (error.code === 404) {
          loadingErrorText.value = '404 Not Found';
        }
        console.log(error)
      }).finally(() => {
        loading.value = false;
      })
    }, 500)
  } else loadingError.value = true;
}

function getPostList(competitionId) {

}


const getCompetitionInfo = async() => {
  loading.value = true;
  const res = await getCompetitionInfoAPI(props.pid);
  if (res.code === 200) {
    competition.id = res.data.id;
    competition.competitionName = res.data.competitionName;
    competition.description = res.data.description;
    competition.categoryId = res.data.categoryId;
    competition.tag = res.data.tags;
    competition.officialWebsite = res.data.officialWebsite;
    competition.registrationStart = res.data.registrationStart;
    competition.registrationEnd = res.data.registrationEnd;
    competition.competitionStart = res.data.competitionStart;
    competition.competitionEnd = res.data.competitionEnd;
    competition.competitionImg = res.data.competitionImg;
    competition.createdAt = res.data.createdAt;
    competition.updatedAt = res.data.updatedAt;
    competition.status = res.data.status;
    competition.views = res.data.views;
    competition.likes = res.data.likes;

    loading.value = false;
    renderMarkdown(competition.description);
    loadingError.value = false;
  } else {
    loadingError.value = true;
    if (res.code === 404) {
      loadingErrorText.value = '404 Not Found';
    } else {
      loadingErrorText.value = res.msg;
    }
  }
}

/*子组件修改帖子内容完成后，父组件同步修改帖子内容*/
function changeContent(content) {
  post.content = content;
  renderMarkdown(post.content);
}

/*子组件修改帖子标题完成后，父组件同步修改帖子标题*/
function changeTitle(title) {
  post.title = title;
}

/*子组件修改帖子标签完成后，父组件同步修改帖子标签*/
function changePostTags(newTags) {
  console.log(newTags)
  post.tags = newTags;
}

function updateCommentNum() {
  post.replyNumber++;
}

function randomTagType(index) {
  switch (index) {
    case 0: return 'warning';
    case 1: return 'success';
    case 2: return '';
    case 3: return 'info';
    default: return 'danger';
  }
}
</script>

<style scoped>
.post-container-main {
  padding: 0;
}

.test {
  position: sticky;
  top: 80px;
}

.post-container-box {
  background: white;
  padding: 12px 16px;
  border-radius: var(--custom-border-radius);
  border: 1px solid #E6E8EB;
}

html.dark .post-container-box {
  background: var(--custom-trend-header-bg-color);
  border-color: transparent;
}

@media screen and (max-width: 768px) {
  .post-container-box {
    padding: 8px 10px 12px;
  }

  .post-container-body {
    padding-bottom: 15px !important;
    padding-top: 0 !important;
    margin-top: -3px;
  }
}

.post-container-body {
  padding-bottom: 18px;
  padding-top: 3px;
}

.post-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #3c4351;
  line-height: 1.3;
  padding-bottom: 6px;
  text-align: justify;
}

html.dark .post-title {
  color: #E4E7ED;
}

@media screen and (max-width: 768px) {
  .post-title {
    font-size: 1.5rem;
  }
}

.post-attach {
  padding-inline-start: 0;
  margin-block-start: 0;
  margin-block-end: 0;
  color: #bcc3ce;
  display: flex;
  font-size: 16px;
  padding-left: 1px;
}

html.dark .post-attach {
  color: #8f959f;
}

.post-title-skeleton {
  height: 29px;
  margin-top: 8px;
  margin-bottom: 8px;
}

.post-attach-skeleton {
  height: 18px;
}

.post-content-skeleton {
  padding-top: 14px;
}

.post-attach li {
  list-style: none;
  display: flex;
}

.post-attach li:not(:last-child) {
  margin-right: 20px;
}

.post-attach-icon {
  margin-top: 1px;
  padding-right: 5px;
}

#content {
  text-align: justify;
  font-size: 15px;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
}

.divider {
  display: flex;
  justify-content: space-between;
}

.d-1,
.d-2 {
  height: 24px;
  border-left: 3px;
  border-color: #C0C4CC;
}

.d-1 {
  border-style: inset;
  margin: 0 0 0 47px;
}

.d-2 {
  border-style: outset;
  margin: 0 47px 0 0;
}

html.dark .d-1,
html.dark .d-2 {
  border-color: #606266;
}

@media screen and (max-width: 768px) {

  .d-1,
  .d-2 {
    height: 10px;
  }
}

.post-tags {
  margin-top: -1px;
}

.post-tags>.post-tag:not(:last-child) {
  margin-right: 5px;
}

.post-tag-link {
  color: currentColor;
  text-decoration: unset;
}

.title-sub {
  display: flex;
  justify-content: space-between;
}

@media screen and (max-width: 768px) {
  .title-sub {
    justify-content: unset;
    margin-bottom: 6px;
  }

  .post-attach li:not(:last-child) {
    margin-right: 15px;
  }
}

.author-link {
  color: #bcc3ce;
  display: flex;
  text-decoration: unset;
}

html.dark .author-link {
  color: #8f959f;
}
</style>

<style>
html.dark .vditor-reset h1,
html.dark .vditor-reset h2 {
  border-bottom: 1px solid var(--el-bg-color);
}

html.dark .vditor-reset blockquote {
  border-left-color: #606266;
}

html.dark .post-container-body .vditor-reset .language-mermaid,
html.dark .post-container-body .vditor-reset .language-echarts,
html.dark .post-container-body .vditor-reset .language-mindmap,
html.dark .post-container-body .vditor-reset .language-flowchart {
  background-color: #f7f8fa;
  border-radius: 3px;
}

.language-echarts>div:first-child {
  margin-top: 18px !important;
  margin-left: 25px !important;
}

#mermaid-1677487584245 {
  margin-left: 10px;
  margin-top: 20px;
}

.post-container-body .vditor-reset>h1:first-child,
.post-container-body .vditor-reset>h2:first-child,
.post-container-body .vditor-reset>h3:first-child,
.post-container-body .vditor-reset>h4:first-child,
.post-container-body .vditor-reset>h5:first-child,
.post-container-body .vditor-reset>h6:first-child {
  margin-top: 0;
}

.post-container-body .vditor-reset>pre {
  margin-top: 0;
}
</style>