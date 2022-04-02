export interface BitacoraInterface {
  _id?: string;
  usuario: any;
  idPedido: any;
  tipo: string;
  fechaReg?: string;
  etapaPed?: {
    tipo: string;
    id: number;
    nombre: string;
  };
  etapaPedQuery?: {
    tipo: string;
    id: number;
    nombre: string;
  };
  estadoPed?: {
    tipo: string;
    id: number;
    nombre: string;
  };
  estadoPedQuery?: {
    tipo: string;
    id: number;
    nombre: string;
  };
}

/* {
  tipo: 'original',
  etapaPed: 0,
  etapaPedQuery: 1
} */
