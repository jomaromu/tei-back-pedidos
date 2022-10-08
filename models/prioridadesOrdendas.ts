import mongoose from "mongoose";
import { PrioridadesOrdendasInterface } from "../interfaces/prioridad";

// crear esquema
const Schema = mongoose.Schema;

const prioridadOrdenadaSchema = new Schema({
  colPrioridad: {
    type: String,
  },
  prioridades: { type: Array },
});

export = mongoose.model<PrioridadesOrdendasInterface>(
  "prioridadOrdenada",
  prioridadOrdenadaSchema
);
