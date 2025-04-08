<template>
  <div>
    <div class="hidden-xs-only">
      <el-input v-model="title" placeholder="请输入标题" class="title-tag" clearable size="large">
        <template #prepend>
          <el-cascader ref="dialogTagCascadeRef" v-model="selectedTags" :options="cascadeOptions"
            :show-all-levels="false" placeholder="请选择相关标签" size="large" :props="tagCascadeProp" collapse-tags
            collapse-tags-tooltip popper-class="tag-cascade" tag-type="success" @change="handleTagSelect">
            <template #default="{ node, data }">
              <span v-text="data.label" />
              <span v-if="!node.isLeaf" v-text="' (' + data.children.length + ')'" />
            </template>
          </el-cascader>
          <!-- 新增的竞赛级联选择器 -->
          <el-cascader v-model="selectedCompetition" :options="competitionCascadeOptions" :show-all-levels="false"
            placeholder="请选择相关竞赛" size="large" :props="competitionCascadeProp" collapse-tags collapse-tags-tooltip
            popper-class="competition-cascade" tag-type="success" @change="handleCompetitionSelect">
            <template #default="{ node, data }">
              <span v-text="data.label" />
              <span v-if="!node.isLeaf" v-text="' (' + data.children.length + ')'" />
            </template>
          </el-cascader>
        </template>
      </el-input>
    </div>

    <div class="hidden-sm-and-up">
      <el-cascader ref="dialogTagCascadeRef" v-model="selectedTags" :options="cascadeOptions" :show-all-levels="false"
        placeholder="请选择标签" size="large" :props="tagCascadeProp" popper-class="tag-cascade" class="mobile-tag-cascader"
        tag-type="success" @change="handleTagSelect">
        <template #default="{ node, data }">
          <span v-text="data.label" />
          <span v-if="!node.isLeaf" v-text="' (' + data.children.length + ')'" />
        </template>
      </el-cascader>
      <el-input v-model="title" placeholder="请输入标题" clearable size="large" class="title-tag" />
    </div>

    <Editor ref="writeEditor" height="80vh" @limit-exceed="limitExceed" @no-limit-exceed="noLimitExceed"
      :cache-id="'newPost'" :clear-content="clearEditorContent" @clear-content-done="clearEditorContentDone"
      editorPlaceholder="请输入帖子内容" />

    <div class="actionButton">
      <el-button color="#626aef" plain @click="postAction" :disabled="disabledPost"
        :loading="postLoading">发布</el-button>
      <el-switch v-model="canContact" class="mt-2" style="margin-left: 24px" inline-prompt active-value="1"
        inactive-value="0" :active-icon="Check" :inactive-icon="Close" active-text="是" inactive-text="否" /><span
        style="margin-left: 5px; font-size: 14px;">允许其他用户联系我</span>
      <el-link type="primary" style="float: right; margin-top: 5px;">⌘ 支持 Markdown 语法 ⌘</el-link>
    </div>

    <el-dialog v-model="showPostResultDialog" :show-close="showPostResultClose" :title="postResultDialogTitle"
      width="395px" center destroy-on-close :lock-scroll="false">
      <span v-text="postResultDialogText"></span>
    </el-dialog>
  </div>
</template>

<script setup>
import Editor from "../../../components/editor/Editor.vue";
import { getCurrentInstance, nextTick, onBeforeMount, reactive, ref } from "vue";
import { doPost } from "../../../api/postApi";
import { ElMessage, ElNotification } from "element-plus";
import { getTagsAndOptionsAPI } from "../../../api/admin/tagAPI";
import { cascadeTags, classifyTagOptions } from "../../../utils/tags";
import { useRouter } from "vue-router";
import { getCategoryAndCompetitionsAPI } from "../../../api/admin/categoryAPI";

const router = useRouter();

const writeEditor = ref(null);

const title = ref('')

const tagOptions = ref([]);
const tags = ref([]);
const cascadeOptions = ref([]);
const tagCascadeProp = reactive({
  multiple: true,
  emitPath: false,
})
const selectedCompetition = ref(null);
const competitionCascadeOptions = ref([]);
const competitionCascadeProp = reactive({
  multiple: false,
  emitPath: true,
})

const getCategoryAndCompetitions = async () => {
  const res = await getCategoryAndCompetitionsAPI();
  console.log(res)
  if (res.code === 200) {
    const { categories, competitions } = res.data;
    const cascadeOptions = categories.map(category => {
      const children = competitions.filter(competition => competition.categoryId.toString() === category.id)
        .map(competition => ({
          value: competition.id,
          label: competition.competitionName
        }));
      return {
        value: category.id,
        label: category.name,
        children
      };
    });
    competitionCascadeOptions.value = cascadeOptions;
  } else {
    ElNotification.error({
      title: '获取竞赛列表失败',
      message: res.msg,
    })
  }
}

onBeforeMount(() => {
  getTagsAndOptionsAPI().then(response => {
    tagOptions.value = classifyTagOptions(response.data.tagOptions);
    tags.value = response.data.tags;
    cascadeOptions.value = cascadeTags(tags.value, tagOptions.value);
  }).catch(error => {
    console.log(error)
  })
  getCategoryAndCompetitions();
})

const disabledPost = ref(false)
const limitExceed = () => {
  disabledPost.value = true;
}
const noLimitExceed = () => {
  disabledPost.value = false;
}

const postLoading = ref(false);
const showPostResultDialog = ref(false);
const showPostResultClose = ref(false);
const postResultDialogTitle = ref('');
const postResultDialogText = ref('');
const clearEditorContent = ref(false);
const canContact = ref(0);

const postAction = () => {
  const { editor } = writeEditor.value;
  if (!title.value || title.value.length <= 0) {
    ElMessage({
      message: '请输入标题',
      type: 'warning',
    })
  } else if (!editor.getValue() || editor.getValue().trim().length <= 0) {
    ElMessage({
      message: '请输入主题内容',
      type: 'warning',
    })
  } else if (selectedTags.value === undefined || selectedTags.value.length === 0) {
    ElMessage({
      message: '请选择主题标签',
      type: 'warning',
    })
  } else if (selectedCompetition.value === undefined || selectedCompetition.value.length === 0) {
    ElMessage({
      message: '请选择相关竞赛',
      type: 'warning',
    })
  } else {
    let selected = [];
    selectedTags.value.forEach(tagLabel => {
      selected.push({ label: tagLabel })
    })
    postLoading.value = true;
    setTimeout(() => {
      // 这里需要将 selectedCompetition 传递给后端
      doPost(title.value, editor.getHTML(), selected, canContact.value, selectedCompetition.value).then(response => {
        showPostResultDialog.value = true;
        showPostResultClose.value = false;
        postResultDialogTitle.value = '发布成功';

        let time = 3;
        postResultDialogText.value = '3 秒后将自动跳转到新主题页...';
        let timer = setInterval(() => {
          time--;
          postResultDialogText.value = time + ' 秒后将自动跳转到新主题页...';
          if (time === 0) {
            clearInterval(timer);
            router.push({ path: '/p/' + response.data.postId });
            showPostResultDialog.value = false;
            title.value = null;
            clearEditorContent.value = true;
            selectedTags.value = undefined;
            selectedCompetition.value = undefined;
          }
        }, 1000)
        console.log(response)
      }).catch(error => {
        showPostResultDialog.value = true;
        showPostResultClose.value = true;
        postResultDialogTitle.value = '发布失败';
        postResultDialogText.value = '请重试，如仍不能发布，请及时反馈管理员。';
        console.log(error)
      }).finally(() => {
        postLoading.value = false;
      })
    }, 500)
  }
}

const selectedTags = ref();
const oldSelectedTags = ref();
function handleTagSelect(value) {
  if (value.length <= 3) {
    oldSelectedTags.value = value;
  } else {
    ElMessage({
      message: '不能超过三个标签',
      type: 'warning',
    })
    nextTick(() => {
      selectedTags.value = oldSelectedTags.value;
    })
  }
}

const oldSelectedCompetition = ref(null);

function handleCompetitionSelect(value) {
  console.log(value)
  if (value.length == 2) {
    oldSelectedCompetition.value = value[1];
    selectedCompetition.value = value[1];
  } else {
    ElMessage({
      message: '请选择具体赛事',
      type: 'warning',
    })
    nextTick(() => {
      selectedCompetition.value = oldSelectedCompetition.value;
    })
  }
}

function clearEditorContentDone() {
  clearEditorContent.value = false;
}
</script>

<style scoped>
.title-tag {
  background-color: var(--el-fill-color-blank);
  margin-bottom: 10px;
}

.actionButton {
  margin-top: 10px;
}
</style>

<style>
.title-tag .el-input-group__prepend {
  padding: 0;
}

.title-tag .el-input__wrapper,
.mobile-tag-cascader .el-input__wrapper {
  transition: unset;
}

html.dark .el-input__wrapper {
  background: #24292f;
}

html.dark .title-tag .el-input--suffix .el-input__wrapper {
  background: #1d2125;
}

.tag-cascade .el-cascader-menu__wrap.el-scrollbar__wrap {
  height: 100%;
}

.mobile-tag-cascader.el-cascader {
  width: 100%;
  margin-bottom: 10px;
}

.competition-cascade .el-cascader-menu__wrap.el-scrollbar__wrap {
  height: 100%;
}
</style>