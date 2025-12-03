import { Schema, model, models, Document } from "mongoose";

interface ICurrency extends Document {
  name: string;
  rate: number;
}

const currencySchema = new Schema<ICurrency>(
  {
    name: { type: String, required: true },
    rate: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const Currency =
  models.currency || model<ICurrency>("currency", currencySchema);
export default Currency;
