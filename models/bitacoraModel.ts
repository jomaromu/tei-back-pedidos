import mongoose from "mongoose";

// Interface
import { BitacoraInterface } from "../interfaces/bitacora";

// crear esquema
const Schema = mongoose.Schema;

const Origenes = new Schema({
  tipo: { type: String },
  id: { type: Number },
  nombre: { type: String },
});

const BitacoraSchema = new Schema({
  usuario: { type: mongoose.Types.ObjectId, ref: "userWorker" },
  idPedido: { type: mongoose.Types.ObjectId, ref: "pedidos" },
  tipo: { type: String },
  fechaReg: { type: String },
  etapaPed: { type: Origenes },
  etapaPedQuery: { type: Origenes },
  estadoPed: { type: Origenes },
  estadoPedQuery: { type: Origenes },
});

export = mongoose.model<BitacoraInterface>("bitacora", BitacoraSchema);
