import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Parking } from '../../services/parking';
import { Vehicle } from '../../models/vehicle.model';

@Component({
  selector: 'app-checkout-modal',
  imports: [CommonModule],
  templateUrl: './checkout-modal.html',
  styleUrl: './checkout-modal.scss',
})
export class CheckoutModal implements OnInit {
  @Input() vehicle!: Vehicle;
  @Output() close = new EventEmitter<void>();
  @Output() checkout = new EventEmitter<void>();

  valorTotal = 0;
  tempoTotal = '';
  horasCobranca = 0;

  constructor(private parkingService: Parking) {}

  ngOnInit(): void {
    this.calcularValor();
  }

  calcularValor(): void {
    this.valorTotal = this.parkingService.calcularValor(this.vehicle);
    this.tempoTotal = this.getTempoEstacionado();
    this.horasCobranca = this.getHorasCobranca();
  }

  getTempoEstacionado(): string {
    const entrada = new Date(this.vehicle.dataEntrada);
    const agora = new Date();
    const diff = agora.getTime() - entrada.getTime();

    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (horas === 0) {
      return `${minutos} minuto${minutos !== 1 ? 's' : ''}`;
    }
    return `${horas} hora${horas !== 1 ? 's' : ''} e ${minutos} minuto${minutos !== 1 ? 's' : ''}`;
  }

  getHorasCobranca(): number {
    const entrada = new Date(this.vehicle.dataEntrada);
    const agora = new Date();
    const diff = agora.getTime() - entrada.getTime();
    const horas = diff / (1000 * 60 * 60);
    return Math.ceil(horas);
  }

  confirmarRetirada(): void {
    this.parkingService.checkoutVehicle(this.vehicle.id).subscribe({
      next: (vehicle) => {
        this.checkout.emit();
      },
      error: (error) => {
        console.error('Erro ao processar retirada:', error);
        alert('Erro ao processar retirada. Tente novamente.');
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
