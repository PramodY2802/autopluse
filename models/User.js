import mongoose from 'mongoose';
import pkg from 'mongoose-sequence';
const AutoIncrement = pkg(mongoose);

const userSchema = new mongoose.Schema(
  {
    _id: { type: Number },
    
    name: {
      type: String,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: false // make it optional for Google users
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true // only Google users will have this
    },

    avatar: String,

    otp: String,
    otpExpires: Date
  },
  {
    _id: false,
    timestamps: true
  }
);

userSchema.plugin(AutoIncrement, {
  id: 'user_id_counter',
  inc_field: '_id'
});

export default mongoose.model('User', userSchema);
