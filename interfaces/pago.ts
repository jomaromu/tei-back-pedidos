import { ProductoPedidoInterface } from "./pedidos";

export interface PagoInterface {

    _id: string;
    idCreador: string;
    metodo: string;
    monto: number;
    modalidad: string;
    nombre_archivo: string;
    fecha: string;
    estado: boolean;
}