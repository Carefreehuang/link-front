<template>
    <el-row :gutter="20">
        <el-col :span="resultSpan" :offset="resultOffset">
            <div class="results">
                <template v-for="(competition, index) of props.competitions" :key="index">
                    <div class="result">
                        <router-link :to="{ path: '/c/' + competition.id }" class="result-title-link">
                            <div v-dompurify-html="competition.competitionName" class="result-title" />
                        </router-link>
                        <div class="result-info">
                            <div class="result-time">
                                <div class="result-icon"><i class="czs-time" /></div>
                                <el-tooltip :content="competition.createdTime.toString()" placement="bottom"
                                    :show-after="600">
                                    <span v-text="moment(competition.createdTime).fromNow()" />
                                </el-tooltip>
                            </div>
                            <el-tag size="small" class="result-tag hidden-xs-only" type="info">
                                <router-link :to="{ path: '/competitions'}" class="result-tag-link">{{
                                    competition.categoryName
                                    }}</router-link>
                            </el-tag>
                        </div>
                        <u-fold line="3" class="result-content-fold">
                            <span v-dompurify-html="competition.description" class="result-content" />
                        </u-fold>
                    </div>
                </template>
            </div>
        </el-col>
    </el-row>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import moment from "moment";

const props = defineProps({
    competitions: Array,
    windowWidth: Number,
})

const resultSpan = ref();
const resultOffset = ref();
watch(() => props.windowWidth, (New, Old) => {
    if (New < 992) {
        resultSpan.value = 22;
        resultOffset.value = 1;
    } else {
        resultSpan.value = 18;
        resultOffset.value = 3;
    }
})
onMounted(() => {
    if (props.windowWidth < 992) {
        resultSpan.value = 22;
        resultOffset.value = 1;
    } else {
        resultSpan.value = 18;
        resultOffset.value = 3;
    }
})
</script>

<style scoped>
.results {
    margin-top: 10px;
}

.result {
    padding: 25px 0 15px;
    border-bottom: 1px solid #eaeaea;
}

html.dark .result {
    border-bottom-color: var(--custom-trend-td-bottom-color);
}

.result-title {
    font-size: 18px;
    margin-bottom: 5px;
}

.result-title-link {
    text-decoration: none;
    display: block;
    color: #4682b4;
    width: fit-content;
}

.result-title-link:hover {
    text-decoration: underline;
}

.result-content {
    color: #778799;
}

.result-info {
    display: flex;
    align-items: center;
}

.result-info>.result-tag:not(:last-child) {
    margin-right: 10px;
}

.result-tag-link {
    color: #707f8f;
    text-decoration: unset;
}

.result-icon {
    margin-top: 1px;
    padding-right: 5px;
}

.result-author-link {
    color: #707f8f;
    display: flex;
    text-decoration: unset;
    margin-right: 10px;
}

html.dark .result-author-link {
    color: #8f959f;
}

.result-time {
    display: flex;
    color: #707f8f;
    margin-right: 10px;
}

.result-tag {
    padding: 1px 5px !important;
    ;
}

@media only screen and (max-width: 768px) {
    .results {
        margin-top: 0;
    }
}
</style>

<style>
.result-content-fold .over-hidden {
    text-align: justify;
    line-height: 1.8;
}
</style>