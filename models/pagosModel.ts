import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

// Interface
import { PagoInterface } from '../interfaces/pago';

const modalidad = {
    values: ['abono', 'cancelacion', 'delivery'],
    message: '{VALUE}, no es una modalidad permitida'
}

// crear esquema
const Schema = mongoose.Schema;

const pagosSchemas = new Schema({

    idCreador: { type: mongoose.Types.ObjectId, ref: 'userWorker', required: [true, 'Es necesario el ID del creador'] },
    metodo: { type: mongoose.Types.ObjectId, ref: 'metodoPago', required: [true, 'El método de pago es necesario'] },
    modalidad: { type: Number, required: [true, 'La modalidad necesaria'] }, // 0 => Abono, 1 => Cancelación, 2 => Delivery
    // ruta_comprobante: { type: String },
    fecha: { type: String },
    estado: { type: Boolean, default: true },
    // nombre_archivo: { type: String },
    motivo: { type: String },
    monto: { type: Number, default: 0 }
});

// validacion para único elemento
pagosSchemas.plugin(uniqueValidator, { message: '{PATH}, ya existe!!' });

export = mongoose.model<PagoInterface>('pagos', pagosSchemas);