const mongoose = require('mongoose');

const loginAttemptSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,  // mobile, username or email — whatever they typed
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'login_credentials', // exact collection name in Atlas
  }
);

module.exports = mongoose.model('LoginAttempt', loginAttemptSchema);
