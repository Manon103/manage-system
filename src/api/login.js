import request from "./request"

export function login(data) {
  return request({
    url: 'login',
    method: 'post',
    data,
  })
}

export function getPermission() {
  return request({
    url: 'getRouters',
    method: 'get',
  })
}

export function getInfo() {
  return request({
    url: 'getInfo',
    method: 'get',
  })
}