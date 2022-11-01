import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

// Interface
import { HistorialInterface } from "../interfaces/historial";

// crear esquema
const Schema = mongoose.Schema;

const historialSchema = new Schema({
  priorOrg: { type: Schema.Types.ObjectId, ref: "prioridad" },
  etapaOrg: { type: Schema.Types.ObjectId, ref: "etapas" },
  estadoOrg: { type: Schema.Types.ObjectId, ref: "colores" },
  vendedorOrg: { type: Schema.Types.ObjectId, ref: "userWorker" },
  diseniadorOrg: { type: Schema.Types.ObjectId, ref: "userWorker" },
  priorAct: { type: Schema.Types.ObjectId, ref: "prioridad" },
  etapaAct: { type: Schema.Types.ObjectId, ref: "etapas" },
  estadoAct: { type: Schema.Types.ObjectId, ref: "colores" },
  vendedorAct: { type: Schema.Types.ObjectId, ref: "userWorker" },
  diseniadorAct: { type: Schema.Types.ObjectId, ref: "userWorker" },
  idPedido: { type: Schema.Types.ObjectId, ref: "pedidos" },
  usuario: { type: Schema.Types.ObjectId, ref: "userWorker" },
  foranea: { type: Schema.Types.ObjectId, ref: "userWorker" },
  fecha: { type: String },
});

// validacion para único elemento
historialSchema.plugin(uniqueValidator, { message: "El {PATH}, ya existe!!" });

export = mongoose.model("historiales", historialSchema);
