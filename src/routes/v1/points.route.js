const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { pointsValidation } = require('../../validations');
const { pointsController } = require('../../controllers');

const router = express.Router();

router.route('/balance').get(auth(), validate(pointsValidation.balance), pointsController.getBalance);
router.route('/history').get(auth(), validate(pointsValidation.history), pointsController.getHistory);
router.route('/spend').post(auth(), validate(pointsValidation.spend), pointsController.spendPoints);
router.route('/transfer').post(auth(), validate(pointsValidation.transfer), pointsController.transferPoints);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: HyperLedger
 *   description: Interaction with blockchain
 */

/**
 * @swagger
 * /admin/wallets:
 *   post:
 *     summary: Create new wallet
 *     description: Only admins can create wallets.
 *     tags: [HyperLedger]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - organization
 *               - walletId
 *             properties:
 *               username:
 *                 type: string
 *               organization:
 *                 type: string
 *               walletId:
 *                 type: string
 *                 format: uuid
 *                 description: must be unique
 *             example:
 *               username: fakename
 *               organization: Org1
 *               walletId: 41fe8594-996a-49bf-acb8-f1ebfefa236b
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Wallet'
 *       "400":
 *         $ref: '#/components/responses/DuplicateWalletId'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all wallets
 *     description: Only admins can retrieve all wallets.
 *     tags: [HyperLedger]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         description: Username
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of wallets
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Wallet'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /admin/wallet/{walletId}:
 *   get:
 *     summary: Get wallet
 *     description: Logged in users can fetch only their own wallet information. Only admins can fetch other wallets.
 *     tags: [HyperLedger]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: walletId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: walletId
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Wallet'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 */

/**
 * @swagger
 * /admin/wallet/{walletId}/points:
 *   get:
 *     summary: Get wallet balance
 *     description: Get user balance
 *     tags: [HyperLedger]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: walletId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: walletId
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Wallet'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 */

/**
 * @swagger
 * /admin/addPoints:
 *   post:
 *     summary: Add points to the wallet
 *     description: Only admins can add points.
 *     tags: [HyperLedger]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - organization
 *               - walletId
 *               - amount
 *               - enforcementDate
 *               - expirationDate
 *             properties:
 *               username:
 *                 type: string
 *               organization:
 *                 type: string
 *               walletId:
 *                 type: string
 *                 format: uuid
 *                 description: wallet must exist beforehand
 *               amount:
 *                 type: number
 *                 format: integer
 *                 description: Only positive integers
 *               enforcementDate:
 *                 type: string
 *                 format: date
 *                 description: Must be future date
 *               expirationDate:
 *                 type: string
 *                 format: date
 *                 description: Must be greater then enforcementDate
 *             example:
 *               username: fakename
 *               organization: Org1
 *               walletId: 41fe8594-996a-49bf-acb8-f1ebfefa236b
 *               amount: 123
 *               enforcementDate: 2021-11-22 11:10
 *               expirationDate: 2021-11-30 11:10
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/AddPoints'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /admin/spendPoints:
 *   post:
 *     summary: Spend points from wallet
 *     tags: [HyperLedger]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletId
 *               - organization
 *               - amount
 *             properties:
 *               walletId:
 *                 type: string
 *                 format: uuid
 *                 description: spending wallet id
 *               organization:
 *                 type: string
 *               amount:
 *                 type: number
 *                 format: integer
 *                 description: Only positive integers
 *             example:
 *               walletId: 7e0fd7ba-819e-494c-bbf4-ebef631a7013
 *               organization: Org1
 *               amount: 12
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/SpendPoints'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /admin/transferPoints:
 *   post:
 *     summary: Send points from one user to another
 *     tags: [HyperLedger]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sender
 *               - receiver
 *               - amount
 *             properties:
 *               sender:
 *                 type: object
 *                 properties:
 *                   walletId:
 *                     type: string
 *                     format: uuid
 *                     description: spending wallet id
 *                   organization:
 *                     type: string
 *                   username:
 *                     type: string
 *               receiver:
 *                 type: object
 *                 properties:
 *                   walletId:
 *                     type: string
 *                     format: uuid
 *                     description: spending wallet id
 *                   organization:
 *                     type: string
 *                   username:
 *                     type: string
 *               amount:
 *                 type: number
 *                 format: integer
 *                 description: Only positive integers
 *             example:
 *               sender:
 *                 walletId: 7e0fd7ba-819e-494c-bbf4-ebef631a7013
 *                 organization: Org1
 *                 username: Bob
 *               receiver:
 *                 walletId: 7e0fd7ba-819e-494c-bbf4-ebef631a7013
 *                 organization: Org1
 *                 username: Bob
 *               amount: 12
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/TransferPoints'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
