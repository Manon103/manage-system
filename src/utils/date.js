export function formatDate(date) {
  const month = new Date(date).getMonth() + 1;
  const year = new Date(date).getFullYear();
  const finalMonth = month < 10 ? `0${month}` : month;
  const day = getFormatNumber(new Date(date).getDate());
  return `${year}-${finalMonth}-${day}`;
}

export function formatTime(date) {
  const dateTime = new Date(date);
  const day = formatDate(date);
  const h = getFormatNumber(dateTime.getHours()) + ':';
  const m = getFormatNumber(dateTime.getMinutes()) + ':';
  const s = getFormatNumber(dateTime.getSeconds());
  return `${day} ${h}${m}${s}`;
}

function getFormatNumber(num) {
  return num < 10 ? `0${num}` : num;
}