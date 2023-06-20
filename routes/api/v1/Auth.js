const express = require('express');
const AuthController = require('../../../controllers/v1/AuthController');

const AuthRouter = express.Router();

AuthRouter.post("/signup", AuthController.signUp);
AuthRouter.post("/login", AuthController.login);
AuthRouter.post('/refresh-token', AuthController.refreshToken);


module.exports = AuthRouter;
