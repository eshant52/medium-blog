export function setExpiration() {
  const currentTime = new Date();

  currentTime.setHours(currentTime.getHours() + 12)

  return currentTime.getTime();
}