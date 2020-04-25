
const phoneNumberFormat = number => {
  const usaReg  = /^(1?)([2-9][0-9]{2})([2-9][0-9]{2})([0-9]{4})$/;
  const match = number.match(usaReg);
  if (number.match(usaReg)) {
    return `${match[1] ? `+${match[1]} ` : ''}(${match[2]}) ${match[3]}-${match[4]}`;
  }
  return number;
};

export default phoneNumberFormat;
