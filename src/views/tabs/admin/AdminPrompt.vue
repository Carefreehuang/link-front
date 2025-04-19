<template>
    <div class="sys-tag">
        <div class="sys-tag-header">
            <el-button v-text="'新增prompt'" type="primary" plain @click="showAddPromptDialog = !showAddPromptDialog" />

            <!-- 添加标签对话框 -->
            <el-dialog v-model="showAddPromptDialog" title="新增prompt" class="tag-dialog" align-center
                :lock-scroll="false">
                <el-form ref="tagFormRef" :label-position="'right'" label-width="80px" :model="promptForm">
                    <el-form-item label="名称" prop="name">
                        <el-input v-model="promptForm.name" size="large" />
                    </el-form-item>
                    <el-form-item label="内容" prop="content">
                        <el-input v-model="promptForm.content" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }"
                            size="large" />
                    </el-form-item>
                    <el-form-item label="顺序" prop="sequence">
                        <el-input-number v-model="promptForm.sequence" :min="1" :max="100" />
                    </el-form-item>
                    <el-form-item label="状态" prop="status">
                        <el-switch v-model="promptForm.status" active-color="#13ce66" inactive-color="#ff4949"
                            inline-prompt active-text="启用" inactive-text="禁用" active-value="1" inactive-value="0" />
                    </el-form-item>
                    <el-form-item>
                        <div>
                            <el-button size="default" @click="showAddPromptDialog = false">取消</el-button>
                            <el-button size="default" @click="handleCreatePrompt()"
                                :loading="creatPromptLoading">添加</el-button>
                        </div>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </div>
        <div class="sys-tag-body">
            <table class="tag-table">
                <template v-for="(prompt, index) of prompts" :key="prompt.promptId">
                    <tr v-if="(index % 2) === 0">
                        <td>
                            <el-card shadow="hover" class="tag-card">
                                <div class="tag">
                                    <div>
                                        <span class="tag-no">{{ index + 1 }}</span>
                                        <span class="tag-name" v-text="prompt.name" />
                                        <span class="tag-status" v-text="prompt.status == '1' ? '启用' : '禁用'" />
                                    </div>
                                    <el-button v-text="'查看'" @click="handleShowUpdatePromptDialog(prompt)" />
                                </div>
                            </el-card>
                        </td>
                        <td v-if="(index + 1) < prompts.length">
                            <el-card shadow="hover" class="tag-card">
                                <div class="tag">
                                    <div>
                                        <span class="tag-no">{{ index + 2 }}</span>
                                        <span class="tag-name" v-text="prompts[index + 1].name" />
                                        <span class="tag-status" v-text="prompts[index + 1].status == '1' ? '启用' : '禁用'" />
                                    </div>
                                    <el-button v-text="'查看'"
                                        @click="handleShowUpdatePromptDialog(prompts[index + 1])" />
                                </div>
                            </el-card>
                        </td>
                    </tr>
                </template>
            </table>

            <!-- 编辑标签对话框 -->
            <el-dialog v-model="showUpdatePromptDialog" title="编辑prompt" class="update-tag-dialog" align-center>
                <el-form ref="updateTagFormRef" :label-position="'right'" label-width="80px" :model="updatePromptForm"
                    :rules="updatePromptFormRules">
                    <el-form-item label="名称" prop="name">
                        <el-input v-model="updatePromptForm.name" size="large" />
                    </el-form-item>
                    <el-form-item label="内容" prop="content">
                        <el-input v-model="updatePromptForm.content" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }"
                            size="large" />
                    </el-form-item>
                    <el-form-item label="顺序" prop="sequence">
                        <el-input-number v-model="updatePromptForm.sequence" :min="1" :max="100" />
                    </el-form-item>
                    <el-form-item label="状态" prop="status">
                        <el-switch v-model="updatePromptForm.status" active-color="#13ce66" inactive-color="#ff4949"
                            inline-prompt active-text="启用" inactive-text="禁用" active-value="1" inactive-value="0" />
                    </el-form-item>
                    <el-form-item label="创建时间">
                        <el-input v-model="updatePromptForm.createTime" size="large" disabled />
                    </el-form-item>
                    <el-form-item label="更新时间">
                        <el-input v-model="updatePromptForm.updateTime" size="large" disabled />
                    </el-form-item>
                    <el-form-item>
                        <div>
                            <el-button size="default" @click="showUpdatePromptDialog = false">取消</el-button>
                            <el-button size="default" @click="handleUpdatePrompt()"
                                :loading="updatePromptLoading">更新</el-button>
                            <el-popconfirm confirm-button-text="是" cancel-button-text="否" title="确定要删除吗?"
                                @confirm="handleDeletePrompt" :hide-after="50">
                                <template #reference>
                                    <el-button size="default" type="danger"
                                        :loading="deletePromptLoading[updatePromptForm.promptId]"
                                        :disabled="updatePromptForm.name === '未分类'">删除</el-button>
                                </template>
                            </el-popconfirm>
                        </div>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeMount, onMounted } from 'vue';
import type { FormRules } from 'element-plus';
import { ElMessage } from "element-plus";
import { addPromptAPI, deletePromptAPI, getPromptsAPI, updatePromptAPI } from '../../../api/admin/promptAPI';

const prompts = ref([]);

onBeforeMount(() => {
    getPrompts();
})

const showAddPromptDialog = ref(false);
const creatPromptLoading = ref(false);

const promptForm = reactive({
    name: '',
    content: '',
    sequence: 0,
    status: '0',
    createTime: '',
    updateTime: ''
})

const getPrompts = async () => {
    try {
        const res = await getPromptsAPI();
        if (res.code === 200) {
            prompts.value = res.data;
        } else {
            ElMessage({
                message: res.message,
                type: 'error',
            })
        }
    } catch (error) {
        ElMessage({
            message: error.message,
            type: 'error',
        })
    }
}

const handleCreatePrompt = async () => {
    try {
        const res = await addPromptAPI(promptForm.name, promptForm.content, promptForm.sequence, promptForm.status);
        if (res.code === 200) {
            ElMessage({
                message: res.message,
                type: 'success',
            })
            prompts.value = res.data;
            showAddPromptDialog.value = false;
            promptForm.name = '';
            promptForm.content = '';
            promptForm.sequence = 0;
            promptForm.status = '0';
            promptForm.createTime = '';
            promptForm.updateTime = '';
        } else {
            ElMessage({
                message: res.message,
                type: 'error',
            })
        }
    } catch (error) {
        ElMessage({
            message: error.message,
            type: 'error',
        })
    } finally {
        creatPromptLoading.value = false;
    }
}

const showUpdatePromptDialog = ref(false);
const updatePromptLoading = ref(false);
const updatePromptForm = reactive({
    promptId: '',
    name: '',
    content: '',
    sequence: 0,
    status: '0',
    createTime: '',
    updateTime: ''
})
const updatePromptFormRules = reactive<FormRules>({
    name: [
        { required: true, message: '请输入分类名' },
    ],
    content: [
        { required: true, message: '请输入分类内容' },
    ],
    sequence: [
        { required: true, message: '请输入分类顺序' },
        { type: 'number', min: 1, max: 100, message: '分类顺序必须在1到100之间' },
    ],
    status: [
        { required: true, message: '请选择分类状态' },
    ]
})
function handleShowUpdatePromptDialog(prompt) {
    updatePromptForm.promptId = prompt.promptId;
    updatePromptForm.name = prompt.name;
    updatePromptForm.content = prompt.content;
    updatePromptForm.sequence = prompt.sequence;
    updatePromptForm.status = String(prompt.status);
    updatePromptForm.createTime = prompt.createTime;
    updatePromptForm.updateTime = prompt.updateTime;
    showUpdatePromptDialog.value = true;
}
const handleUpdatePrompt = async () => {
    showUpdatePromptDialog.value = true;
    try {
        const res = await updatePromptAPI(updatePromptForm.promptId, updatePromptForm.name, updatePromptForm.content, updatePromptForm.sequence, updatePromptForm.status);
        if (res.code === 200) {
            ElMessage({
                message: res.message,
                type: 'success',
            })
            prompts.value = res.data;
            showUpdatePromptDialog.value = false;
        } else {
            ElMessage({
                message: res.message,
                type: 'error',
            })
        }
    } catch (error) {
        ElMessage({
            message: error.message,
            type: 'error',
        })
    } finally {
        updatePromptLoading.value = false;
    }
}

const nameColumnWidth = ref(200);
const labelColumnWidth = ref(200);
const windowWidth = ref()
onMounted(() => {
    windowWidth.value = window.innerWidth;
    if (windowWidth.value < 768) {
        nameColumnWidth.value = 90;
        labelColumnWidth.value = 120;
    }
    window.onresize = () => {
        windowWidth.value = window.innerWidth;
        if (windowWidth.value < 768) {
            nameColumnWidth.value = 90;
            labelColumnWidth.value = 120;
        } else {
            nameColumnWidth.value = 200;
            labelColumnWidth.value = 200;
        }
    }
})

const deletePromptLoading = ref([])
const handleDeletePrompt = async () => {
    deletePromptLoading.value[updatePromptForm.promptId] = true;
    try {
        
        const res = await deletePromptAPI(updatePromptForm.promptId);
        if (res.code === 200) {
            ElMessage({
                message: res.message,
                type: 'success',
            })
            prompts.value = res.data;
            showUpdatePromptDialog.value = false;
        } else {
            ElMessage({
                message: res.message,
                type: 'error',
            })
        }
    } catch (error) {
        ElMessage({
            message: error.message,
            type: 'error',
        })
    } finally {
        deletePromptLoading.value[updatePromptForm.promptId] = false;
    }
}
</script>

<style scoped>
.sys-tag {
    padding: 12px;
}

.sys-tag-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 12px 24px;
    border-bottom: 1px solid #f2f2f2;
}

html.dark .sys-tag-header {
    border-bottom-color: #4c4d4f;
}

.sys-tag-body {
    padding: 24px 2px;
}

.tag-table {
    width: 100%;
    border-spacing: 10px 0;
}

.tag-table td {
    width: 50%;
}

@media only screen and (max-width: 768px) {
    .tag-table td {
        width: 100%;
        display: block;
    }
}

.tag-card {
    margin-bottom: 10px;
    transition: unset !important;
}

.tag-card .tag {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.tag-card .tag-no {
    margin-right: 5px;
    color: #337CFF
}

.tag-card .tag-name {
    font-size: 15px;
    margin-right: 10px;
}

.tag-card .tag-status {
    color: grey;
}

.tag-card .tag-label {
    color: grey;
}

.tag-search {
    width: 200px;
}

.tag-create-time,
.tag-update-time {
    color: grey;
    margin-left: 5px;
}
</style>

<style>
@media only screen and (min-width: 1650px) {

    .tag-dialog,
    .manage-tag-option-dialog,
    .add-tap-option-dialog,
    .update-tag-option-dialog,
    .update-tag-dialog {
        --el-dialog-width: 38% !important;
    }
}

@media only screen and (min-width: 1550px) and (max-width: 1650px) {

    .tag-dialog,
    .manage-tag-option-dialog,
    .add-tap-option-dialog,
    .update-tag-option-dialog,
    .update-tag-dialog {
        --el-dialog-width: 45% !important;
    }
}

@media only screen and (min-width: 1200px) and (max-width: 1350px) {

    .tag-dialog,
    .manage-tag-option-dialog,
    .add-tap-option-dialog,
    .update-tag-option-dialog,
    .update-tag-dialog {
        --el-dialog-width: 55% !important;
    }
}

@media only screen and (min-width: 992px) and (max-width: 1200px) {

    .tag-dialog,
    .manage-tag-option-dialog,
    .add-tap-option-dialog,
    .update-tag-option-dialog,
    .update-tag-dialog {
        --el-dialog-width: 62% !important;
    }
}

@media only screen and (min-width: 768px) and (max-width: 992px) {

    .tag-dialog,
    .manage-tag-option-dialog,
    .add-tap-option-dialog,
    .update-tag-option-dialog,
    .update-tag-dialog {
        --el-dialog-width: 75% !important;
    }
}

@media only screen and (max-width: 768px) {

    .tag-dialog,
    .manage-tag-option-dialog,
    .add-tap-option-dialog,
    .update-tag-option-dialog,
    .update-tag-dialog {
        --el-dialog-width: 100% !important;
    }

    .delete-option {
        margin-left: 5px !important;
    }
}

.sys-tag-header .el-input__wrapper {
    transition: unset;
}
</style>