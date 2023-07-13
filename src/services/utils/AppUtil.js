const fs = require('fs');
const yaml = require('js-yaml');
const grpc = require('@grpc/grpc-js');
const crypto = require('crypto');
const { connect, signers } = require('@hyperledger/fabric-gateway');
const _ = require('lodash');
const logger = require('../../config/logger');

const parseYamlFile = (yamlPath) => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  let fileExists = null;
  try {
    fileExists = fs.existsSync(yamlPath);
  } catch (e) {
    throw new Error(`no such file or directory: ${yamlPath}`);
  }
  if (!fileExists) {
    throw new Error(`no such file or directory: ${yamlPath}`);
  }
  logger.debug(`yaml path: ${yamlPath}`);
  if (yamlPath.indexOf('.yaml') < 0) {
    throw new Error(`not a yaml file: ${yamlPath}`);
  }
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const contents = fs.readFileSync(yamlPath, 'utf8');

  // build a JSON object from the file contents
  const fileObj = yaml.load(contents);
  return fileObj;
};

/**
 * Creates new grpc connection to given peer
 * @param {Peer} peer
 * @return {grpc.Client}
 */
const newGrpcConnection = async (peer) => {
  if (peer.tlsCaCert) {
    logger.info('newGrpcConnection creating tls connection');
    const tlsCredentials = grpc.credentials.createSsl(Buffer.from(peer.tlsCaCert));
    return new grpc.Client(peer.url, tlsCredentials);
  }
  logger.info('newGrpcConnection creating no-tls connection');
  return new grpc.Client(peer.url, grpc.credentials.createInsecure());
};

/**
 * creates fabric signer
 * @param {String} privateKeyPem
 * @return {Signer}
 */
const getSigner = async (privateKeyPem) => {
  const privateKey = crypto.createPrivateKey(privateKeyPem);
  const signer = signers.newPrivateKeySigner(privateKey);
  return signer;
};

/**
 * returns new/cached fabric gateway connection
 * @param {User} user
 * @param {Peer} peer
 * @return {Gateway}
 */
const getGateway = async (user, peer) => {
  const client = await newGrpcConnection(peer);
  try {
    const gateway = connect({
      client,
      identity: { mspId: user.organization.mspId, credentials: Buffer.from(user.cert) },
      signer: await getSigner(user.privateKey),
      // Default timeouts for different gRPC calls
      evaluateOptions: () => {
        return { deadline: Date.now() + 5000 }; // 5 seconds
      },
      endorseOptions: () => {
        return { deadline: Date.now() + 15000 }; // 15 seconds
      },
      submitOptions: () => {
        return { deadline: Date.now() + 5000 }; // 5 seconds
      },
      commitStatusOptions: () => {
        return { deadline: Date.now() + 60000 }; // 1 minute
      },
    });
    return gateway;
  } catch (e) {
    logger.info(`failed to connect gateway with error: ${e}`);
  }
};

/**
 * returns selected channel Gateway connection
 * @param {User} userObj
 * @param {Peer} peer
 * @param {String} channelName
 * @return {Network}
 */
const getChannelConnection = async (userObj, peer, channelName) => {
  const gateway = await getGateway(userObj, peer);
  return gateway.getNetwork(channelName);
};

/**
 * returns selected channel Gateway chaincode connection
 * @param {User} userObj
 * @param {String} channelName
 * @param {String} chaincodeName
 * @return {Contract}
 */
const getChaincodeConnection = async (userObj, channelName, chaincodeName) => {
  logger.info(`looking for channel: ${channelName} and chaincode: ${chaincodeName}`);
  const theChannel = _.filter(userObj.organization.channels, function (channel) {
    return channel.name === channelName;
  });
  const theChaincode = _.filter(theChannel[0].chaincodes, function (chaincode) {
    return chaincode.name === chaincodeName;
  });
  const thePeer = userObj.organization.peers[Math.floor(Math.random() * userObj.organization.peers.length)];
  logger.info(`getChaincodeConnection for channel ${theChannel[0].name} and chaincode ${theChaincode[0].name}`);
  const network = await getChannelConnection(userObj, thePeer, theChannel[0].name);
  logger.info(`got network: ${JSON.stringify(network)}`);
  return network.getContract(theChaincode[0].name);
};

module.exports = {
  parseYamlFile,
  getChaincodeConnection,
};
