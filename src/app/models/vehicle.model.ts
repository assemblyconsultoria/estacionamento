export interface Vehicle {
  id: string;
  marca: string;
  modelo: string;
  placa: string;
  dataEntrada: Date;
  dataSaida?: Date;
  valorTotal?: number;
  status: 'estacionado' | 'retirado';
}
