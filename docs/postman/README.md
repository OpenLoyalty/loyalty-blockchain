# Loyalty Blockchain API usage instruction and flow

### General information
This package comes with `loyalty-blockchain-api.json` collection providing easy access to
all endpoints supported by Loyalty Blockchain. Along with it comes the `localhost-docker.json` file to be added  
to Postman Environments setting up initial environment for the calls.

The collection is split into directories indicating sub-paths in api url.  
For instance, when in this doc is referring to `/v1/admin/network/peer` you should look for
`admin` and then `network` followed by `peer` directories.  
  
In general, Loyalty Blockchain operates on `userUuid` as a user unique identifier.  
Asset IDs are combination of `TxId.index`

### Admin access
out of the box, Loyalty Blockchain comes with application admin user capable of
administering the network ecosystem and impersonating all users in the system
```json
{
  "username": "appAdmin",
  "password": "password1"
}
```
Use this user to mimic the behavior and flow of initial OpenLoyalty API integration.  
In order to login as appAdmin user, call `POST /v1/auth/login`

## How to Use

To get started with Loyalty Blockchain Contracts, here's a step-by-step guide on how you can use the system:

1. **Log in to the app.** 
    Use the `appAdmin` credentials via the `POST /v1/auth/login` request.
2. **Create a new user.** 
    Make a `POST /v1/admin/user` request, providing `Org1` as the organization and `client` as the role.
```json
{
    "password": "password1",
    "organization": "Org1",
    "role": "client"
}
```
3. **Store the `userUuid`.** 
    You'll get a `userUuid` in the response. Make sure to save it somewhere safe; you'll need it for future reference.
4. **Add points to the user.**
    Use the `POST /v1/admin/points/add` request to give the user some points.
```json
{
    "receiverWallet": "2bdb73cf-1768-4c4e-b3ea-5d4b395e22dc",
    "amount": 300,
    "enforcementDate": "2023-01-10 22:30:00",
    "expirationDate": "2023-12-26 12:55:00"
}
```
5. **Create and assign assets to the user.** 
    Use the `POST /v1/admin/<asset type>/create` request for this. Remember to store the `key` you'll get in the response for future use.
```json
{
    "receiverWallet": "2bdb73cf-1768-4c4e-b3ea-5d4b395e22dc",
    "amount": 444,
    "currency": "USD",
    "enforcementDate": "2022-03-10 22:30:00",
    "expirationDate": "2024-02-10 12:53:15"
    
}
```
6. **Check the user's balance, card history, or general information.** 
    - To query the user's balance, use the `GET /v1/admin/user/:wallet/points/balance` request.
    - To get the cards history, use the `GET /v1/admin/user/:wallet/gift-card/:cardId/history` request.
    - For user general information, use the `GET /v1/admin/user/:wallet` request.
```json
{
    "user": {
        "username": "subordinate-perversion12",
        "userUuid": "ecceafda-6a95-4eeb-8289-fed8e7d1124b",
        "role": "client"
    },
    "points": 300,
    "assets": {
        "prepaidCards": [
            "edee9d47d6d29b9c414fcfb878f4e145512b21bb25890c8089ea6914f81b6843.0"
        ],
        "giftCards": [
            "400bf7870b79c2a75a4f74e18948cff2671e357b2c9189d577fb2aff17866d2e.0",
            "eb7da2184b6fcaef02ff8a6c0157ca545a4fa3a148148f0279578bf474f23bd9.0"
        ],
        "vouchers": [
            "92c188cc83213c4ca7475945fc00888dbc75bdb4c01ec6e09e6a83c43af7818a.0"
        ],
        "utilityCards": null
    }
}
```
Enjoy exploring and using Loyalty Blockchain API!
