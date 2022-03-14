import request from "./request";

export function getList(params) {
  return request({
    url: 'monitor/online/list',
    method: 'get',
    params,
  })
}

export function quitUser(id) {
  return request({
    url: `monitor/online/${id}`,
    method: 'delete',
  })
}
