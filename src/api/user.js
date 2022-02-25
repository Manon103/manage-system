import request from "./request";

export function getList(params) {
  return request({
    url: 'system/user/list',
    method: 'get',
    params,
  })
}

export function addUser(data) {
  return request({
    url: 'system/user/save',
    method: 'post',
    data,
  })
}

export function updateUser(data) {
  return request({
    url: 'system/user',
    method: 'put',
    data,
  })
}

export function deleteUser(id) {
  return request({
    url: `system/user/${id}`,
    method: 'delete',
  })
}

export function getAddUserInfo(id) {
  const userId = id ? id : 1;
  return request({
    url: `system/user/${userId}`,
    method: 'get',
  })
}

export function resetPassword(data) {
  return request({
    url: `system/user/resetPwd`,
    method: 'put',
    data,
  })
}

export function authRole(data) {
  return request({
    url: `system/user/authRole`,
    method: 'put',
    data,
  })
}