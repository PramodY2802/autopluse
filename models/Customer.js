import mongoose from 'mongoose';
import pkg from 'mongoose-sequence';
const AutoIncrement = pkg(mongoose);

const customerSchema = new mongoose.Schema({
  _id: {
    type: Number,
  },
   userId: {
    type: Number,   // ✅ match with User._id
    ref: 'User'
  }, // Reference to User model
  name: String,
  email: { type: String, unique: true },
  phone: String,
  address: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  _id: false // disable default ObjectId
});

// Apply auto-increment to `_id` field
customerSchema.plugin(AutoIncrement, {
  id: 'customer_id_counter',
  inc_field: '_id'
});

export default mongoose.model('Customer', customerSchema);
