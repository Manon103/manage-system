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

export function deleteProject(data) {
  return request({
    url: `report/project/remove`,
    method: 'delete',
    data,
  })
}

export function getProjectInfo(id) {
  return request({
    url: `report/project/${id}`,
    method: 'get',
  })
}