import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

// Interface
import { SucursalModel } from "../interfaces/sucursal";
import {} from "../";

// crear esquema
const Schema = mongoose.Schema;

const Provincia = new Schema({
  id: { type: String },
  name: { type: String },
});

const sucursalSchema = new Schema({
  idCreador: { type: Schema.Types.ObjectId, ref: "userWorker" },
  nombre: { type: String },
  direccion: { type: String },
  telefono: { type: String },
  provincia: { type: Provincia },
  fecha_creacion: { type: String },
  estado: { type: Boolean, default: true },
});

// validacion para único elemento
sucursalSchema.plugin(uniqueValidator, { message: "El {PATH}, ya existe!!" });

export = mongoose.model<SucursalModel>("sucursales", sucursalSchema);
