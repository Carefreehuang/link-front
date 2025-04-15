import request from "@/utils/request";

export function releaseCompetitionAPI(competitionName, description, categoryId, officialWebsite, registrationStart, registrationEnd, competitionStart, competitionEnd, competitionImg) {
    const data = {
        competitionName, 
        description, 
        categoryId, 
        officialWebsite, 
        registrationStart, 
        registrationEnd, 
        competitionStart, 
        competitionEnd, 
        competitionImg
    };
    return request({
        url: '/competition',
        headers: {
            requireToken: true
        },
        data: data,
        method: 'post'
    })
}

export function getCompetitionInfoAPI(competitionId) {
    return request({
        url: '/competitionInfo',
        headers: {
            requireToken: true
        },
        params: {
            id: competitionId
        },
        method: 'get'
    })
}

export function viewCompetitionAPI(competitionId) {
    return request({
        url: 'viewCompetition',
        headers: {
            requireToken: true
        },
        params: {
            cid: competitionId
        },
        method: 'put'
    })
}
