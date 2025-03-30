<template>
    <el-dialog v-model="dialogModel" class="contact-dialog" title="联系方式" center width="395px" destroy-on-close
        :show-close="false" :close-on-click-modal="true" :lock-scroll="false">
        <el-form-item prop="wechat">
            <el-input v-model="contactInfo.wechat" readonly>
                <template #prepend><i class="czs-weixin" /></template>
            </el-input>
        </el-form-item>
        <el-form-item prop="qq">
            <el-input v-model="contactInfo.qq" readonly>
                <template #prepend><i class="czs-qq" /></template>
            </el-input>
        </el-form-item>
        <el-form-item prop="phone">
            <el-input v-model="contactInfo.phone" readonly>
                <template #prefix>
                </template>
                <template #prepend><i class="czs-phone" /></template>
            </el-input>
        </el-form-item>
    </el-dialog>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
    showContactDialog: Boolean,
    contactInfo: Object
});
const emits = defineEmits(['closeNoLoginDialog']);

const dialogModel = computed({
    get() {
        return props.showContactDialog;
    },
    set() {
        emits('closeNoLoginDialog');
    }
});
</script>

<style scoped></style>

<style>
@media screen and (max-width: 768px) {
    .el-dialog.contact-dialog {
        --el-dialog-width: 95% !important;
    }
}
</style>