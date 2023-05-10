export const formattedDuration = (duration: number) => {
  if (duration < 1) {
    return (Math.round(duration * 100) / 100).toFixed(2) + "ms";
  } else if (duration < 1000) {
    return (Math.round(duration * 100) / 100).toFixed(0) + "ms";
  } else if (duration >= 1000) {
    const min = Math.floor((duration / 1000 / 60) << 0);
    if (min == 0) {
      const secs = parseFloat(`${duration / 1000}`).toFixed(2);
      return `${secs}s`;
    } else {
      const sec = Math.floor((duration / 1000) % 60);
      return `${min}m ${sec}s`;
    }
  }
};
