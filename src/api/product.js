import request from "./request";

export function getList(data) {
  return request({
    url: 'system/product/list',
    method: 'post',
    data,
  })
}

export function addProduct(data) {
  return request({
    url: 'system/product',
    method: 'post',
    data,
  })
}

export function updateProduct(data) {
  return request({
    url: 'system/product',
    method: 'put',
    data,
  })
}

export function deleteProduct(id) {
  return request({
    url: `system/product/${id}`,
    method: 'delete',
  })
}
