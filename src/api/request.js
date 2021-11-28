import api from './http';

export default function request(option) {
  return new Promise((resolve, reject) => {
    api(option).then(res => {
      resolve(res.data);
    }).catch(e => {
      reject(e);
    })
  })
}