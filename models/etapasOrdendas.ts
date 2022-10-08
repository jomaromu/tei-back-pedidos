import mongoose from "mongoose";
import { EtapasOrdenadasInterface } from "../interfaces/etapas";

// crear esquema
const Schema = mongoose.Schema;

const etapasOrdenadaSchema = new Schema({
  colEtapas: {
    type: String,
  },
  etapas: { type: Array },
});

export = mongoose.model<EtapasOrdenadasInterface>(
  "etapasOrdenadas",
  etapasOrdenadaSchema
);
