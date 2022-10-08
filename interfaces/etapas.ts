export interface EtapaModelInterface {
  _id: string;
  idCreador: string;
  nombre: string;
  estado: boolean;
}

export interface EtapasOrdenadasInterface {
  _id: string;
  colEtapas: string;
  etapas: Array<EtapaModelInterface>;
}
