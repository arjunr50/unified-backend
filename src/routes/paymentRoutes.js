// routes/paymentsRoutes.js - Clean controller pattern
const express = require("express");
const router = express.Router();
const paymentsController = require("../controllers/paymentsController");

// Payment endpoints
router.post("/createOrder", paymentsController.createOrder);
router.post("/verifyPayment", paymentsController.verifyPayment);
router.get(
  "/getPaymentByOrderId/:orderId",
  paymentsController.getPaymentByOrderId,
);
router.get("/getAllPayments", paymentsController.getAllPayments);

module.exports = router;
