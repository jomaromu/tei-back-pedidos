export interface PagosInterface {
  _id: string;
  pedido: string;
  creador: string;
  fecha: string;
  motivo: string;
  modalidad: string;
  metodo: string;
  monto: number;
  estado: boolean;
}
