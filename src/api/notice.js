import request from "./request";

export function getList(params) {
  return request({
    url: 'system/notice/list',
    method: 'get',
    params,
  })
}

export function addNotice(data) {
  return request({
    url: 'system/notice',
    method: 'post',
    data,
  })
}

export function updateNotice(data) {
  return request({
    url: 'system/notice',
    method: 'put',
    data,
  })
}

export function deleteNotice(id) {
  return request({
    url: `system/notice/${id}`,
    method: 'delete',
  })
}
