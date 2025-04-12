/**
 * @swagger
 * /dev/genAdminToken:
 *   post:
 *     summary: Generate a temporary admin token
 *     tags:
 *       - Developer
 *     responses:
 *       201:
 *         description: Successfully generated admin token
 *       400:
 *         description: Missing parameters
 *       403:
 *         description: Invalid developer authorization token
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /dev/checkToken:
 *   post:
 *     summary: Verify a token
 *     tags:
 *       - Developer
 *     responses:
 *       200:
 *         description: Token successfully verified
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/user/auth:
 *   post:
 *     summary: Authenticate a user
 *     tags:
 *       - User
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         description: User's token
 *         schema:
 *           type: string
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token for authentication
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *       400:
 *         description: Missing parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - User
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         description: User's name
 *         schema:
 *           type: string
 *       - in: query
 *         name: mail
 *         required: true
 *         description: User's email
 *         schema:
 *           type: string
 *       - in: query
 *         name: password
 *         required: true
 *         description: User's password
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Successfully registered
 *       400:
 *         description: Missing parameters
 *       401:
 *         description: User already registered
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/user/generateJWT:
 *   post:
 *     summary: Generate a new JWT for a user
 *     tags:
 *       - User
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         description: User's current token
 *         schema:
 *           type: string
 *       - in: query
 *         name: password
 *         required: true
 *         description: User's password
 *         schema:
 *           type: string
 *       - in: query
 *         name: mail
 *         required: true
 *         description: User's email
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully generated JWT
 *       400:
 *         description: Missing parameters
 *       401:
 *         description: User not found or incorrect password
 *       403:
 *         description: Token error
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/user/regenToken:
 *   post:
 *     summary: Regenerate a user's token
 *     tags:
 *       - User
 *     parameters:
 *       - in: query
 *         name: password
 *         required: true
 *         description: User's password
 *         schema:
 *           type: string
 *       - in: query
 *         name: mail
 *         required: true
 *         description: User's email
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully regenerated token
 *       400:
 *         description: Missing parameters
 *       401:
 *         description: User not found or incorrect password
 *       403:
 *         description: Missing parameters
 *       500:
 *         description: Internal Server Error
 */
