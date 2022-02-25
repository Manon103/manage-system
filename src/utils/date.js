export function formatDate(date) {
  const month = new Date(date).getMonth() + 1;
  const year = new Date(date).getFullYear();
  const finalMonth = month < 10 ? `0${month}` : month;
  const day = new Date(date).getDate() < 10 ? `0${new Date(date).getDate()}` : new Date(date).getDate();
  return `${year}-${finalMonth}-${day}`;
}