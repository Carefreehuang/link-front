import request from "@/utils/request";

export function getPromptsAPI() {
    return request({
        url: '/prompts',
        method: 'get',
        headers: {
            requireToken: true
        }
    })
}

export function addPromptAPI(name, content, sequence, status) {
    return request({
        url: '/prompt',
        method: 'post',
        data: {
            name: name,
            content: content,
            sequence: sequence,
            status: status
        },
        headers: {
            requireToken: true
        }
    })
}

export function updatePromptAPI(promptId, name, content, sequence, status) {
    return request({
        url: '/prompt',
        method: 'put',
        data: {
            promptId: promptId,
            name: name,
            content: content,
            sequence: sequence,
            status: status
        },
        headers: {
            requireToken: true
        }
    })
}

export function deletePromptAPI(id) {
    return request({
        url: `/prompt?promptId=${id}`,
        method: 'delete',
        headers: {
            requireToken: true
        }
    })
}

