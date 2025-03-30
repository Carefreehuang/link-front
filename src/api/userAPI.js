import request from "@/utils/request";

export function getProfileAPI() {
    return request({
        url: '/profile',
        headers: {
            requireToken: true
        },
        method: 'get'
    })
}

export function getUserProfileAPI(username) {
    return request({
        url: '/userProfile',
        params: {
            username,
        },
        method: 'get'
    })
}

export function getUserPostsAPI(username) {
    return request({
        url: '/userPosts',
        params: {
            username,
        },
        method: 'get'
    })
}

export function updateSchoolAndMajor(school, major) {
    return request({
        url: '/updateSchoolAndMajor',
        params: {
            school: school,
            major: major
        },
        headers: {
            requireToken: true,
        },
        method: 'Post'
    })
}

export function updateContactInfoAPI(wechat, qq, phone) {
    return request({
        url: '/updateContactInfo',
        params: {
            wechat: wechat,
            qq: qq,
            phone: phone
        },
        headers: {
            requireToken: true,
        },
        method: 'Post'
    })
}


export function updatePasswordAPI(currentPassword, newPassword, confirmNewPassword) {
    return request({
        url: '/updatePassword',
        data: {
            currentPassword: currentPassword,
            newPassword: newPassword,
            confirmNewPassword: confirmNewPassword,
        },
        headers: {
            requireToken: true,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'post'
    })
}