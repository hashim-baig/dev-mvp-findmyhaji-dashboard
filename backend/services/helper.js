function getISTISOString() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);
  const pad = (n) => n.toString().padStart(2, '0');
  const year = istTime.getUTCFullYear();
  const month = pad(istTime.getUTCMonth() + 1);
  const day = pad(istTime.getUTCDate());
  const hours = pad(istTime.getUTCHours());
  const minutes = pad(istTime.getUTCMinutes());
  const seconds = pad(istTime.getUTCSeconds());
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+05:30`;
}

export { getISTISOString };