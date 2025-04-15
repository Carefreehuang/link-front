<template>
    <div class="competition-list-container">
        <!-- 左侧竞赛分类 -->
        <el-col :span="6">
            <el-menu :default-active="activeCategory" mode="vertical" class="category-menu">
                <div class="menu-title">赛事分类</div>
                <el-menu-item v-for="category in categories" :key="category.id" :index="category.id.toString()" @click="activeCategory = category.id">
                    <i class="el-icon-folder-opened"></i>
                    <span>{{ category.name }}</span>
                </el-menu-item>
            </el-menu>
        </el-col>
        <!-- 右侧具体竞赛列表 -->
        <el-col :span="18">
            <el-card class="competition-card">
                <template #header>
                    <div class="card-header">赛事列表</div>
                </template>
                <el-table :data="paginatedCompetitions" @row-click="handleRowClick" class="competition-table">
                    <el-table-column prop="competitionName" label="赛事名称"></el-table-column>
                    <el-table-column prop="registrationStart" label="报名开始时间"></el-table-column>
                    <el-table-column prop="registrationEnd" label="报名截止时间"></el-table-column>
                </el-table>
                <!-- 分页组件 -->
                <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                    :current-page="currentPage" :page-sizes="[10, 20, 30]" :page-size="pageSize"
                    layout="total, sizes, prev, pager, next, jumper" :total="filteredCompetitions.length"
                    class="pagination">
                </el-pagination>
            </el-card>
        </el-col>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getCategoryAndCompetitionsAPI } from '../../../api/admin/categoryAPI';

const route = useRoute();
const router = useRouter();

// 竞赛分类
const categories = ref([]);
// 选中的竞赛分类
const activeCategory = ref('');
// 所有竞赛列表
const totalCompetitions = ref([]);
// 当前页码
const currentPage = ref(1);
// 每页显示数量
const pageSize = ref(10);

// 根据选中的分类ID过滤竞赛列表
const filteredCompetitions = computed(() => {
    if (activeCategory.value === '') {
        return totalCompetitions.value;
    }
    return totalCompetitions.value.filter(competition => competition.categoryId.toString() === activeCategory.value);
});

// 根据当前页码和每页显示数量截取显示的竞赛列表
const paginatedCompetitions = computed(() => {
    const startIndex = (currentPage.value - 1) * pageSize.value;
    const endIndex = startIndex + pageSize.value;
    return filteredCompetitions.value.slice(startIndex, endIndex);
});

// 获取竞赛分类
const getCategories = async () => {
    try {
        const res = await getCategoryAndCompetitionsAPI();
        categories.value = res.data.categories;
        totalCompetitions.value = res.data.competitions;
        if (categories.value.length > 0) {
            activeCategory.value = categories.value[0].id.toString();
        }
    } catch (error) {
        console.error('获取竞赛分类失败:', error);
    }
};

// 监听选中的竞赛分类变化
watch(activeCategory, () => {
    currentPage.value = 1;
});

// 处理每页显示数量变化
const handleSizeChange = (newSize: number) => {
    pageSize.value = newSize;
};

// 处理当前页码变化
const handleCurrentChange = (newPage: number) => {
    currentPage.value = newPage;
};

// 处理表格行点击事件
const handleRowClick = (row: any) => {
    router.push({ path: `/c/${row.id}` });
};

onBeforeMount(() => {
    getCategories();
});
</script>

<style scoped>
.competition-list-container {
    display: flex;
    padding: 20px;
}

.category-menu {
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background-color: #fff;
}

.menu-title {
    padding: 16px;
    font-size: 16px; 
    font-weight: bold;
    color: #333;
    border-bottom: 1px solid #eee;
    text-align: left; /* 让标题文字左对齐 */
}

.category-menu .el-menu-item {
    padding: 0 20px; 
    line-height: 30px; 
    text-align: left; /* 让菜单项文字左对齐 */
}

.category-menu .el-menu-item i {
    margin-right: 10px; 
}

.competition-card {
    margin-left: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background-color: #fff;
}

.card-header {
    font-size: 18px;
    font-weight: bold;
    color: #333;
}

.competition-table .el-table__row {
    cursor: pointer;
}

.competition-table .el-table__row:hover {
    background-color: #f5f5f5;
}

.pagination {
    margin-top: 20px;
    text-align: right;
}
</style>