const express = require('express');
const UserController = require('../../../controllers/v1/UserController');
const authenticateToken = require('../../../middleware/authenticateToken');
const authorizeRole = require('../../../middleware/authorizeRole');

const UserRouter = express.Router();

UserRouter.get("/profile", authenticateToken, UserController.profile);
UserRouter.get("/lookup", authenticateToken, authorizeRole("customer"), UserController.lookup);
UserRouter.post("/transfer", authenticateToken, authorizeRole("customer"), UserController.transfer);
UserRouter.post("/fund-account", authenticateToken, authorizeRole("admin"), UserController.fundAccount);
UserRouter.get("/customers", authenticateToken, authorizeRole("admin"), UserController.allCustomers);
UserRouter.get("/transfers/sent", authenticateToken, authorizeRole("customer"), UserController.sentTransfers);
UserRouter.get("/transfers/received", authenticateToken, authorizeRole("customer"), UserController.receivedTransfers);

module.exports = UserRouter;
