import mongoose from 'mongoose';
import pkg from 'mongoose-sequence';
const AutoIncrement = pkg(mongoose);

const serviceSchema = new mongoose.Schema({
  _id: {
    type: Number,
  },
  vehicleId: { type: Number, ref: 'Vehicle' },
  serviceDate: { type: Date, default: Date.now },
  serviceType: String,
  description: String,
  cost: Number,
  nextServiceDue: Date,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  _id: false // Disable default ObjectId
});

// Auto-increment _id field
serviceSchema.plugin(AutoIncrement, {
  id: 'service_id_counter',
  inc_field: '_id'
});

export default mongoose.model('Service', serviceSchema);
