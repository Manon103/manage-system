import request from "./request";

export function getList(params) {
  return request({
    url: 'monitor/operlog/list',
    method: 'get',
    params,
  })
}

export function clearOperlog() {
  return request({
    url: 'monitor/operlog/clean',
    method: 'delete',
  })
}

export function deleteOperlog(id) {
  return request({
    url: `monitor/operlog/${id}`,
    method: 'delete',
  })
}
