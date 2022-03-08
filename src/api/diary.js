import request from "./request";

export function getList(data) {
  return request({
    url: 'report/diary/list',
    method: 'post',
    data,
  })
}

export function addDiary(data) {
  return request({
    url: 'report/diary',
    method: 'post',
    data,
  })
}

export function updateDiary(data) {
  return request({
    url: 'report/diary',
    method: 'put',
    data,
  })
}

export function deleteDiary(data) {
  return request({
    url: `report/diary/deleteById`,
    method: 'delete',
    data,
  })
}
