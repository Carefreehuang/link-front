import request from "@/utils/request";

export function uploadAvatarAPI(action, data) {
    return request({
        headers: {
            'Content-Type': 'multipart/form-data',
            requireToken: true
        },
        url: action,
        method: 'post',
        data: data
    })
}

export function uploadAPI(action, file) {
    return request({
        url: action,
        method: 'post',
        headers: {
            'Content-Type': 'multipart/form-data',
            requireToken: true,
        },
        data: file
    })
}