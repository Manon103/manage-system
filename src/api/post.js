import request from "./request";

export function getList(params) {
  return request({
    url: 'system/post/list',
    method: 'get',
    params,
  })
}

export function addPost(data) {
  return request({
    url: 'system/post',
    method: 'post',
    data,
  })
}

export function updatePost(data) {
  return request({
    url: 'system/post',
    method: 'put',
    data,
  })
}

export function deletePost(id) {
  return request({
    url: `system/post/${id}`,
    method: 'delete',
  })
}
