import {defineStore} from "pinia";

const tabPrefix = '/n/';

const useTabStore = defineStore("tab", {
    state: () => ({
        mainTabs: [
            { name: "全部帖子", path: "/", icon: "czs-layout-list" },
            //{ name: "最新", path: tabPrefix + "latest", },
            { name: "热门帖子", path: tabPrefix + "hot",icon: "czs-people" },
            { name: "标签分类", path: '/tags', icon: "czs-block-l" },
            { name: "赛事列表", path: '/competitions', icon: "czs-medal-l" },
        ],
        menuTabs: [
            { name: "标签", path: '/tags', icon: "czs-block-l" },
            /*{ name: "广场", path: '/plaza', icon: "czs-shop-l" },*/
        ],
        userTabs: [
            { name: "主题", path: '' },
            { name: "评论", path: 'comments' },
            { name: "关注", path: 'follow' },
            { name: "收藏", path: 'bookmark' },
        ],
        defaultAsideMainMenus: [
            { name: "首页", path: "/", icon: "czs-home-l" },
            { name: "博客", path: "/blog", icon: "czs-book-l" },
            { name: "广场", path: "/plaza", icon: "czs-shop-l" },
            { name: "标签", path: "/tags", icon: "czs-block-l" }
        ],
        defaultAsideMinorMenus: [
            { name: "聊天室", path: "/chat", icon: "czs-talk-l" },
            { name: "朋友圈", path: "/moments", icon: "czs-moments" },
        ],
        messageTabs: [
            { name: "全部消息", path: "/", },
            { name: "未读消息", path: tabPrefix + "latest", },
        ]
    })
})

export default useTabStore