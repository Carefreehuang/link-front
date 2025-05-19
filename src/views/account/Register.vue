<template>
  <div class="register">
    <!--  注册表单  -->
    <div class="register-module">
      <div class="necessary">
        <el-form
            ref="ruleFormRef"
            class="form-body"
            label-position="top"
            :model="user"
            :rules="userRules"
            size="large"
            status-icon
        >
          <div class="register-alert-body">
            <el-divider class="logo">
              <el-image style="height: 32px" src="src\assets\img\logo2.png" fit="fill"/>
            </el-divider>
            <div class="register-alert">注册新账户</div>
          </div>
          <el-form-item label="用户名" prop="username" :error="usernameErrorText">
            <el-input
                type="text"
                autocomplete="off"
                v-model.trim="user.username"
                :keyup.native="user.username=user.username.replace(/\s+/g, '')"
            />
          </el-form-item>
          <el-form-item label="学校" prop="school">
            <el-cascader
              v-model="selectedOptions"
              :options="cascaderOptions"
              :props="cascaderProps"
              @change="handleChange"
              style="width: 428px"
            >
            </el-cascader>
          </el-form-item>
          <el-form-item label="专业" prop="major">
            <el-input
                type="text"
                autocomplete="off"
                v-model.trim="user.major"
                :keyup.native="user.major=user.major.replace(/\s+/g, '')"
            />
          </el-form-item>
          <el-form-item label="邮箱" prop="email" :error="emailErrorText">
            <el-input
                type="email"
                autocomplete="off"
                v-model.trim="user.email"
                :keyup.native="user.email=user.email.replace(/\s+/g, '')"
                placeholder="请输入教育邮箱(以edu.cn结尾)"
            />
          </el-form-item>
          <el-form-item label="密码" prop="password" :error="passwordErrorText">
            <el-input
                type="password"
                show-password
                autocomplete="off"
                v-model.trim="user.password"
                :keyup.native="user.password=user.password.replace(/\s+/g, '')"
            />
          </el-form-item>
          <el-form-item label="重复密码" prop="confirmPassword">
            <el-input
                type="password"
                show-password
                autocomplete="off"
                v-model.trim="user.confirmPassword"
                :keyup.native="user.confirmPassword=user.confirmPassword.replace(/\s+/g, '')"
            />
          </el-form-item>
          <el-form-item label="验证码" prop="captcha" class="no-wrap" :error="captchaErrorText">
            <el-input
                type="text"
                autocomplete="off"
                v-model.trim="user.captcha"
                :keyup.native="user.captcha=user.captcha.replace(/\s+/g, '')"
            />
            <el-image class="captcha-image"
                      :src="captchaImage"
                      @click="getCaptcha()"
                      v-if="!loadCaptchaError"
            />
            <div class="captcha-image" v-if="loadCaptchaError">
              <span class="load-captcha-error" v-text="loadCaptchaErrorMsg"/>
            </div>
          </el-form-item>
          <el-form-item style="display: table; margin: 0 auto; padding-top: 10px;">
            <el-button type="primary" :loading="registerLoading" @click="submitRegister(ruleFormRef, user)" class="buttonModule">注册
            </el-button>
            <el-button @click="resetForm(ruleFormRef)" class="buttonModule">重置</el-button>
            <el-button @click="router.back()" class="buttonModule">返回</el-button>
            <el-button @click="router.push('/')" class="buttonModule">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <el-dialog v-model="showRegisterSuccessDialog" class="register-status-dialog" :title="registerSuccessDialogTitle" center width="395px"
               destroy-on-close :show-close="false" :lock-scroll="false">
      <span v-text="registerSuccessDialogText"></span>
    </el-dialog>
  </div>
</template>


<script setup lang="ts">
import {onBeforeUnmount, onMounted, reactive, ref, watch} from 'vue'
import type {FormInstance, FormRules} from 'element-plus'
import {useRoute, useRouter} from "vue-router";
import _ from 'lodash'
import dayjs from 'dayjs'
import {ElMessage} from 'element-plus'
import {
  getCaptchaImage,
  checkCaptcha,
  checkUsernameUnique,
  register,
} from '../../api/loginApi'
import axios from 'axios';

const logo = import.meta.env.VITE_LOGO_ADDRESS;

//使用路由器、路由
const router = useRouter()
const route = useRoute()

//注册状态，{ 0:未提交注册, 1:注册成功, 2: 注册失败}
const registerStatus = ref(0)

//注册失败打印的信息
const errorRegisterMsg = ref('')

//注册时显示加载中
const registerLoading = ref(false)


//表单引用，指向整个表单
const ruleFormRef = ref<FormInstance>()

const user = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  captcha: '',
  captchaOwner: '',
  school: '',
  major: '',
})



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
/**
 * 校验表单中的用户名
 * @param rule 指向校验规则的对象
 * @param value 需要校验的值
 * @param callback 校验结束的回调函数
 */
const ValidateUsername = (rule: any, value: any, callback: any) => {
  if (value.length < 4) {
    callback(new Error('用户名长度需大于4'));
  } else if (value.length > 12) {
    callback(new Error('用户名超出长度'));
  } else {
    // 允许英文、下划线、中文等
    const reg = /^[\u4E00-\u9FA5A-Za-z0-9_]+$/;
    setTimeout(() => {
      if (!reg.test(value)) {
        callback(new Error('非法字符'));
        return;
      }
      checkUsernameUnique(value).then(response => {
        callback();
      }).catch(error => {
        callback(new Error(error.message))
      })
    }, 600)
  }
}

/**
 * 校验表单中的密码
 * @param rule 指向校验规则的对象
 * @param value 需要校验的值
 * @param callback 校验结束的回调函数
 */
const ValidatePassword = (rule: any, value: any, callback: any) => {
  if (value.length >= 8) {
    // 必须包含数字和字母，长度在8-20之间
    const reg = /^(?=.*\d)(?=.*[A-Za-z]).{8,20}$/;
    setTimeout(() => {
      if (!reg.test(value)) {
        callback(new Error('密码需包含数字和字母'));
        return;
      } else {
        // 修改 password 后，通知 rePassword 再次校验两次输入的密码是否一致
        ruleFormRef.value.validateField('confirmPassword', () => null)
        callback(); //校验通过的调用方式
      }
    }, 300)
  } else {
    callback(new Error('请继续输入'))
  }
}

/**
 * 校验表单中的邮箱
 * @param rule 指向校验规则的对象
 * @param value 需要校验的值
 * @param callback 校验结束的回调函数
 */
const ValidateEmail = (rule: any, value: any, callback: any) => {
  // 必须是教育邮箱
  const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(edu|edu\.cn|ac\.cn)$/;
  setTimeout(() => {
    if (!reg.test(value)) {
      callback(new Error('请输入正确的邮箱地址'));
      return;
    } else callback();
  }, 300)
}

/**
 * 校验两次输入的密码是否一致
 * @param rule
 * @param value
 * @param callback
 * @constructor
 */
const ValidatePasswordAgain = (rule: any, value: any, callback: any) => {
  if (value.length >= 8) {
    if (value !== user.password) {
      callback(new Error("两次输入的密码不匹配"));
      return;
    }
    callback(); //校验通过的调用方式
  } else {
    callback(new Error('请继续输入'))
  }
}

/**
 * 验证表单中输入的图片验证码是否正确
 * @param rule
 * @param value
 * @param callback
 * @constructor
 */
const ValidateCaptcha = (rule: any, value: any, callback: any) => {
  if (value.length === 4) {
    checkCaptcha(value, user.captchaOwner).then(response => {
      callback();
    }).catch(error => {
      callback(new Error(error.message))
    })
  } else callback(new Error("请输入正确的图形验证码"))
}

const userRules = reactive<FormRules>({
  username: [
    {
      required: true,
      message: '请输入用户名',
      trigger: 'change'
    },
    {
      validator: ValidateUsername,
      trigger: 'change'
    }
  ],
  email: [
    {
      required: true,
      message: '请输入邮箱',
      trigger: 'change'
    },
    {
      validator: ValidateEmail,
      trigger: 'change'
    }
  ],
  school: [
    {
      required: true,
      message: '请选择大学',
      trigger: 'change'
    },
  ],
  major: [
    {
      required: true,
      message: '请输入专业',
      trigger: 'change'
    },
  ],
  password: [
    {
      required: true,
      message: '请输入密码',
      trigger: 'change'
    },
    {
      validator: ValidatePassword,
      trigger: 'change'
    }
  ],
  confirmPassword: [
    {
      required: true,
      message: '请再次输入密码',
      trigger: 'change'
    },
    {
      validator: ValidatePasswordAgain,
      trigger: 'change'
    }
  ],
  captcha: [
    {
      required: true,
      message: "请输入图形验证码",
      trigger: 'change'
    },
    {
      validator: ValidateCaptcha,
      trigger: 'change'
    }
  ],
})

const showRegisterSuccessDialog = ref(false);
const registerSuccessDialogTitle = ref('');
const registerSuccessDialogText = ref('');

const usernameErrorText = ref('');
const emailErrorText = ref('');
const passwordErrorText = ref('');
const captchaErrorText = ref('');
/**
 * 处理注册按钮点击后的事件
 * @param ruleFormReference
 * @param user
 */
const submitRegister = (ruleFormReference, user) => {
  if (!ruleFormReference) return;
  registerLoading.value = true;
  ruleFormReference.validate((valid, fields) => {
    if (valid) {
      register(user).then(response => {
        showRegisterSuccessDialog.value = true;
        registerSuccessDialogTitle.value = '注册成功';
        let time = 2;
        registerSuccessDialogText.value = '2 秒后将自动跳转到登录页...';
        let timer = setInterval(() => {
          time--;
          registerSuccessDialogText.value = time + ' 秒后将自动跳转到登录页...';
          if (time === 0) {
            clearInterval(timer);
            showRegisterSuccessDialog.value = false;
            registerSuccessDialogText.value = '';
            setTimeout(() => {
              router.push({name: 'login'});
            }, 300)
          }
        }, 1000)
      }).catch(error => {
        console.log(error)
        if (error.message && error.message.indexOf("注册失败") !== -1) {
          ElMessage({
            message: '注册失败，请稍后重试',
            type: 'error',
          })
          return;
        }
        if (error.message && error.message === '请输入图形验证码') {
          captchaErrorText.value = error.message; return;
        } else if (error.message && error.message === '请输入正确的图形验证码') {
          captchaErrorText.value = error.message; return;
        } else if (error.message && error.message === '图形验证码已过期') {
          captchaErrorText.value = error.message; return;
        } else if (error.message && error.message === '用户名已存在') {
          usernameErrorText.value = error.message; return;
        } else if (error.message && error.message === '邮箱已存在') {
          emailErrorText.value = error.message; return;
        } else if (error.data && error.data.username && error.data.username) {
          usernameErrorText.value = error.data.username; return;
        } else if (error.data && error.data.email && error.data.email) {
          emailErrorText.value = error.data.email; return;
        } else if (error.data && error.data.password && error.data.password) {
          passwordErrorText.value = error.data.password; return;
        } else if (error.data && error.data.captcha && error.data.captcha) {
          captchaErrorText.value = error.data.captcha; return;
        }

      }).finally(() => {
        registerLoading.value = false;
      })
    } else {
      registerLoading.value = false;
      return false;
    }
  })
}

/**
 * 重置表单
 * @param userFrom
 */
const resetForm = (userFrom: FormInstance | undefined) => {
  if (!userFrom) return
  userFrom.resetFields()
}



//图形验证码Base64值
const captchaImage = ref('')
//获取图形验证码是否失败，默认为true
const loadCaptchaError = ref(true);
//图形验证码加载错误信息，初始显示验证码加载中
const loadCaptchaErrorMsg = ref("验证码加载中")

//获取图形验证码，防抖处理，避免频繁点击获取新图形验证码
const getCaptcha = _.debounce(() => {
  getCaptchaImage().then(response => {
    loadCaptchaError.value = false; /* 验证码请求成功后需关闭掉loadCaptchaError */
    ruleFormRef.value.resetFields('captcha'); /* 重置图形验证码输入框的内容 */
    captchaImage.value = response.data.codeImage; /* 从后端获取的验证码图片base64 */
    user.captchaOwner = response.data.codeOwner; /* 从后端获取的随验证码一同生产出来的验证码所属者唯一UUID */
  }).catch(error => {
    loadCaptchaError.value = true; /* 验证码请求失败后需开启loadCaptchaError */
    ruleFormRef.value.resetFields('captcha'); /* 重置图形验证码输入框的内容 */
  })
}, 500)
getCaptcha();
// 组件挂载时获取省份列表
const init = async () => {
  await getProvinces();
};

init();
</script>


<style scoped>
.register {
  margin: 20px 0;
}

.form-body {
  padding: 30px 20px 10px 20px;
  border: 1px solid #d5d7de;
  border-radius: 8px;
  background: white;
  box-shadow: 0 0 3px rgb(0 0 0 / 12%);
}
html.dark .form-body {
  border-color: var(--custom-header-bg-color);
  background-color: var(--custom-header-bg-color);
}

@media only screen and (max-width: 768px) {
  .form-body {
    padding: 25px 20px 0 20px;
  }
}

.register-module {
  max-width: 25rem;
  margin: -20px auto 0;
}

.necessary {
  display: block;
  width: 100%;
  height: 100%;
  margin: 0 auto;
}

.register-alert-body {
  margin-bottom: 30px;
  margin-top: -20px;
}

.register-alert {
  display: block;
  text-align: center;
  padding-top: 10px;
  color: #333;
  font-weight: bolder;
  font-size: 20px;
  letter-spacing: 2px;
}
html.dark .register-alert {
  color: darkgrey;
}

.el-divider--horizontal {
  border-top: unset !important;
  background: linear-gradient(to right, transparent, #888 55%, #999 30%, transparent);
}

.error .el-result__subtitle p {
  color: #f56c6c !important;
}

.captcha-image {
  width: 50%;
  height: 38px;
  border: 1px solid lavender;
  border-radius: 3px;
}
html.dark .captcha-image {
  border-color: #4c4d4f;
}

.load-captcha-error {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #d3691e;
}

.el-tabs--border-card > .el-tabs__content {
  box-shadow: 0 0 3px rgb(18 18 18 / 10%);
  border-radius: 3px;
}

.el-loading-spinner .circular {
  width: 28px !important;
  height: 42px !important;
}

.buttonModule {
  padding: 11px !important;
}

.registerErrorButtonModule {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 20%;
}
</style>


<style>
.no-wrap .el-form-item__content {
  flex-wrap: nowrap !important;
}

.register-module .el-loading-mask {
  background: white;
}

.logo .el-divider__text {
  background-color: white !important;
}
html.dark .logo .el-divider__text {
  background-color: var(--custom-header-bg-color) !important;
}
</style>