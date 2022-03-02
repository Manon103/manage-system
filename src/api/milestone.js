import request from "./request";

export function getList(data) {
  return request({
    url: 'report/milestone/list',
    method: 'get',
    data,
  })
}

export function addMilestone(data) {
  return request({
    url: 'report/milestone',
    method: 'post',
    data,
  })
}

export function updateMilestone(data) {
  return request({
    url: 'report/milestone',
    method: 'put',
    data,
  })
}

export function deleteMilestone(data) {
  return request({
    url: `report/milestone/remove`,
    method: 'delete',
    data,
  })
}
