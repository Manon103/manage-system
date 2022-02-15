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

export function deleteRole(ids) {
  return request({
    url: `system/role/${ids}`,
    method: 'delete',
  })
}

export function updateRole(data) {
  return request({
    url: `system/role`,
    method: 'put',
    data,
  })
}

export function updateRoleDataScope(data) {
  return request({
    url: `system/role/dataScope`,
    method: 'put',
    data,
  })
}

export function getDeptTree(params) {
  return request({
    url: 'system/dept/treeselect',
    method: 'get',
    params,
  })
}

export function getAuthList(params) {
  return request({
    url: 'system/role/authUser/allocatedList',
    method: 'get',
    params,
  })
}

export function getUnAuthList(params) {
  return request({
    url: 'system/role/authUser/unallocatedList',
    method: 'get',
    params,
  })
}