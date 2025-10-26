import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Vehicle } from '../models/vehicle.model';
import { environment } from '../../environments/environment';
import { Auth } from './auth';

interface VehicleResponse {
  success: boolean;
  vehicle?: Vehicle;
  vehicles?: Vehicle[];
  count?: number;
  message?: string;
}

interface CheckoutResponse {
  success: boolean;
  message: string;
  vehicle: Vehicle;
}

interface CalculateResponse {
  success: boolean;
  vehicle: Vehicle;
  valor_total: number;
}

@Injectable({
  providedIn: 'root'
})
export class Parking {
  private apiUrl = environment.apiUrl;
  private vehiclesSubject = new BehaviorSubject<Vehicle[]>([]);
  public vehicles$: Observable<Vehicle[]> = this.vehiclesSubject.asObservable();

  // Valor por hora em reais
  private readonly VALOR_POR_HORA = 5.00;
  private readonly VALOR_MINIMO = 5.00;

  constructor(
    private http: HttpClient,
    private auth: Auth
  ) {
    // Load vehicles on service initialization if authenticated
    if (this.auth.isAuthenticated()) {
      this.loadVehicles();
    }
  }

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  addVehicle(marca: string, modelo: string, placa: string): Observable<Vehicle> {
    return this.http.post<VehicleResponse>(`${this.apiUrl}/vehicles`, {
      marca,
      modelo,
      placa
    }, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        if (response.success && response.vehicle) {
          // Convert date strings to Date objects
          const vehicle = this.convertDates(response.vehicle);

          // Reload vehicles to update the list
          this.loadVehicles();

          return vehicle;
        }
        throw new Error('Failed to add vehicle');
      }),
      catchError(this.handleError)
    );
  }

  getEstacionados(): Observable<Vehicle[]> {
    return this.http.get<VehicleResponse>(`${this.apiUrl}/vehicles/estacionados`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        if (response.success && response.vehicles) {
          return response.vehicles.map(v => this.convertDates(v));
        }
        return [];
      }),
      tap(vehicles => this.vehiclesSubject.next(vehicles)),
      catchError(this.handleError)
    );
  }

  getVehicleById(id: string): Observable<Vehicle | undefined> {
    return this.http.get<VehicleResponse>(`${this.apiUrl}/vehicles/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        if (response.success && response.vehicle) {
          return this.convertDates(response.vehicle);
        }
        return undefined;
      }),
      catchError(this.handleError)
    );
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

  checkoutVehicle(id: string): Observable<Vehicle> {
    return this.http.put<CheckoutResponse>(`${this.apiUrl}/vehicles/${id}/checkout`, {}, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        if (response.success && response.vehicle) {
          const vehicle = this.convertDates(response.vehicle);

          // Reload vehicles to update the list
          this.loadVehicles();

          return vehicle;
        }
        throw new Error('Failed to checkout vehicle');
      }),
      catchError(this.handleError)
    );
  }

  private loadVehicles(): void {
    this.getEstacionados().subscribe({
      next: (vehicles) => {
        // Vehicles are already updated via tap() in getEstacionados
      },
      error: (error) => {
        console.error('Error loading vehicles:', error);
        this.vehiclesSubject.next([]);
      }
    });
  }

  private convertDates(vehicle: any): Vehicle {
    return {
      ...vehicle,
      dataEntrada: new Date(vehicle.data_entrada),
      dataSaida: vehicle.data_saida ? new Date(vehicle.data_saida) : undefined,
      valorTotal: vehicle.valor_total
    };
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocorreu um erro desconhecido';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.error || error.error?.message || `Erro ${error.status}: ${error.message}`;
    }

    console.error('Parking service error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Get all vehicles (not just parked)
  getAllVehicles(): Observable<Vehicle[]> {
    return this.http.get<VehicleResponse>(`${this.apiUrl}/vehicles`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        if (response.success && response.vehicles) {
          return response.vehicles.map(v => this.convertDates(v));
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }
}
