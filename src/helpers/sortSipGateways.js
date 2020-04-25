
const sortSipGateways = sipGateways => {
  sipGateways.sort((a, b) => {
    const makeIp = a => (a.ipv4 && a.ipv4.toLowerCase()) || '';
    const makePort = a => (a.port && a.port.toString().padStart(5,0)) || '';
    let valA = `${makeIp(a)}:${makePort(a)}`;
    let valB = `${makeIp(b)}:${makePort(b)}`;
    return valA > valB ? 1 : valA < valB ? -1 : 0;
  });
  return sipGateways;
};

export default sortSipGateways;
