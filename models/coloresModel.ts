import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

// Interface
import { Colores } from "../interfaces/colores";

// crear esquema
const Schema = mongoose.Schema;

const coloresSchema = new Schema({
  idCreador: { type: Schema.Types.ObjectId, ref: "userWorker" },
  nombre: {
    type: String,
    required: [true, "Debe ingresar un nombre"],
    unique: true,
  },
  color: {
    type: String,
    required: [true, "Debe ingresar un color"],
    unique: true,
  },
  estado: { type: Boolean, default: true },
});

// validacion para único elemento
coloresSchema.plugin(uniqueValidator, { message: "{PATH}, ya existe!!" });

export = mongoose.model<Colores>("colores", coloresSchema);
