import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

// Interface
import { PrioridadModelInterface } from "../interfaces/prioridad";

// crear esquema
const Schema = mongoose.Schema;

const prioridadSchema = new Schema({
  idCreador: { type: Schema.Types.ObjectId, ref: "userWorker" },
  nombre: {
    type: String,
    required: [true, "Debe ingresar un nombre"],
    unique: true,
  },
  estado: { type: Boolean, default: true },
});

// validacion para único elemento
prioridadSchema.plugin(uniqueValidator, { message: "{PATH}, ya existe!!" });

export = mongoose.model<PrioridadModelInterface>("prioridad", prioridadSchema);
