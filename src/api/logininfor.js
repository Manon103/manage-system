import request from "./request";

export function getList(params) {
  return request({
    url: 'monitor/logininfor/list',
    method: 'get',
    params,
  })
}

export function clearLogInfo() {
  return request({
    url: 'monitor/logininfor/clean',
    method: 'delete',
  })
}

export function deleteLogInfo(id) {
  return request({
    url: `monitor/logininfor/${id}`,
    method: 'delete',
  })
}
