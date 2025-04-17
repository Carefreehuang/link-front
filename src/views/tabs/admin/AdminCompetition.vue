<template>
    <div class="sys-tag">
        <div class=sys-tag-header>
            <el-dialog v-model="showAddCategoryDialog" title="新建分类" class="tag-dialog" align-center
                :lock-scroll="false">
                <el-form ref="tagFormRef" :label-position="'right'" label-width="80px" :model="categoryForm">
                    <el-form-item label="分类名称" prop="name">
                        <el-input v-model="categoryForm.name" size="large" />
                    </el-form-item>
                    <el-form-item>
                        <div>
                            <el-button size="default" @click="showAddCategoryDialog = false">取消</el-button>
                            <el-button size="default" @click="handleCreateCategory()"
                                :loading="creatCategoryLoading">添加</el-button>
                        </div>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </div>
        <div class=sys-tag-body>
            <table class="tag-table">
                <template v-for="(category, index) of categorys" :key="category.id">
                    <tr v-if="(index % 2) === 0">
                        <td>
                            <el-card shadow="hover" class="tag-card">
                                <div class="tag">
                                    <div>
                                        <span class="tag-name" v-text="category.name" />
                                    </div>
                                    <el-button v-text="'编辑'" @click="handleShowUpdateCategoryDialog(category)" />
                                </div>
                            </el-card>
                        </td>
                        <td v-if="(index + 1) < categorys.length">
                            <el-card shadow="hover" class="tag-card">
                                <div class="tag">
                                    <div>
                                        <span class="tag-name" v-text="categorys[index + 1].name" />
                                    </div>
                                    <el-button v-text="'编辑'"
                                        @click="handleShowUpdateCategoryDialog(categorys[index + 1])" />
                                </div>
                            </el-card>
                        </td>
                    </tr>
                </template>
            </table>

            <!-- 编辑标签对话框 -->
            <el-dialog v-model="showUpdateCategoryDialog" title="编辑分类" class="update-tag-dialog" align-center>
                <el-form ref="updateTagFormRef" :label-position="'right'" label-width="80px" :model="updateCategoryForm"
                    :rules="updateCategoryFormRules">
                    <el-form-item label="分类名称" prop="name">
                        <el-input v-model="updateCategoryForm.name" size="large"
                            :disabled="updateCategoryForm.name === '未分类'" />
                    </el-form-item>
                    <el-form-item>
                        <div>
                            <el-button size="default" @click="showUpdateCategoryDialog = false">取消</el-button>
                            <el-button size="default" @click="handleUpdateCategory()"
                                :loading="updateCategoryLoading">更新</el-button>
                            <el-popconfirm confirm-button-text="是" cancel-button-text="否" title="确定要删除吗?"
                                @confirm="handleDeleteCategory" :hide-after="50">
                                <template #reference>
                                    <el-button size="default" type="danger"
                                        :loading="deleteCategoryLoading[updateCategoryForm.id]"
                                        :disabled="updateCategoryForm.name === '未分类'">删除</el-button>
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
import { addCategoryAPI, deleteCategoryAPI, getAllCategoryAPI, updateCategoryAPI } from '../../../api/admin/categoryAPI';

const categorys = ref([]);

onBeforeMount(() => {
    refreshCategory();
})

const showAddCategoryDialog = ref(false);
const creatCategoryLoading = ref(false);
const categoryForm = reactive({
    name: '',
})

const refreshCategory = async () => {
    try {
        const res = await getAllCategoryAPI();
        if (res.code === 200) {
            categorys.value = res.data;
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

const handleCreateCategory = async () => {
    try {
        const res = await addCategoryAPI(categoryForm.name);
        if (res.code === 200) {
            ElMessage({
                message: res.message,
                type: 'success',
            })
            categorys.value.push(res.data.newCategory);
            showAddCategoryDialog.value = false;
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
        creatCategoryLoading.value = false;
    }
}

const showUpdateCategoryDialog = ref(false);
const updateCategoryLoading = ref(false);
const updateCategoryForm = reactive({
    id: '',
    name: '',
})
const updateCategoryFormRules = reactive<FormRules>({
    name: [
        { required: true, message: '请输入分类名' },
    ]
})
function handleShowUpdateCategoryDialog(category) {
    updateCategoryForm.id = category.id;
    updateCategoryForm.name = category.name;
    showUpdateCategoryDialog.value = true;
}
const handleUpdateCategory = async () => {
    updateCategoryLoading.value = true;
    try {
        const res = await updateCategoryAPI(updateCategoryForm.id, updateCategoryForm.name);
        if (res.code === 200) {
            ElMessage({
                message: res.message,
                type: 'success',
            })
            refreshCategory();
            showUpdateCategoryDialog.value = false;
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
        updateCategoryLoading.value = false;
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

const deleteCategoryLoading = ref([])
const handleDeleteCategory = async () => {
    deleteCategoryLoading.value[updateCategoryForm.id] = true;
    try {
        const res = await deleteCategoryAPI(updateCategoryForm.id);
        if (res.code === 200) {
            ElMessage({
                message: res.message,
                type: 'success',
            })
            refreshCategory();
            showUpdateCategoryDialog.value = false;
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
        deleteCategoryLoading.value[updateCategoryForm.id] = false;
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

.tag-card .tag-name {
    font-size: 15px;
    margin-right: 10px;
}

.tag-card .tag-label {
    color: grey;
}

.tag-search {
    width: 200px;
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