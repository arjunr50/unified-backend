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
      receipt: userId && userId !== "null" && userId !== "" && userId !== null
        ? `user_${userId}_app_${applicationId}_${Date.now()}`
        : `app_${applicationId}_${Date.now()}`,
      notes: { 
        userId,
        bookingId,
        applicationId,
        name,
        email,
        contact 
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
        coffeeMessage: coffeeMessage || null
      }
    });

    res.status(201).json({
      success: true,
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
      message: "Failed to create order",
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
        message: "Invalid payment signature",
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
        { new: true }
      ),
    ]);

    if (
      captureResult.status === "rejected" ||
      updateResult.status === "rejected"
    ) {
      return res.status(500).json({
        success: false,
        message: "Payment capture failed",
      });
    }

    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      message: "Payment verified and captured successfully",
      data: { payment_id, order_id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
