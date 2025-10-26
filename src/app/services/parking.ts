import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Vehicle } from '../models/vehicle.model';

@Injectable({
  providedIn: 'root'
})
export class Parking {
  private vehicles: Vehicle[] = [];
  private vehiclesSubject = new BehaviorSubject<Vehicle[]>([]);
  public vehicles$: Observable<Vehicle[]> = this.vehiclesSubject.asObservable();

  // Valor por hora em reais
  private readonly VALOR_POR_HORA = 5.00;
  private readonly VALOR_MINIMO = 5.00;

  constructor() {
    this.loadVehicles();
  }

  addVehicle(marca: string, modelo: string, placa: string): void {
    const vehicle: Vehicle = {
      id: this.generateId(),
      marca,
      modelo,
      placa: placa.toUpperCase(),
      dataEntrada: new Date(),
      status: 'estacionado'
    };

    this.vehicles.push(vehicle);
    this.saveVehicles();
  }

  getEstacionados(): Vehicle[] {
    return this.vehicles.filter(v => v.status === 'estacionado');
  }

  getVehicleById(id: string): Vehicle | undefined {
    return this.vehicles.find(v => v.id === id);
  }

  calcularValor(vehicle: Vehicle): number {
    const dataEntrada = new Date(vehicle.dataEntrada);
    const dataSaida = new Date();

    // Calcula a diferença em milissegundos
    const diferencaMs = dataSaida.getTime() - dataEntrada.getTime();

    // Converte para horas
    const horas = diferencaMs / (1000 * 60 * 60);

    // Arredonda para cima (cobrança por hora iniciada)
    const horasCobranca = Math.ceil(horas);

    // Calcula o valor total
    const valor = horasCobranca * this.VALOR_POR_HORA;

    // Retorna o valor mínimo se for menor
    return Math.max(valor, this.VALOR_MINIMO);
  }

  checkoutVehicle(id: string): Vehicle | null {
    const vehicle = this.getVehicleById(id);
    if (!vehicle || vehicle.status === 'retirado') {
      return null;
    }

    vehicle.dataSaida = new Date();
    vehicle.valorTotal = this.calcularValor(vehicle);
    vehicle.status = 'retirado';

    this.saveVehicles();
    return vehicle;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private loadVehicles(): void {
    const stored = localStorage.getItem('vehicles');
    if (stored) {
      this.vehicles = JSON.parse(stored);
      // Converte strings de data para objetos Date
      this.vehicles.forEach(v => {
        v.dataEntrada = new Date(v.dataEntrada);
        if (v.dataSaida) {
          v.dataSaida = new Date(v.dataSaida);
        }
      });
    }
    this.vehiclesSubject.next(this.vehicles);
  }

  private saveVehicles(): void {
    localStorage.setItem('vehicles', JSON.stringify(this.vehicles));
    this.vehiclesSubject.next(this.vehicles);
  }
}
