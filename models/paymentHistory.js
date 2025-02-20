import mongoose from "mongoose";

// Define Schema
const paymentSchema = new mongoose.Schema({
  auth_id: {
    type: String,
    default: null
  },
  authorization: {
    type: String,
    default: null
  },
  bank_reference: String,
  cf_payment_id: String,
  entity: String,
  error_details: {
    type: String,
    default: null
  },
  is_captured: Boolean,
  order_amount: Number,
  order_id: String,
  payment_amount: Number,
  payment_completion_time: String,
  payment_currency: String,
  payment_gateway_details: {
    gateway_name: String,
    gateway_order_id: String,
    gateway_payment_id: String,
    gateway_order_reference_id: String,
    gateway_status_code: String,
    gateway_status_message: String
  },
  payment_group: String,
  payment_message: String,
  payment_method: {
    card: {
      card_brand: String,
      card_number: String,
      card_type: String,
    }
  },
  payment_offers: Array,
  payment_status: String,
  payment_time: String
});

// Create Model
const Payment = mongoose.model('Payment', paymentSchema);
export default Payment