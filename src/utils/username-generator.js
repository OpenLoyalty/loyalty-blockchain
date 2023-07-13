const names = require('./names.json');
const adjectives = require('./adjectives.json');

const data = {
  names,
  adjectives,
};
const seperator = '-';

const generate = () => {
  const nameIndex = Math.floor(Math.random() * data.names.length);
  const adjIndex = Math.floor(Math.random() * data.adjectives.length);
  const suffix = Math.floor(Math.random() * 100);
  return `${data.adjectives[adjIndex]}${seperator}${data.names[nameIndex]}${suffix}`;
};

// eslint-disable-next-line no-unused-vars
const joiGenerate = (parent, helpers) => {
  return generate();
};

module.exports = {
  joiGenerate,
};
