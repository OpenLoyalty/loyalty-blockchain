const uuid = require('uuid');
const logger = require('./config/logger');
const { userService, orgService } = require('./services');
const prisma = require('./prisma/client');
const { parseYamlFile } = require('./services/utils/AppUtil');
const config = require('./config/config');

let isInitialized = false;

const addNetworkAdmin = async () => {
  const networkAdminUsername = 'network-admin';
  try {
    logger.info(`fetching non-hl admin user: ${networkAdminUsername}`);
    await userService.getUserByUsername(networkAdminUsername);
  } catch (e) {
    logger.info(`adding new non-hl admin user: ${networkAdminUsername}`);
    return userService.createNonHlUser({
      username: networkAdminUsername,
      userUuid: uuid.v4(),
      password: 'password1',
      cert: '',
      privateKey: '',
      role: 'admin',
    });
  }
};

const initializeOrg = async (topology, orgName) => {
  let orgObj;
  try {
    orgObj = await orgService.getByName(orgName, { ca: true, peers: true, channels: { include: { chaincodes: true } } });
    logger.info(`organization: ${JSON.stringify(orgObj)} fetched`);
  } catch (e) {
    logger.warn(e);
    logger.info(`creating organization ${orgName}...`);
    orgObj = await prisma.Org.create({
      data: {
        name: orgName,
        mspId: topology.organizations[orgName].mspId,
        peers: {
          create: topology.organizations[orgName].peers.map(function (peerName) {
            return {
              url: topology.peers[peerName].url,
              tlsCaCert: topology.peers[peerName].tlsCACerts ? topology.peers[peerName].tlsCACerts.pem : null,
              name: peerName,
            };
          }),
        },
        ca: {
          create: {
            url: topology.cas[topology.organizations[orgName].ca].url,
            name: topology.cas[topology.organizations[orgName].ca].caName,
            tlsCaCert: topology.cas[topology.organizations[orgName].ca].tlsCACerts
              ? topology.cas[topology.organizations[orgName].ca].tlsCACerts.pem[0]
              : null,
            enrollId: topology.cas[topology.organizations[orgName].ca].registrar.enrollId,
            enrollSecret: topology.cas[topology.organizations[orgName].ca].registrar.enrollSecret,
          },
        },
        channels: {
          create: topology.organizations[orgName].channels.map(function (channelName) {
            return {
              name: channelName,
              chaincodes: {
                create: topology.organizations[orgName].chaincodes.map(function (chaincodeName) {
                  return {
                    name: chaincodeName,
                  };
                }),
              },
            };
          }),
        },
      },
      include: {
        ca: true,
        peers: true,
        channels: {
          include: { chaincodes: true },
        },
      },
    });
    logger.info(`organization: ${orgObj.name} created!`);
    logger.debug(`${orgObj.name} outcome: ${JSON.stringify(orgObj, null, 2)}`);
  }
  const orgAdminUsername = `${orgObj.mspId}-admin`;
  try {
    const orgAdminUser = await userService.getUserByUsername(orgAdminUsername);
    logger.info(`orgAdminUser: ${JSON.stringify(orgAdminUser)} fetched!`);
  } catch (e) {
    logger.info(e);
    logger.info(`creating orgAdminUser ${orgAdminUsername}...`);
    await userService.createOrgAdminUser(orgObj, orgAdminUsername);
  }
  return orgObj;
};

const initializeOrgs = async (topology) => {
  return Promise.all(Object.keys(topology.organizations).map(async (orgName) => initializeOrg(topology, orgName)));
};

const initializeAdmin = async (topology, username) => {
  let adminUser;
  try {
    adminUser = await userService.getUserByUsername(username);
    logger.info(`initializeAdmin: ${JSON.stringify(adminUser)} fetched`);
  } catch (e) {
    logger.info(`creating ${username} user...`);
    const orgObj = await orgService.getByName(topology.users[username].organization, { ca: true });
    adminUser = await userService.createUser(
      {
        username,
        role: 'admin',
        ...topology.users[username],
      },
      orgObj
    );
    logger.info(`${username} user created: ${JSON.stringify(adminUser)}`);
  }
  return adminUser;
};

const initializeAdmins = async (topology) => {
  return Promise.all(Object.keys(topology.users).map(async (username) => initializeAdmin(topology, username)));
};

const _initialize = async () => {
  logger.info(`Initializing app..`);
  try {
    await addNetworkAdmin();
    const hlTopology = parseYamlFile(config.hl_topology);
    await initializeOrgs(hlTopology);
    await initializeAdmins(hlTopology);
    setIsInitialized(true);
  } catch (e) {
    logger.warn(e);
    logger.info('returning initialization prematurely');
  }
};

const initialize = () => {
  return new Promise((resolve, reject) => {
    _initialize()
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const setIsInitialized = (isInitializedNewState) => {
  isInitialized = isInitializedNewState;
};


const getIsInitialized = () => {
  return isInitialized;
}

module.exports = {
  initialize,
  setIsInitialized,
  getIsInitialized,
};
