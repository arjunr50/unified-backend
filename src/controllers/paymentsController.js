const payments = require("../models/payments");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpayInstance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const {
      amount,
      currency = "INR",
      name,
      description,
      contact,
      email,
      userId,
      bookingId,
      applicationId,
      coffeeMessage,
    } = req.body;

    const order = await razorpayInstance.orders.create({
      amount: amount * 100,
      currency,
      receipt:
        userId && userId !== "null" && userId !== "" && userId !== null
          ? `user_${userId}_app_${applicationId}_${Date.now()}`
          : `app_${applicationId}_${Date.now()}`,
      notes: {
        userId,
        bookingId,
        applicationId,
        name,
        email,
        contact,
      },
    });

    // Save to payments collection
    await payments.create({
      razorpayOrderId: order.id,
      amount: order.amount,
      currency,
      status: "pending", //Changed from "created"
      userId: userId || null,
      bookingId: bookingId || null,
      applicationId: applicationId || null,
      checkoutDetails: {
        name,
        description,
        contact: contact || null,
        email: email || null,
        coffeeMessage: coffeeMessage || null,
      },
    });

    res.status(201).json({
      success: true,
      description: "Order created successfully",
      timestamp: new Date().toISOString(),
      data: {
        order_id: order.id,
        amount: order.amount,
        currency,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      description: "Failed to create order",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { order_id, payment_id, signature, amount } = req.body; // ✅ Removed unused portfolioId

    // Verify signature first
    const shasum = crypto.createHmac("sha256", process.env.KEY_SECRET);
    shasum.update(order_id + "|" + payment_id);

    if (shasum.digest("hex") !== signature) {
      return res.status(400).json({
        success: false,
        description: "Invalid payment signature",
      });
    }

    // Capture payment & update DB
    const [captureResult, updateResult] = await Promise.allSettled([
      razorpayInstance.payments.capture(payment_id, { amount: amount * 100 }),
      payments.findOneAndUpdate(
        { razorpayOrderId: order_id },
        {
          status: "paid",
          paymentId: payment_id,
          signature,
          updatedAt: new Date(),
        },
        { new: true },
      ),
    ]);

    if (
      captureResult.status === "rejected" ||
      updateResult.status === "rejected"
    ) {
      return res.status(500).json({
        success: false,
        description: "Payment capture failed",
      });
    }

    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      description: "Payment verified and captured successfully",
      data: { payment_id, order_id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      description: "Payment verification failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get all payments (admin)
exports.getAllPayments = async (req, res) => {
  try {
    const allPayments = await payments.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      description: `Retrieved ${allPayments.length} payment(s)`,
      timestamp: new Date().toISOString(),
      count: allPayments.length,
      data: allPayments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      description: "Failed to retrieve payments",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
// Get payment by order ID
exports.getPaymentByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const paymentRecord = await payments.findOne({ razorpayOrderId: orderId });
    if (!paymentRecord) {
      return res.status(404).json({
        success: false,
        description: "Payment record not found",
      });
    }
    res.status(200).json({
      success: true,
      description: "Payment record retrieved successfully",
      timestamp: new Date().toISOString(),
      data: paymentRecord,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      description: "Failed to retrieve payment record",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
