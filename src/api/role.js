import request from "./request";

export function getList(params) {
  return request({
    url: 'system/role/list',
    method: 'get',
    params,
  })
}