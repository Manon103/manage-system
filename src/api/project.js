import request from "./request";

export function getList(data) {
  return request({
    url: 'report/project/list',
    method: 'post',
    data,
  })
}

export function addProject(data) {
  return request({
    url: 'report/project',
    method: 'post',
    data,
  })
}

export function updateProject(data) {
  return request({
    url: 'report/project',
    method: 'put',
    data,
  })
}

export function deleteProject(id) {
  return request({
    url: `system/project/${id}`,
    method: 'delete',
  })
}
