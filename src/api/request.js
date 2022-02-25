import axios from "axios";
import { Message } from "view-design";
import router from '../router';
import { getSession } from "../utils/storage";

const BASE_URL = 'http://139.198.190.129:8889/';
let errMsg = '';
const request = axios.create({
  // 根据环境设置请求地址
  baseURL: BASE_URL || '',
  timeout: 3000,
  headers: { 'content-type': 'application/json' },
});

// 发生请求前的拦截
request.interceptors.request.use(config => {
  // 一般情况下，登录不需要携带token
  if (!config.url.includes('login')) {
    // 设置请求头
    config.headers['Authorization'] = getSession('token');
  }
  return config;
}, err => {
  console.log(err);
  return Promise.reject(err); 
})

// 接收请求返回的拦截
request.interceptors.response.use(response => {
  // 此情况下是后端使用code作为状态码，并且规定了401为未登录
  if (response.data.code === 401) {
    errMsg = '请先登录';
    router.replace('/login');
  }
  if (!response.data) {
    return Promise.reject('no data');
  }
  if (response.data.code !== 200) {
    return Promise.reject(response.data);
  }
  return response.data;
}, err => {
  switch (err.response.status) {
    case 401:
      errMsg = '请先登录';
      router.replace('/login');
      break;
    case 403:
      errMsg = '登录已失效，请重新登录';
      router.replace('/login');
      break;
    case 404:
      errMsg = '请求不存在';
      break;
    default:
      errMsg = err;
      break;
  }
  // 统一提示错误消息如： Message.error(errMsg)
  Message.error('请求出错');
  return Promise.reject(err);
})

export default request;
