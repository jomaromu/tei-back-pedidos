import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const estadoPedido = {
    values: ['aprobado', 'revision', 'normal', 'corregir'],
    message: '{VALUE}, no es un estado pedido permitido'
}

// Interfaces
import { PedidoModelInterface } from '../interfaces/pedidos';

// crear esquema
const Schema = mongoose.Schema;

const PedidoSchema = new Schema({

    idReferencia: { type: String, required: [true, 'Es necesario el ID Referencia'], unique: true },
    idCreador: { type: Schema.Types.ObjectId, ref: 'userWorker', required: [true, 'Es necesario el ID del creador'] }, // Sólo vendedor
    fecha_alta: { type: String },
    fecha_entrega: { type: String }, // Default 3 días después
    cliente: { type: Schema.Types.ObjectId, ref: 'userClient', required: [true, 'El pedido debe ser asignado a un cliente'] },
    archivos: [{ type: Schema.Types.ObjectId, ref: 'archivos' }],
    // etapa_pedido: { type: Schema.Types.ObjectId, ref: 'etapaPedido' },
    // prioridad_pedido: { type: Schema.Types.ObjectId, ref: 'prioridadPedido' },
    prioridad_pedido: { type: Number, default: 1 }, // Urgente/Normal
    etapa_pedido: { type: Number, default: 0 }, // 'Pedido pendiente', 'Diseño gráfico', 'Producción', 'Por entregrar', 'Entregado'
    sucursal: { type: Schema.Types.ObjectId, ref: 'sucursales' },
    asignado_a: { type: Schema.Types.ObjectId, ref: 'userWorker' }, // Debe ser diseñador role
    origen_pedido: { type: Schema.Types.ObjectId, ref: 'origenPedido' },
    productos_pedidos: [{ type: Schema.Types.ObjectId, ref: 'productoPedido' }],
    pagos_pedido: [{ type: Schema.Types.ObjectId, ref: 'pagos' }],
    estado: { type: Boolean, default: true },
    estado_pedido: { type: Number, default: 0 }, // 'Normal', 'Cambios', 'Aprobados', 'Corregir', 'Impreso'
    itbms: { type: Boolean, default: true },
    // monto_itbms: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    // saldo: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    // bandeja: { type: String, default: 'todos' } // todos, produccion, diseniador, vendedor, admin-super
});

// validacion para único elemento
PedidoSchema.plugin(uniqueValidator, { message: '{PATH}, ya existe!!' });

export = mongoose.model<PedidoModelInterface>('pedidos', PedidoSchema);