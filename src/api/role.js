import request from "./request";

export function getList(params) {
  return request({
    url: 'system/role/list',
    method: 'get',
    params,
  })
}

export function getMenuTree(params) {
  return request({
    url: 'system/menu/treeselect',
    method: 'get',
    params,
  })
}

export function addRole(data) {
  return request({
    url: 'system/role',
    method: 'post',
    data,
  })
}