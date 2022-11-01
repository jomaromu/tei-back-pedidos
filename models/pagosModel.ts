import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

// Interface
import { PagosInterface } from "../interfaces/pagosInterface";

// crear esquema
const Schema = mongoose.Schema;

const pagosSchema = new Schema({
  pedido: { type: Schema.Types.ObjectId, ref: "pedidos" },
  creador: { type: Schema.Types.ObjectId, ref: "userWorker" },
  fecha: { type: String },
  motivo: { type: String },
  modalidad: { type: Schema.Types.ObjectId, ref: "modalidadPago" },
  metodo: { type: Schema.Types.ObjectId, ref: "metodoPago" },
  monto: { type: Number, default: 0 },
  estado: { type: Boolean, default: true },
});

// validacion para único elemento
pagosSchema.plugin(uniqueValidator, { message: "{PATH}, ya existe!!" });

export = mongoose.model<PagosInterface>("pagos", pagosSchema);
