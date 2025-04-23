import request from "@/utils/request";

export function searchPostsAPI(keyword) {
    return request({
        url: '/search/post',
        method: 'get',
        params: {
            keyword,
        }
    })
}

export function searchUsersAPI(keyword) {
    return request({
        url: '/search/user',
        method: 'get',
        params: {
            keyword,
        }
    })
}

export function searchCompetitionsAPI(keyword) {
    return request({
        url: '/search/competition',
        method: 'get',
        params: {
            keyword,
        }
    })
}

export function addPostsAPI() {
    return request({
        url: '/search/addPosts',
        method: 'post',
        headers: {
            requireToken: true
        },
    })
}

export function addUsersAPI() {
    return request({
        url: '/search/addUsers',
        method: 'post',
        headers: {
            requireToken: true
        },
    })
}

export function addCompetitionAPI() {
    return request({
        url: '/search/addCompetitions',
        method: 'post',
        headers: {
            requireToken: true
        },
    })
}

export function getSearchHotKeywordAPI() {
    return request({
        url: '/search/hotKeyword',
        method: 'get'
    })
}