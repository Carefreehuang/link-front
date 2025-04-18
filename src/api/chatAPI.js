import request from "@/utils/request";

export function chatAPI(msg) {
    const data = {
        msg: msg,
    }
    return request({
        url: '/chat',
        headers: {
            requireToken: true
        },
        data: data,
        method: 'post'
    })
}

export function getChatHistoryAPI() {
    return request({
        url: '/chatHistory',
        headers: {
            requireToken: true
        },
        method: 'get'
    })
}