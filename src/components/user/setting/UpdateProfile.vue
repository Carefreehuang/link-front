<template>
  <div class="avatar">
    <div class="avatar-header">
      <div>▼ 更换头像</div>
    </div>
    <!-- 图片裁剪对话框 -->
    <AvatarCropper
      v-if="showCropperDialog"
      :dialog-title="'上传头像'"
      :dialog-visible="showCropperDialog"
      :cropper-image="cropperAvatar"
      img-type="blob"
      @upload-cropped-avatar="uploadCroppedAvatar"
      @close-avatar-cropper-dialog="closeAvatarCropperDialog"
    />
    <el-form ref="nicknameFormRef" :model="nicknameModel" :rules='nicknameRules'
             label-position="top" label-width="100px" size="large" class="nickname-form">
      <el-form-item label="当前头像">
        <div class="current-avatar hidden-sm-and-up">
          <el-avatar :src="userStore.avatar" :size="30" shape="square"/>
        </div>
        <div class="current-avatar hidden-xs-only">
          <el-avatar :src="userStore.avatar" :size="190" shape="square"/>
        </div>
      </el-form-item>
      <el-form-item label="更换头像">
        <el-upload
          ref="uploader"
          class="uploader"
          :action="uploaderAction"
          :auto-upload="false"
          :show-file-list="false"
          accept="image/jpeg, image/png"
          :before-upload="beforeUploadAvatar"
          :on-change="onUploaderChange"
          :http-request="httpRequest"
        >
          <el-button class="upload-button">点击上传</el-button>
        </el-upload>
      </el-form-item>
    </el-form>
  </div>
  <div class="school-major">
    <div class="school-major-header">
      <div>
        <span v-text="socialFormText" :style="showSocialForm ? 'padding-right: 0.5px;' : null"/><span>▼ 专业学校</span>
      </div>
    </div>
    <el-form ref="schoolMajorFormRef" :model="user" :rules="schoolMajorRules"
             label-position="top" label-width="100px" size="large" class="school-major-form">
      <el-form-item label="学校" prop="school">
        <el-cascader
          v-model="selectedOptions"
          :options="cascaderOptions"
          :props="cascaderProps"
          @change="handleChange"
          style="width: 428px"
          placeholder="请选择学校"
        >
        </el-cascader>
      </el-form-item>
      <el-form-item label="专业" prop="major">
        <el-input v-model="user.major" placeholder="请输入专业" style="width: 428px" >
        </el-input>
      </el-form-item>
    </el-form>
    <el-button size="large" class="social-button" @click="saveSchoolMajor">保存</el-button>
  </div>
  <div class="social">
    <div class="social-header">
      <div>
        <span v-text="socialFormText" :style="showSocialForm ? 'padding-right: 0.5px;' : null"/><span>▼ 联系方式</span>
      </div>
    </div>
    <el-form ref="socialFormRef" :model="contactInfo" :rules="contactRules"
             label-position="top" label-width="100px" size="large" class="social-form">
      <el-form-item label="Wechat" prop="wechat">
        <el-input v-model="contactInfo.wechat" placeholder="请输入微信号">
          <template #prepend><i class="czs-weixin"/></template>
        </el-input>
      </el-form-item>
      <el-form-item label="QQ" prop="qq">
        <el-input v-model="contactInfo.qq" placeholder="请输入QQ账号">
          <template #prepend><i class="czs-qq"/></template>
        </el-input>
      </el-form-item>
      <el-form-item label="Phone" prop="phone">
        <el-input v-model="contactInfo.phone" placeholder="请输入手机号">
          <template #prefix>
          </template>
          <template #prepend><i class="czs-phone"/></template>
        </el-input>
      </el-form-item>
    </el-form>
    <el-button size="large" class="social-button" @click="saveContactInfo">保存</el-button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, UploadInstance, FormInstance, FormRules } from "element-plus";
import { updateSchoolAndMajor, updateContactInfoAPI } from '../../../api/userAPI';
import useUserStore from '../../../stores/userStore'
import _ from 'lodash';
import AvatarCropper from '../../../components/cropper/AvatarCropper.vue';
import { uploadAvatarAPI } from '../../../api/uploadAPI';
import axios from 'axios';


const userStore = useUserStore();

// 头像相关
const uploader = ref<UploadInstance>();
const uploaderAction = ref('/updateAvatar');
const showCropperDialog = ref(false);
const cropperAvatar = ref();
const croppedAvatar = ref();
function uploadCroppedAvatar(data) {
  croppedAvatar.value = data;
  uploader.value!.submit();
  uploader.value!.clearFiles(); /*手动上传情形中，submit()完成后，要 clearFiles()，不然会多次请求(与上次的文件一起提交)。*/
}

function closeAvatarCropperDialog() {
  showCropperDialog.value = false;
}

/*在手动或自动上传图片前，会触发此钩子函数*/
function beforeUploadAvatar(rawAvatar) {
  if (rawAvatar.size / 1024 / 1024 > 2) {
    ElMessage.error('只能上传2MB以内的图片')
    return false;
  }
  return true;
}

function onUploaderChange(file, fileList) {
  let { raw } = file;
  openCropperDialog(raw)
}

function openCropperDialog(rawAvatar) {
  showCropperDialog.value = true;
  let avatar = rawAvatar;
  let reader = new FileReader();
  reader.onload = e => {
    let data;
    if (typeof e.target.result === "object") {
      data = window.URL.createObjectURL(new Blob([e.target.result]));
    } else {
      data = e.target.result;
    }
    cropperAvatar.value = data;
  }
  reader.readAsArrayBuffer(avatar);
}

/* 手动submit()裁剪后的图片前会执行此函数 */
function httpRequest(request) {
  const { action, file, filename } = request; // filename: file
  let formData = new FormData();
  let originalFileName = file.name.substring(0, file.name.lastIndexOf('.'));
  formData.append(filename, croppedAvatar.value, originalFileName);

  uploadAvatarAPI(action, formData).then(response => {
    userStore.avatar = response.data.newAvatar;
    showCropperDialog.value = false;
    ElMessage.success(response.message);
  }).catch(error => {
    console.log(error)
  })
}

// 学校专业

// 选中的选项
const selectedOptions = ref([]);

// 级联选择器的选项
const cascaderOptions = ref([]);

// 级联选择器的配置项
const cascaderProps = ref({
  value: 'value',
  label: 'label',
  children: 'children',
  checkStrictly: true, // 可以单独选中每一项
  changeOnSelect: true // 每选择一项都会触发 change 事件
});

// 获取省份列表
const getProvinces = async () => {
  try {
    const response = await axios.get('https://api.hcfpz.cn/un/provinces');
    if (response.data.errno === '0') {
      const provinces = response.data.data;
      cascaderOptions.value = provinces.map(province => ({
        value: province,
        label: province,
        children: []
      }));
    }
  } catch (error) {
    console.error('获取省份列表失败:', error);
  }
};

// 获取城市列表
const getCities = async (province) => {
  try {
    const response = await axios.get(`https://api.hcfpz.cn/un/citys?province=${province}`);
    if (response.data.errno === '0') {
      const cities = response.data.data;
      const provinceIndex = cascaderOptions.value.findIndex(item => item.value === province);
      if (provinceIndex !== -1) {
        cascaderOptions.value[provinceIndex].children = cities.map(city => ({
          value: city,
          label: city,
          children: []
        }));
      }
    }
  } catch (error) {
    console.error('获取城市列表失败:', error);
  }
};

// 获取学校列表
const getSchools = async (province, city) => {
  try {
    const response = await axios.get(`https://api.hcfpz.cn/un/schools?province=${province}&city=${city}`);
    if (response.data.errno === '0') {
      const schools = response.data.data;
      const provinceIndex = cascaderOptions.value.findIndex(item => item.value === province);
      if (provinceIndex !== -1) {
        const cityIndex = cascaderOptions.value[provinceIndex].children.findIndex(item => item.value === city);
        if (cityIndex !== -1) {
          cascaderOptions.value[provinceIndex].children[cityIndex].children = schools.map(school => ({
            value: school.name,
            label: school.name
          }));
        }
      }
    }
  } catch (error) {
    console.error('获取学校列表失败:', error);
  }
};

// 处理级联选择器的变化事件
const handleChange = (value) => {
  selectedOptions.value = value
  if (value.length === 1) {
    const province = value[0];
    getCities(province);
  } else if (value.length === 2) {
    const [province, city] = value;
    getSchools(province, city);
  } else if (value.length === 3) {
    const [, , school] = value;
    user.school = school;
    // 三层都选完后，手动触发关闭弹窗
    const cascader = document.querySelector('.el-cascader__dropdown');
    if (cascader) {
      cascader.style.display = 'none';
    }
  }
};

const schoolMajorFormRef = ref<FormInstance>();
const user = reactive({
  school: '',
  major: '',
})

const schoolMajorRules = reactive<FormRules>({
  school: [
    { required: true, message: '请选择学校', trigger: 'change' }
  ],
  major: [
    { required: true, message: '请输入专业', trigger: 'blur' }
  ]
});

const saveSchoolMajor = () => {
  schoolMajorFormRef.value?.validate((valid) => {
    if (valid) {
      updateSchoolAndMajor(user.school, user.major).then(response => {
        ElMessage.success('学校和专业信息更新成功');
      }).catch(error => {
        ElMessage.error('学校和专业信息更新失败');
      });
    } else {
      ElMessage.error('请完善学校和专业信息');
    }
  });
};

const showSocialForm = ref(false);
const socialFormText = ref(' ');

const contactInfo = reactive({
  wechat: '',
  qq: '',
  phone: ''
});

const contactRules = reactive<FormRules>({
  wechat: [
    { required: false, message: '请输入微信账号', trigger: 'blur' }
  ],
  qq: [
    { required: false, message: '请输入QQ账号', trigger: 'blur' },
    { pattern: /^\d+$/, message: 'QQ 账号必须为数字', trigger: 'blur' }
  ],
  phone: [
    { required: false, message: '请输入电话号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
});

const socialFormRef = ref<FormInstance>();

const saveContactInfo = () => {
  socialFormRef.value?.validate((valid) => {
    if (valid) {
      updateContactInfoAPI(contactInfo.wechat, contactInfo.qq, contactInfo.phone).then(response => {
        ElMessage.success('联系方式信息更新成功');
      }).catch(error => {
        ElMessage.error('联系方式信息更新失败');
      });
    } else {
      ElMessage.error('请完善联系方式信息');
    }
  });
};

// 组件挂载时获取省份列表并绑定 userStore 数据
onMounted(async () => {
  await getProvinces();

  // 假设 userStore 中有 school、major、wechat、qq、phone 这些属性
  user.school = userStore.school || '';
  user.major = userStore.major || '';
  contactInfo.wechat = userStore.wechat || '';
  contactInfo.qq = userStore.qq || '';
  contactInfo.phone = userStore.phone || '';
});

</script>

<style scoped>
.avatar-header, .social-header, .school-major-header {
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--el-text-color-regular);
  font-size: 15px;
  border-bottom: 1px solid #eaeaea;
}

html.dark .avatar-header, html.dark .social-header {
  border-bottom-color: #414243;
}

.update-avatar-form {
  padding-top: 10px;
}

.social-header {
  margin-top: 20px;
}

.avatar-form, .social-form, .school-major-form {
  padding-top: 15px;
}

.avatar-form, .social-form, .school-major-form, .avatar-button, .social-button, .school-major-button {
  margin-left: 15px;
}
</style>

<style>
.avatar-form .el-input__wrapper,
.social-form .el-input__wrapper,
.school-major-form .el-input__wrapper
{
  transition: unset;
}

.social-form .el-input__prefix-inner > :last-child {
  margin-right: 0;
}

.avatar-form .el-input > div,
.social-form .el-input > div {
  box-shadow: unset;
  border: 1px solid #eaeaea;
}

html.dark .avatar-form .el-input > div,
html.dark .social-form .el-input > div {
  border-color: #414243;
}

.social-form .el-input-group__prepend {
  font-size: 18px;
}
</style>