/* eslint-disable */
const axios = require('axios');

const enforcementDate = '2023-01-10 22:30:00';
const expirationDate = '2024-01-10 22:30:00';

async function login() {
  const response = await axios.post('http://localhost:3000/v1/auth/login', {
    username: 'appAdmin',
    password: 'password1',
  });

  return {
    bearerToken: response.data.tokens.access.token,
    userUuid: response.data.user.userUuid,
  };
}

async function createUser(bearerToken) {
  const response = await axios.post(
    'http://localhost:3000/v1/admin/user',
    {
      password: 'password1',
      organization: 'Org1',
      role: 'client',
    },
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    }
  );

  return response.data.user.userUuid;
}

async function createPrepaidCard(bearerToken, userUuid) {
  await axios.post(
    'http://localhost:3000/v1/admin/prepaid-card/create',
    {
      receiverWallet: userUuid,
      amount: 444,
      currency: 'USD',
      enforcementDate,
      expirationDate,
    },
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    }
  );
}

async function addPoints(bearerToken, userUuid) {
  await axios.post(
    'http://localhost:3000/v1/admin/points/add',
    {
      receiverWallet: userUuid,
      amount: 500,
      enforcementDate,
      expirationDate,
    },
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    }
  );
}

async function createGiftCard(bearerToken, userUuid) {
  await axios.post(
    'http://localhost:3000/v1/admin/gift-card/create',
    {
      receiverWallet: userUuid,
      amount: 333,
      currency: 'USD',
      enforcementDate,
      expirationDate,
    },
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    }
  );
}

async function createVoucher(bearerToken, userUuid) {
  await axios.post(
    'http://localhost:3000/v1/admin/voucher/create',
    {
      receiverWallet: userUuid,
      amount: 333,
      currency: 'USD',
      enforcementDate,
      expirationDate,
    },
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    }
  );
}

async function createUtilityToken(bearerToken, userUuid) {
  await axios.post(
    'http://localhost:3000/v1/admin/utility-token/create',
    {
      receiverWallet: userUuid,
      utilities: {
        freeDelivery: true,
        products: "premiere",
        onet: "vip_section"
      },
      usageLimits: 5,
      enforcementDate,
      expirationDate,
    },
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    }
  );
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function executeRequests() {
  try {
    console.log(`login`);
    const { bearerToken, userUuid } = await login();
    console.log(`create user`);
    const newUserUuid = await createUser(bearerToken);
    console.log(`Sleeping for 5 seconds...`);
    await sleep(5000);
    console.log(`create prepaid card`);
    await createPrepaidCard(bearerToken, newUserUuid);
    console.log(`create points`);
    await addPoints(bearerToken, newUserUuid);
    console.log(`create gift card`);
    await createGiftCard(bearerToken, newUserUuid);
    console.log(`create voucher`);
    await createVoucher(bearerToken, newUserUuid);
    console.log(`create utility token`);
    await createUtilityToken(bearerToken, newUserUuid);
    console.log(`Ledger initialized`);
  } catch (error) {
    console.error(`Error occurred: ${error}`);
  }
}

executeRequests();
