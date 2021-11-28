import request from "./request"

export function getList(params) {
  return request({
    url: '/api/columns/zhihuadmin',
    method: 'get',
    params,
  })
}