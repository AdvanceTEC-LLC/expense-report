const mongoose = require("mongoose");
const attachmentSchema = require("../models/attachment");

const expenseSchema = new mongoose.Schema({
  date: String,
  costCategory: String,
  costCode: String,
  cost: Number,
  description: String,
  mileage: Number,
  purpose: String,
  fromLocation: String,
  toLocation: String,
  roundTrip: Boolean,
  breakfast: Boolean,
  lunch: Boolean,
  dinner: Boolean,
  attachments: [attachmentSchema], // Use attachmentSchema for attachments
});

expenseSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    //delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = expenseSchema;