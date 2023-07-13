/* eslint-disable */
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const [, , sourcePath, destPath, chaincodeDir] = process.argv;
const data = yaml.load(fs.readFileSync(sourcePath, 'utf8'));

const chaincodeNames = fs
  .readdirSync(chaincodeDir)
  .map((directory) => path.join(chaincodeDir, directory, 'package.json'))
  .filter((file) => fs.existsSync(file))
  .map((file) => {
    const packageJson = JSON.parse(fs.readFileSync(file, 'utf8'));
    return packageJson.name;
  });

const result = {
  organizations: {
    Org1: {
      mspId: data.organizations.Org1.mspid,
      ca: 'ca.org1.com',
      peers: data.organizations.Org1.peers,
      channels: ['channel1-org1'],
      chaincodes: chaincodeNames,
    },
  },
  users: {
    appAdmin: {
      password: 'password1',
      role: 'admin',
      organization: 'Org1',
    },
  },
  cas: {
    'ca.org1.com': {
      url: 'https://ca.org1.com:7054',
      caName: 'ca.org1.com',
      tlsCACerts: {
        pem: [],
      },
      httpOptions: {
        'ssl-target-name-override': 'ca.org1.com',
        hostnameOverride: 'ca.org1.com',
        verify: false,
      },
      registrar: {
        enrollId: 'admin',
        enrollSecret: 'adminpw',
      },
    },
  },
  peers: {},
};

const caTlsCacertsPath = data.certificateAuthorities['ca.org1.com'].tlsCACerts.path;
const caCertContent = fs.readFileSync(caTlsCacertsPath, 'utf8');
result.cas['ca.org1.com'].tlsCACerts.pem.push(caCertContent);

for (let i = 0; i < Object.entries(data.peers).length; i++) {
  const [peer, peerData] = Object.entries(data.peers)[i];
  const tlsCacertsPath = peerData.tlsCACerts.path;
  const certContent = fs.readFileSync(tlsCacertsPath, 'utf8');
  result.peers[peer] = {
    url: peerData.url.replace('grpcs://localhost', peer),
    tlsCACerts: {
      pem: certContent,
    },
    grpcOptions: {
      'ssl-target-name-override': peer,
    },
    hostnameOverride: peer,
  };
}

fs.writeFileSync(destPath, yaml.dump(result));
console.log(`Network config file stored at ${destPath} successfully.`);
