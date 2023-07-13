const FabricCAServices = require('fabric-ca-client');
const { User } = require('fabric-common');
const logger = require('../../config/logger');

/**
 *
 * @param {CA} ca
 * @return {FabricCAServices}
 */
const buildCAClient = (ca) => {
  // Create a new CA client for interacting with the CA.
  let caClient;
  if (ca.tlsCACerts === false) {
    // connect without TLS
    caClient = new FabricCAServices({ url: ca.url, caName: ca.name });
  } else {
    // connect with TLS
    caClient = new FabricCAServices(ca.url, { trustedRoots: ca.tlsCaCert, verify: false }, ca.name);
  }

  logger.debug(`Built a CA Client for ca ${ca.name}`);
  return caClient;
};

/**
 *
 * @param {Object} registrar
 * @param {Org} org
 * @param {FabricCAServices} caClient
 * @return {X509Identity}
 */
const enrollAdmin = async (registrar, org, caClient) => {
  try {
    // Enroll the admin user, and import the new identity into the wallet.
    const enrollment = await caClient.enroll({
      enrollmentID: registrar.enrollId,
      enrollmentSecret: registrar.enrollSecret,
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: org.mspId,
      type: 'X.509',
    };
    logger.debug('Successfully enrolled admin user');
    return x509Identity;
  } catch (error) {
    logger.error(`Failed to enroll admin user : ${error}`);
    throw error;
  }
};

/**
 *
 * @param {FabricCAServices} caClient
 * @param {Org} orgWithCa
 * @param {User} adminObj
 * @param {String} userUuid
 * @param {String} role
 * @param {String} affiliation
 * @returns {X509Identity} registered identity
 */
const registerAndEnrollUser = async (caClient, orgWithCa, adminObj, userUuid, role = 'client', affiliation = null) => {
  try {
    const orgAdminUser = await User.createUser(
      orgWithCa.ca.enrollId,
      orgWithCa.ca.enrollSecret,
      orgWithCa.mspId,
      adminObj.cert,
      adminObj.privateKey
    );
    // Register the user, enroll the user, and import the new identity into the wallet.
    // if affiliation is specified by client, the affiliation value must be configured in CA
    const secret = await caClient.register(
      {
        affiliation,
        enrollmentID: userUuid,
        role,
        attrs: [
          { name: 'userUuid', value: userUuid, ecert: true },
          { name: 'role', value: role, ecert: true },
        ],
      },
      orgAdminUser
    );
    const enrollment = await caClient.enroll({
      enrollmentID: userUuid,
      enrollmentSecret: secret,
      attr_reqs: [
        { name: 'userUuid', optional: false },
        { name: 'role', optional: false },
      ],
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: orgWithCa.mspId,
      type: 'X.509',
    };
    logger.debug(`Successfully registered and enrolled user ${userUuid} and imported it into the wallet`);
    return x509Identity;
  } catch (error) {
    logger.error(`Failed to register user : ${error}`);
    throw error;
  }
};

module.exports = {
  buildCAClient,
  enrollAdmin,
  registerAndEnrollUser,
};
