import { Schema, Document, models, model } from "mongoose";
import { CART } from "../types/types";

interface IOrder extends Document {
  userId: string;
  products: CART[];
  shippingCost: number;
  total: number;
  paymentMethod: string;
  selectedCurrency: string;
  valueCurrency: number;
  shippingInfo: IShippingInfo;
  status: string;
}

interface IShippingInfo {
  address: string;
  city: string;
  postalCode: string;
  country: string;
  delivery: string;
  message: string;
  phone: string;
  firstname: string;
  lastname: string;
  email: string;
}

const orderSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    products: {
      type: [Schema.Types.Mixed],
      required: true,
    },
    shippingCost: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    selectedCurrency: {
      type: String,
      required: true,
      default: "FCFA",
    },
    valueCurrency: {
      type: Number,
      required: true,
    },
    shippingInfo: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      delivery: {
        type: String,
        required: true,
      },
      message: {
        type: String,
        required: false,
      },
      phone: {
        type: String,
        required: true,
      },
      firstname: {
        type: String,
        required: true,
      },
      lastname: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      zip: {
        type: String,
        required: true,
      },
    },

    status: {
      type: String,
      required: true,
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const OrderModel = models.order || model<IOrder>("order", orderSchema);
export default OrderModel;