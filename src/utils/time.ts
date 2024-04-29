/*为数字不足位数补0 */
function zeroFill(num: number, len: number) {
  return num.toString().padStart(len, "0");
}
export function getCurrentTime() {
  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hour = date.getHours();
  let minute = date.getMinutes();
  let second = date.getSeconds();
  return `${year}年${month}月${day}日 ${zeroFill(hour, 2)}:${zeroFill(
    minute,
    2
  )}:${zeroFill(second, 2)}`;
}
