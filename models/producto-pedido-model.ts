import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

// Interface
import { ProductoPedidoInterface } from "../interfaces/producto-pedido";

// crear esquema
const Schema = mongoose.Schema;

const productosPedidosSchema = new Schema({
  producto: { type: Schema.Types.ObjectId, ref: "products" },
  pedido: { type: Schema.Types.ObjectId, ref: "pedidos" },
  cantidad: { type: Number, default: 1 },
  precio: { type: Number, default: 0.0 },
  seg_disenio: { type: String },
  seg_prod: { type: String },
  itbms: { type: Boolean, default: false },
  total: { type: Number, default: 0 },
});

// validacion para único elemento
productosPedidosSchema.plugin(uniqueValidator, {
  message: "{PATH}, ya existe!!",
});

export = mongoose.model<ProductoPedidoInterface>(
  "productos-pedidos",
  productosPedidosSchema
);
