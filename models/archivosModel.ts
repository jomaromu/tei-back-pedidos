import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

// Interface
import { ArchivosInterface } from '../interfaces/pedidos';

const tipos = {
    values: ['original', 'aprobado', 'proceso'], // referencia, aprobado, impreso
    message: '{VALUE}, no es un tipo permitido'
}

// crear esquema
const Schema = mongoose.Schema;

const archivoSchema = new Schema({

    idReferencia: { type: String, required: [true, 'Es necesario el ID Referencia'], unique: true }, // ID Directo
    idCreador: { type: Schema.Types.ObjectId, ref: 'userWorker', required: [true, 'Es necesario el ID del creador'] },
    nombre_archivo: { type: String, default: 'archivo' },
    pedido: { type: Schema.Types.ObjectId, ref: 'pedidos' },
    fecha: { type: String },
    tipo: { type: Number, default: 0 }, // Normal, Corregir, Aprobados
    estado: { type: Boolean, default: true }
});

// validacion para único elemento
archivoSchema.plugin(uniqueValidator, { message: '{PATH}, ya existe!!' });

export = mongoose.model<ArchivosInterface>('archivos', archivoSchema); 