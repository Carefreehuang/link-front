import request from "@/utils/request";

export function getAllCategoryAPI() {
    return request({
        url: '/category',
        method: 'get',
        headers: {
            requireToken: true
        }
    })
}

export function getCategoryAndCompetitionsAPI() {
    return request({
        url: '/categoryAndCompetitions',
        method: 'get',
        headers: {
            requireToken: true
        }
    })
}

export function addCategoryAPI(name) {
    const data = {
        name: name,
    }
    return request({
        url: '/category',
        data,
        method: 'post',
        headers: {
            requireToken: true
        }
    })
}

export function updateCategoryAPI(id, name) {
    const data = {
        id: id,
        name: name,
    }
    return request({
        url: '/category',
        data,
        method: 'put',
        headers: {
            requireToken: true
        }
    })
}

export function deleteCategoryAPI(id) {
    return request({
        url: `/category?id=${id}`,
        method: 'delete',
        headers: {
            requireToken: true
        }
    })
}