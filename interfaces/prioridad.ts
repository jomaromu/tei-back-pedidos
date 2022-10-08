export interface PrioridadModelInterface {
  _id: string;
  idCreador: string;
  nombre: string;
  estado: boolean;
}

export interface PrioridadesOrdendasInterface {
  _id: string;
  colPrioridad: string;
  prioridades: Array<PrioridadModelInterface>;
}
