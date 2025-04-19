<template>
    <div class="chat-container">
        <div class="chat-messages" ref="chatMessagesRef">
            <!-- 当聊天记录为空时显示提示信息 -->
            <div v-if="chatHistory.length === 0" class="no-chat-message">
                暂时没有对话信息
            </div>
            <div v-else v-for="record in chatHistory" :key="record.recordId"
                :class="{ 'user-message': record.isUser, 'ai-message': !record.isUser }">
                <el-avatar v-if="!record.isUser" :src="aiAvatar" size="small" shape="square" class="ai-avatar" />
                <div class="message-box">
                    <p>{{ record.msg }}</p>
                    <span class="message-time">{{ record.createTime }}</span>
                </div>
                <el-avatar v-if="record.isUser" :src="userAvatar" size="small" shape="square" class="user-avatar" />
            </div>
            <div v-if="loading" class="loading">
                <el-skeleton animated :rows="1" style="width: 50%; margin: 0 auto;"></el-skeleton>
            </div>
        </div>
        <div class="chat-input">
            <el-input v-model="message" placeholder="请输入消息" @keyup.enter="chat" type="textarea"
                :autosize="{ minRows: 2, maxRows: 5 }" show-word-limit maxlength="200"></el-input>
            <el-button :loading="loading" @click="chat" class="send-button">发送</el-button>
            <!-- 添加清空聊天按钮 -->
            <el-button @click="clearChatHistory" class="clear-button">新对话</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { chatAPI, getChatHistoryAPI, deleteChatHistoryAPI } from '../../api/chatAPI';
import useUserStore from '../../stores/userStore';
import { ElMessageBox } from 'element-plus';

const userStore = useUserStore();
const chatHistory = ref([]);
const message = ref('');
const loading = ref(false);
const userAvatar = userStore.avatar; // 替换为用户头像的实际路径
const aiAvatar = ref('src\\assets\\img\\logo .png'); // 替换为机器人头像的实际路径
const chatMessagesRef = ref<HTMLElement | null>(null);

const getChatHistory = async () => {
    try {
        const res = await getChatHistoryAPI();
        chatHistory.value = res.data;
        // 等待DOM更新后滚动到最下方
        await nextTick();
        scrollToBottom();
    } catch (error) {
        console.error('获取聊天记录失败:', error);
    }
};

const chat = async () => {
    if (message.value.trim() === '') return;
    chatHistory.value.push({ msg: message.value, isUser: true, createTime: new Date().toLocaleString() });
    await nextTick();
    scrollToBottom();
    const trueMessage = message.value;
    message.value = '';
    loading.value = true;
    try {
        const res = await chatAPI(trueMessage);
        chatHistory.value = res.data;
        // 等待DOM更新后滚动到最下方
        await nextTick();
        scrollToBottom();
    } catch (error) {
        console.error('发送消息失败:', error);
    } finally {
        loading.value = false;
    }
};

// 清空聊天记录的方法
const clearChatHistory = async () => {
    try {
        const result = await ElMessageBox.confirm('确认清空聊天开启新对话?', '取消确认', {
            type: 'warning',
            lockScroll: false,
        });
        if (result === 'confirm') {
            const res = await deleteChatHistoryAPI();
            chatHistory.value = [];
        }
    } catch (error) {
        // 用户取消操作时，ElMessageBox.confirm 会抛出异常，这里可以选择忽略
        if (error !== 'cancel') {
            console.error('清空聊天记录时发生错误:', error);
        }
    }
};

// 滚动到聊天区域最下方的方法
const scrollToBottom = () => {
    if (chatMessagesRef.value) {
        chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
    }
};

onMounted(() => {
    getChatHistory();
});
</script>

<style scoped>
.chat-container {
    display: flex;
    flex-direction: column;
    height: 700px;
    border: 1px solid #ccc;
    border-radius: 5px;
    overflow: hidden;
}

.chat-messages {
    flex: 1;
    padding: 10px;
    overflow-y: auto;
}

.user-message {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
}

.ai-message {
    display: flex;
    justify-content: flex-start;
    margin-bottom: 10px;
}

.user-avatar {
    margin-top: 5px;
}

.ai-avatar {
    margin-top: 5px;
}

.send-button {
    margin-left: 10px;
    margin-top: 10px;
}

.clear-button {
    margin-left: 10px;
    margin-top: 10px;
}

.message-box {
    max-width: 70%;
    padding: 10px;
    border-radius: 8px;
    margin: 0 10px;
    position: relative;
}

.user-message .message-box {
    background-color: #e1f5fe;
}

.ai-message .message-box {
    background-color: #f1f8e9;
}

.message-time {
    font-size: 12px;
    /* 字体改小 */
    color: #999;
    /* 字体颜色为灰色 */
    display: block;
    /* 让时间显示在气泡框下面 */
    margin-top: 5px;
}

.chat-input {
    display: flex;
    padding: 10px;
    border-top: 1px solid #ccc;
}

.chat-input el-input {
    flex: 1;
    margin-right: 10px;
}

.loading {
    text-align: center;
    margin-top: 10px;
}

/* 新增样式：空聊天记录提示信息 */
.no-chat-message {
    text-align: center;
    color: #999;
    margin-top: 20px;
}
</style>