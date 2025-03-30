<template>
  <div class="password">
    <div class="header-detail">
      <div>▼ 更换密码</div>
    </div>
    <el-form ref="passwordFormRef" :model="model" :rules="rules" size="large" status-icon
             label-position="top" label-width="100px" class="password-form">
      <el-form-item label="当前密码" prop="password" :error="passwordErrorText">
        <el-input v-model.trim="model.password" type="password" show-password clearable placeholder="请输入当前正在使用的密码"
                  :keyup.native="model.password=model.password.replace(/\s+/g, '')"/>
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword" :error="newPasswordErrorText">
        <el-input v-model.trim="model.newPassword" type="password" show-password clearable
                  placeholder="请输入包含数字和字母的新密码"
                  :keyup.native="model.newPassword=model.newPassword.replace(/\s+/g, '')"/>
      </el-form-item>
      <el-form-item label="重复新密码" prop="confirmNewPassword" :error="confirmNewPasswordErrorText">
        <el-input v-model.trim="model.confirmNewPassword" type="password" show-password clearable placeholder="请再次输入新密码"
                  :keyup.native="model.confirmNewPassword=model.confirmNewPassword.replace(/\s+/g, '')"/>
      </el-form-item>
      <el-button size="large" class="password-button" @click="passwordSubmit(passwordFormRef)" :loading="passwordLoading">保存</el-button>
    </el-form>
  </div>

  <div class="username">
    <div class="header-detail">
      <div>▼ 更换用户名</div>
    </div>
    <el-form ref="usernameFormRef" :model="model" :rules="rules" size="large"  status-icon
             label-position="top" label-width="100px" class="username-form">
      <el-form-item label="用户名" prop="username">
        <el-input placeholder="请输入用户名" v-model.trim="model.username" maxlength="12" show-word-limit clearable
                  :keyup.native="model.username=model.username.replace(/\s+/g, '')"/>
      </el-form-item>
      <el-button size="large" class="username-button">保存</el-button>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue';
import {ElMessage, FormInstance, FormRules} from "element-plus";
import useUserStore from '../../../stores/userStore';
import _ from 'lodash';
import {updatePasswordAPI} from '../../../api/userAPI';

const userStore = useUserStore();

const usernameFormRef = ref<FormInstance>();
const passwordFormRef = ref<FormInstance>();

const model = reactive({
  username: '',
  email: '',
  password: '',
  newPassword: '',
  confirmNewPassword: '',
})

const validatePassword = (rule: any, value: any, callback: any) => {
  if (value.length >= 8) {
    let reg = /^(?=.*\d)(?=.*[A-Za-z]).{8,20}$/;
    if (!reg.test(value)) {
      callback(new Error('密码格式有误'));
      return;
    }
    if (model.newPassword && model.confirmNewPassword) {
      passwordFormRef.value.validateField('newPasswordAgain');
    }
    if (rule.field === 'password') {
      passwordErrorText.value = '';
    }
    if (rule.field === 'newPassword') {
      newPasswordErrorText.value = '';
    }
    callback();
  } else {
    callback(new Error('请继续输入'));
  }
}

const validateConfirmNewPassword = (rule: any, value: any, callback: any) => {
  if (value.length >= 8) {
    if (value !== model.newPassword) {
      callback(new Error('两次输入的密码不匹配'));
      return;
    }
    confirmNewPasswordErrorText.value = '';
    callback();
  } else {
    callback(new Error('请继续输入'));
  }
}

const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入新用户名', trigger: 'change' },
  ],
  password: [
    { required: true, message: '请输入当前密码', trigger: 'change' },
    { validator: validatePassword, trigger: 'change' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'change' },
    { validator: validatePassword, trigger: 'change' }
  ],
  newPasswordAgain: [
    { required: true, message: '请再次输入新密码', trigger: 'change' },
    { validator: validateConfirmNewPassword, trigger: 'change' }
  ]
})

const passwordLoading = ref(false);
const passwordErrorText = ref('');
const newPasswordErrorText = ref('');
const confirmNewPasswordErrorText = ref('');
const passwordSubmit = _.throttle((formRef: FormInstance | undefined) => {
  if (!formRef) return;
  passwordLoading.value = true;
  setTimeout(() => {
    formRef.validate((isValid) => {
      if (isValid) {
        updatePasswordAPI(model.password, model.newPassword, model.confirmNewPassword).then(response => {
          passwordFormRef.value.resetFields();
          ElMessage({
            message: response.message,
            type: 'success',
          })
          console.log(response)
        }).catch(error => {
          switch (error.message) {
            case '当前密码错误': passwordErrorText.value = '当前密码错误'; break;
            case '当前密码不能为空': passwordErrorText.value = '当前密码不能为空'; break;
            case '当前密码至少8位字符': passwordErrorText.value = '当前密码至少8位字符'; break;
            case '当前密码需包含大小写字母、数字和特殊符号': passwordErrorText.value = '当前密码需包含大小写字母、数字和特殊符号'; break;
            case '新密码不能为空': newPasswordErrorText.value = '新密码不能为空'; break;
            case '新密码至少8位字符': newPasswordErrorText.value = '新密码至少8位字符'; break;
            case '新密码需包含大小写字母、数字和特殊符号': newPasswordErrorText.value = '新密码需包含大小写字母、数字和特殊符号'; break;
            case '请再次输入新密码': confirmNewPasswordErrorText.value = '请再次输入新密码'; break;
            case '两次输入的密码不匹配': confirmNewPasswordErrorText.value = '两次输入的密码不匹配'; break;
            default : {
              ElMessage({
                message: error.message,
                type: 'error',
              })
            }
          }
          console.log(error)
        }).finally(() => {
          passwordLoading.value = false;
        })
      } else {
        passwordLoading.value = false;
      }
    })
  }, 500)
}, 1000)

onMounted(() => {
  model.username = userStore.username || '';
})
</script>

<style scoped>
.header-detail {
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--el-text-color-regular);
  font-size: 15px;
  border-bottom: 1px solid #eaeaea;
}
html.dark .header-detail {
  border-bottom-color: #414243;
}

.username-form, .email-form, .password-form {
  padding-top: 15px;
  margin-left: 15px;
}

.email, .username {
  margin-top: 20px;
}
</style>

<style>
.username-form .el-input__wrapper,
.email-form .el-input__wrapper,
.password-form .el-input__wrapper {
  transition: unset;
}
</style>