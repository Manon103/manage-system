import request from "./request";

export function getList(data) {
  return request({
    url: 'report/product/list',
    method: 'post',
    data,
  })
}

export function addProduct(data) {
  return request({
    url: 'report/product',
    method: 'post',
    data,
  })
}

export function updateProduct(data) {
  return request({
    url: 'report/product',
    method: 'put',
    data,
  })
}

export function deleteProduct(data) {
  return request({
    url: `report/product/remove`,
    method: 'delete',
    data,
  })
}
