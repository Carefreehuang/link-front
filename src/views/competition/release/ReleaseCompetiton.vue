<template>
  <div class="competition-form">

    <!-- 竞赛名称 -->
    <el-row :gutter="20">
      <el-col :span="24">
        <el-input v-model="competitionName" placeholder="请输入竞赛名称" clearable size="large" />
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-10">
      <el-col :span="24">
        <el-input v-model="officialWebsite" placeholder="请输入赛事网站" clearable size="large" />
      </el-col>
    </el-row>

    <!-- 报名时间 & 比赛时间 -->
    <el-row :gutter="20" class="mt-10">
      <el-col :span="12">
        <el-date-picker v-model="registrationTime" type="datetimerange" range-separator="至"
                        start-placeholder="报名开始时间" end-placeholder="报名截止时间" style="width: 95%;" />
      </el-col>
      <el-col :span="12">
        <el-date-picker v-model="competitionTime" type="datetimerange" range-separator="至"
                        start-placeholder="比赛开始时间" end-placeholder="比赛结束时间" style="width: 95%;" />
      </el-col>
    </el-row>

    <!-- 分类 & 标签 -->
    <el-row :gutter="20" class="mt-10">
      <el-col :span="12">
        <el-select v-model="competitionCategory" placeholder="请选择竞赛分类" class="full-width">
          <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-col>
      <el-col :span="12">
        <el-cascader ref="dialogTagCascadeRef" v-model="selectedTags" :options="cascadeOptions"
                     :show-all-levels="false" placeholder="请选择相关标签" size="medium"
                     :props="tagCascadeProp" collapse-tags collapse-tags-tooltip popper-class="tag-cascade"
                     tag-type="success" @change="handleTagSelect" class="full-width">
          <template #default="{ node, data }">
            <span v-text="data.label" />
            <span v-if="!node.isLeaf" v-text="' (' + data.children.length + ')'" />
          </template>
        </el-cascader>
      </el-col>
    </el-row>

    <!-- 赛事海报上传（按钮上传） -->
    <el-row :gutter="20" class="mt-10">
      <el-col :span="24">
        <el-upload
          ref="uploader"
          class="uploader"
          :action="uploaderAction"
          :auto-upload="false"
          :show-file-list="true"
          :limit="1"
          :on-change="onUploaderChange"
          accept="image/jpeg, image/png"
          :before-upload="beforeUpload"
          :on-remove="removeUpload"
          :http-request="httpRequest"
        >
          <el-button type="primary" >
            <el-icon><Upload /></el-icon>
            上传赛事海报
          </el-button>
        </el-upload>
      </el-col>
    </el-row>
    <CompetitionImgCropper
      v-if="showCropperDialog"
      :dialog-title="'上传赛事海报'"
      :dialog-visible="showCropperDialog"
      :cropper-image="cropperCompetitionImg"
      img-type="blob"
      @upload-cropped-competitionImg="uploadCroppedCompetitionImg"
      @close-competitionImg-cropper-dialog="closeCompetitionImgCropperDialog"
    />

    <!-- 竞赛描述（Vditor 编辑器） -->
    <el-row class="mt-10">
      <el-col :span="24">
        <Editor ref="writeEditor" height="60vh" :cache-id="'newCompetition'"
                :clear-content="clearEditorContent" @clear-content-done="clearEditorContentDone" editorPlaceholder="请输入赛事详细内容" />
      </el-col>
    </el-row>

    <!-- 发布按钮 -->
    <el-row class="mt-20">
      <el-col :span="24" class="center-content">
        <el-button color="#626aef" plain @click="postCompetition" :disabled="disabledPost" :loading="postLoading">
          发布竞赛
        </el-button>
      </el-col>
    </el-row>

    <!-- 发布结果弹窗 -->
    <el-dialog v-model="showPostResultDialog" :title="postResultDialogTitle" width="400px" center destroy-on-close>
      <span v-text="postResultDialogText"></span>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import Editor from "../../../components/editor/Editor.vue";
import { onBeforeMount, ref, reactive, nextTick } from "vue";
import { ElMessage, UploadInstance } from "element-plus";
import { useRouter } from "vue-router";
import { getTagsAndOptionsAPI } from "../../../api/admin/tagAPI";
import { cascadeTags, classifyTagOptions } from "../../../utils/tags";
import { releaseCompetitionAPI } from "../../../api/competitionAPI";
import dayjs from 'dayjs';
import CompetitionImgCropper from "../../../components/cropper/CompetitionImgCropper.vue";
import { uploadAPI } from "../../../api/uploadAPI";

const router = useRouter();

const writeEditor = ref(null);

// 竞赛海报裁剪器
const uploader = ref<UploadInstance>();
const showCropperDialog = ref(false);
const cropperCompetitionImg = ref();
const croppedCompetitionImg = ref();
const uploaderAction = ref('/upload');
function uploadCroppedCompetitionImg(data) {
  croppedCompetitionImg.value = data;
  uploader.value!.submit(); // 提交上传
  //uploader.value!.clearFiles(); // 清空裁剪器中的文件
}

function closeCompetitionImgCropperDialog() {
  showCropperDialog.value = false;
}

function onUploaderChange(file, fileList) {
  let { raw } = file;
  openCropperDialog(raw)
}

function openCropperDialog(rawCompetitionImg) {
  showCropperDialog.value = true;
  let competitionImg = rawCompetitionImg;
  let reader = new FileReader();
  reader.onload = e => {
    let data;
    if (typeof e.target.result === "object") {
      data = window.URL.createObjectURL(new Blob([e.target.result]));
    } else {
      data = e.target.result;
    }
    cropperCompetitionImg.value = data;
  }
  reader.readAsArrayBuffer(competitionImg);
}

/* 手动submit()裁剪后的图片前会执行此函数 */
function httpRequest(request) {
  const { action, file, filename } = request; // filename: file
  let formData = new FormData();
  let originalFileName = file.name.substring(0, file.name.lastIndexOf('.'));
  formData.append(filename, croppedCompetitionImg.value, originalFileName);
  uploadPost(action, formData).then(response => {
    showCropperDialog.value = false;
  })
}
// 竞赛数据
const competitionName = ref('');
const officialWebsite = ref('');
const competitionCategory = ref('');
const selectedTags = ref([]);
const registrationTime = ref([]);
const competitionTime = ref([]);
const competitionImg = ref('');

// 竞赛分类选项
const categoryOptions = ref([
  { label: "数学建模", value: 1 },
  { label: "编程竞赛", value: 2 },
  { label: "人工智能", value: 3 },
  { label: "设计竞赛", value: 4 },
  { label: "其他", value: 5 },
]);

// 竞赛标签
const cascadeOptions = ref([]);
const tagCascadeProp = reactive({
  multiple: true,
  emitPath: false,
});

// 获取标签数据
onBeforeMount(() => {
  getTagsAndOptionsAPI().then(response => {
    let tagOptions = classifyTagOptions(response.data.tagOptions);
    let tags = response.data.tags;
    cascadeOptions.value = cascadeTags(tags, tagOptions);
  }).catch(error => {
    console.log(error);
  });
});

// 限制最多选择 3 个标签
const oldSelectedTags = ref();
function handleTagSelect(value) {
  if (value.length <= 3) {
    oldSelectedTags.value = value;
  } else {
    ElMessage({ message: '最多只能选择 3 个标签', type: 'warning' });
    nextTick(() => {
      selectedTags.value = oldSelectedTags.value;
    });
  }
}

// 发布竞赛
const postLoading = ref(false);
const showPostResultDialog = ref(false);
const postResultDialogTitle = ref('');
const postResultDialogText = ref('');
const disabledPost = ref(false);

const beforeUpload = (file) => {
  if (file.size / 1024 / 1024 > 2) {
    ElMessage.error('只能上传2MB以内的图片')
    return false;
  }
  return true;
};

const removeUpload = () => {
  competitionImg.value = '';
}

const uploadPost = async (action, formData) => {
  try {
    const response = await uploadAPI(action, formData); // 调用上传 API
    if (response.code === 200) {
      competitionImg.value = response.data; // 获取图片 URL
      ElMessage.success("图片上传成功！");
    } else {
      ElMessage.error(response.message || "上传失败");
    }
  } catch (error) {
    console.error("上传出错:", error);
    ElMessage.error("上传失败");
  }
};

const postCompetition = () => {
  const { editor } = writeEditor.value;
  if (!competitionName.value.trim()) {
    ElMessage({ message: '请输入竞赛名称', type: 'warning' });
  } else if (!editor.getValue().trim()) {
    ElMessage({ message: '请输入竞赛描述', type: 'warning' });
  } else if (!competitionCategory.value) {
    ElMessage({ message: '请选择竞赛分类', type: 'warning' });
  } else if (!selectedTags.value.length) {
    ElMessage({ message: '请选择至少一个标签', type: 'warning' });
  } else if (!registrationTime.value.length) {
    ElMessage({ message: '请选择报名时间', type: 'warning' });
  } else if (!competitionTime.value.length) {
    ElMessage({ message: '请选择比赛时间', type: 'warning' });
  } else if (!competitionImg.value.length) {
    ElMessage({ message: '请上传赛事海报', type: 'warning' });
  } else {
    postLoading.value = true;
    setTimeout(() => {
      // 模拟 API 请求
      releaseCompetitionAPI(
        competitionName.value,
        editor.getValue(),
        competitionCategory.value,
        selectedTags.value,
        officialWebsite.value,
        dayjs(registrationTime.value[0]).format("YYYY-MM-DD HH:mm:ss"),
        dayjs(registrationTime.value[1]).format("YYYY-MM-DD HH:mm:ss"),
        dayjs(competitionTime.value[0]).format("YYYY-MM-DD HH:mm:ss"),
        dayjs(competitionTime.value[1]).format("YYYY-MM-DD HH:mm:ss"),
        competitionImg.value
      ).then(res => {
        postLoading.value = false;
        showPostResultDialog.value = true;
        postResultDialogTitle.value = '发布成功';
        postResultDialogText.value = '3 秒后将自动跳转到竞赛详情页...';
        let time = 3;
        let timer = setInterval(() => {
          time--;
          postResultDialogText.value = `${time} 秒后将自动跳转到竞赛详情页...`;
          if (time === 0) {
            clearInterval(timer);
            router.push({ path: '/competition/' + Math.random().toString(36).substr(2, 9) });
            showPostResultDialog.value = false;
            competitionName.value = '';
            competitionCategory.value = '';
            selectedTags.value = [];
            registrationTime.value = [];
            competitionTime.value = [];
          }
        }, 1000);
      }).catch(err => {
        showPostResultDialog.value = true;
        // 这里假设 showPostResultClose 是一个 ref 变量，需要确保它已经定义
        // showPostResultClose.value = true; 
        postResultDialogTitle.value = '发布失败';
        postResultDialogText.value = '请重试，如仍不能发布，请及时反馈管理员。';
        console.log(err); // 修改为 err
      });
    }, 500);
  }
};

// 清空编辑器内容
const clearEditorContent = ref(false);
function clearEditorContentDone() {
  clearEditorContent.value = false;
}
</script>

<style scoped>
.competition-form {
  width: 80%;
  margin: auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 控制统一宽度 */
.full-width {
  width: 100%;
}

/* 控制间距 */
.mt-10 {
  margin-top: 10px;
}

.mt-20 {
  margin-top: 20px;
}

/* 按钮居中 */
.center-content {
  display: flex;
  justify-content: center;
}
</style>    