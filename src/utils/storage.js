function getCookie() {
  const cookie = window.document.cookie.split('; ');
  const cookieObj = {};
  cookie.forEach(item => {
    const cookieArr = item.split('=');
    cookieObj[cookieArr[0]] = cookieArr[1];
  });
  return cookieObj;
}

/**
 * 
 * @param {object} obj 传入需要存储的数据
 * @param {number} expires 过期时间/天
 */
function setCookie(obj, expires) {
  if (typeof(expires) !== 'number') {
    return;
  }
  const day = new Date();
  const expireTime = day.setTime(day.getTime() + 60 * 60 * 24 * expires * 1000);
  for (const key in obj) {
    const val = obj[key];
    window.document.cookie = `${key}=${val};expires=${new Date(expireTime).toGMTString()}`;
  }
}

function setSession(key, value) {
  const type = typeof(value);
  window.sessionStorage.setItem(key, JSON.stringify(value));
}

function getSession(key) {
  const value = window.sessionStorage.getItem(key);
  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
}

function removeSession(key) {
  window.sessionStorage.removeItem(key);
}

function clear(){
  window.sessionStorage.clear();
}

export {
  getCookie,
  setCookie,
  setSession,
  getSession,
  clear,
  removeSession,
}