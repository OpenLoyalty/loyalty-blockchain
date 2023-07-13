const getISODate = (hlDate) => {
  return new Date(parseInt(hlDate, 10) * 1000).toISOString();
};

const getHLDate = (isoDate) => {
  return isoDate.getTime() / 1000;
};

module.exports = {
  getISODate,
  getHLDate,
};
