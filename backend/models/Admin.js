
const mongoose = require('mongoose');
// Define the Admin schema
const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'admin' }
  });
  
  module.exports = mongoose.model('Admin', adminSchema);