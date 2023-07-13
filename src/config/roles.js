const allRoles = {
  client: ['getWallets'],
  admin: ['getWallets', 'manageUsers', 'manageConfig'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
