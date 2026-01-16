const mongoose = require("mongoose");

const paymentsSchema = new mongoose.Schema({
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true,
  },
  paymentId: String,
  amount: Number,
  currency: {
    type: String,
    default: "INR",
  },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "paid", "failed", "cancelled"],
  },
  userId: String,
  bookingId: String,
  applicationId: String,
  checkoutDetails: {
    name: String,
    description: String,
    contact: String,
    email: String,
    coffeeMessage: String,
  },
  signature: String,
  notes: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for fast queries
paymentsSchema.index({ userId: 1 });
paymentsSchema.index({ bookingId: 1 });
paymentsSchema.index({ razorpayOrderId: 1 });
paymentsSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("payments", paymentsSchema);
