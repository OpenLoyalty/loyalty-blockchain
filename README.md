# Loyalty Blockchain API

Welcome to Loyalty Blockchain project by [Open Loyalty](https://openloyalty.io).
The API for managing Hyperledger Fabric network and smart contracts.
Written in Node.js and JavaScript, this API is purpose-built to provide an accessible
and user-friendly testing environment for enterprises aiming to explore the innovative landscape of
blockchain technology, particularly within the realm of Customer Loyalty programs.
The aim of the project is to provide easy to understand context about how blockchain solutions differ from regular ones.
Written purely in the most popular programming language - JavaScript it lets you onboard and understand the internals
without the need to understand all the blockchain space (Solidity, Ink, Signatures etc).

## Understanding the Revolution in Customer Loyalty Programs

Traditional customer loyalty programs often operate in silos, limiting customers to redeem their points
or benefits within the same entity they were earned. This not only limits customer choices but also
leads to a lower utilization of loyalty points, reducing the overall effectiveness of such programs.

Blockchain technology introduces a decentralized and transparent approach to managing loyalty programs.
By implementing a blockchain-based system, we allow for frictionless exchange of loyalty points
between parties within a single network. This means that customers can now earn points at one entity
and spend them at another, significantly enhancing the customer experience.

The transparency of blockchain also increases trust between parties, as all transactions are traceable
and immutable. This reduces the risk of fraud and makes reconciliation processes more straightforward,
saving businesses time and money.

The advantage of proprietary solution like HyperLedger Fabric over open source Ethereum is that you can
exactly manage which parties within the network you trust and want to share the data with, with whom you
only want to transact with and who you do not trust at all and do not want to collaborate with.

## Features

- **Userbase Management:** The API allows for the creation and management of users within the Fabric
network. This feature is foundational for any loyalty program, providing the ability to monitor and
manage the activities of users within the network effectively.

- **Smart Contract Transaction Submission:** Our API facilitates the submission of transactions to
various smart contracts. This capability enables the automated management of loyalty points and
other types of assets, increasing the efficiency and accuracy of transactions.

- **Asset Management:** The API extends beyond the management of loyalty points. It provides a diverse
range of assets for different use cases, including vouchers, gift cards, prepaid cards, and utility
tokens. This wide range of assets provides users with more choices and enhances their overall
experience.

- **Network Management:** With our API, managing a Fabric network has never been easier. It provides
user-friendly management tools that simplify the process of interacting with the Hyperledger Fabric
network, reducing the complexity and enhancing the effectiveness of network management.

- **Managed Security Levels for Transaction Submission:** The API provides three levels of security for
transaction submission:

  1. **Admin-Submitted Transactions:** Admins can submit transactions on behalf of users, ensuring
     the accuracy and integrity of these transactions.

  2. **User-Submitted Transactions with Managed Keys:** Users can submit transactions with keys managed
     by the service, striking a balance between user autonomy and system security.

  3. **User-Submitted Transactions with Self Sovereign Key Management:** For maximum security, users
     can manage their keys, submitting transactions independently. (Please note, this feature is still
     in the works and will be available soon.)

## Quick Start
The `init.sh` script aids in setting up the development environment. Here's what it does:

- Checks for the [Fablo](https://github.com/hyperledger-labs/fablo) executable. If not found, it's downloaded.
- Clones the [Loyalty Blockchain contracts](https://github.com/OpenLoyalty/loyalty-blockchain-contracts) repository.
- Starts the Hyperledger Fabric Network using Fablo.
- Creates a network configuration file.
- Starts the Loyalty Blockchain API.
- Initializes the ledger.
- Runs SQL mapping scripts on the sql database.
- Cleanup

**Please, be patient, as the whole ecosystem spin-up at the first time might take anywhere between 10 and 30 minutes.**  
  
Once complete, your development environment is fully prepared. Execute `yarn docker:dev` to start exploring the Loyalty Blockchain API.

```bash
cp .env.example .env
nvm use 18.16
./scripts/init.sh
yarn docker:dev
```

In order to clean up and wipe out dev env completely, execute: 
```bash
./scripts/env-cleanup.sh
```

## Table of Contents
- [Commands](#commands)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contributions](#contributions)
- [License](#license)

## Commands

Docker:

```bash
# run docker container in development mode
yarn docker:dev
# run all tests in a docker container
yarn docker:test
```

Linting:

```bash
# run ESLint
yarn lint
# fix ESLint errors
yarn lint:fix
# run prettier
yarn prettier
# fix prettier errors
yarn prettier:fix
```

## Project Structure

```
docs\               # API documentation
scripts\            # env initialization scripts
 |--fablo\          # Fablo and API initialization scripts
 |--sql\            # sql initialization scripts
src\
 |--config\         # Environment variables and configuration related things
 |--controllers\    # Route controllers (controller layer)
 |--docs\           # Swagger files
 |--middlewares\    # Custom express middlewares
 |--prisma\         # SQL db models (data layer)
 |--routes\         # Routes
 |--services\       # Business logic (service layer)
 |--utils\          # Utility classes and functions
 |--validations\    # Request data validation schemas
 |--app.js          # Express app
 |--index.js        # App entry point
 |--init.js         # Network initialization section
tests\              # test directory
```

## API Documentation

!!!! WORK STILL IN PROGRESS !!!!
- Example use case and API description is available [here](./docs/postman/README.md)  
- The documentation in OpenAPI format [here](./docs/openapi)  
- Postman collection and environment files [here](./docs/postman)  

## Contributions

We appreciate and welcome contributions to this project, be it in the form of feature requests, issues,
or pull requests. Please see our [contributing guidelines](./CONTRIBUTING.md) for more information.

## License

This project is licensed under the Apache 2.0 license - see the [LICENSE](./LICENSE) file for details.

