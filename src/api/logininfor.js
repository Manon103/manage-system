import request from "./request";

export function getList(params) {
  return request({
    url: 'monitor/operlog/list',
    method: 'get',
    params,
  })
}

export function clearLogInfo() {
  return request({
    url: 'monitor/operlog/clean',
    method: 'delete',
    data,
  })
}

export function deleteLogInfo(id) {
  return request({
    url: `monitor/operlog/${id}`,
    method: 'delete',
  })
}
