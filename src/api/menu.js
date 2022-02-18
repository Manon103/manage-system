import request from "./request";

export function getList(params) {
  return request({
    url: 'system/menu/list',
    method: 'get',
    params,
  })
}

export function add(data) {
  return request({
    url: 'system/menu',
    method: 'post',
    data,
  })
}

export function update(data) {
  return request({
    url: 'system/menu',
    method: 'put',
    data,
  })
}

export function deleteMenu(id) {
  return request({
    url: `system/menu/${id}`,
    method: 'delete',
  })
}
