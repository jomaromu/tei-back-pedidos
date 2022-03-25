import { ClientModelInterface } from "./client";
import { ProductModelInterface } from './product';
import { WorkerModelInterface } from "./worker";
import { PagoInterface } from './pago';

import { SucursalModel } from "./sucursal";
import { OrigenPedidoInterface } from "./origenPedido";

export interface PedidoModelInterface {
    _id: string;
    idReferencia: string;
    idCreador: string;
    fecha_alta: string;
    fecha_entrega: string;
    cliente: ClientModelInterface;
    archivos: Array<ArchivosInterface>;
    etapa_pedido: number;
    prioridad_pedido: number;
    sucursal: SucursalModel;
    asignado_a: WorkerModelInterface;
    origen_pedido: OrigenPedidoInterface;
    productos_pedidos: Array<ProductoPedidoInterface>;
    pagos_pedido: Array<PagoInterface>;
    estado_pedido: string;
    estado: boolean;
    itbms: boolean;
    monto_itbms: number;
    subTotal: number;
    total: number;
}

export interface ArchivosInterface {

    _id: string;
    idReferencia: string; // ID directo
    idCreador: string;
    nombre_archivo: string;
    ruta_archivo: string;
    fecha: string;
    tipo: string;
    pedido: string;
    estado: boolean;
}

export interface EtapaPedidoInterface {
    _id: string;
    idCreador: string;
    nombre: string;
    nivel: number;
    estado: boolean;
}

export interface PrioridadPedidoInterface {
    _id: string;
    idCreador: string;
    nombre: string;
    color_prioridad: string;
    nivel: number;
    importancia: number;
    estado: boolean;
}

export interface ProductoPedidoInterface {

    _id: string;
    cantidad: number;
    precio: number;
    total: number;
    producto: ProductModelInterface;
    seguimiento_disenio: string;
    seguimiento_produccion: string;
    inhabilitado: boolean;
    estado: boolean;
}

export interface ActualizarMontosPedido {

    subtotal: number;
    monto_itbms: number;
    total: number;

}