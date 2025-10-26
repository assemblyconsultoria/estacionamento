import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Parking } from '../../services/parking';

@Component({
  selector: 'app-add-vehicle-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-vehicle-modal.html',
  styleUrl: './add-vehicle-modal.scss',
})
export class AddVehicleModal {
  @Output() close = new EventEmitter<void>();
  @Output() vehicleAdded = new EventEmitter<void>();

  marca = '';
  modelo = '';
  placa = '';
  errorMessage = '';

  constructor(private parkingService: Parking) {}

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.marca || !this.modelo || !this.placa) {
      this.errorMessage = 'Por favor, preencha todos os campos.';
      return;
    }

    // Validação básica de placa (formato brasileiro: ABC-1234 ou ABC1D23)
    const placaRegex = /^[A-Z]{3}[-]?[0-9]{1}[A-Z0-9]{1}[0-9]{2}$/;
    if (!placaRegex.test(this.placa.toUpperCase().replace(/\s/g, ''))) {
      this.errorMessage = 'Formato de placa inválido. Use ABC-1234 ou ABC1D23.';
      return;
    }

    this.parkingService.addVehicle(this.marca, this.modelo, this.placa).subscribe({
      next: (vehicle) => {
        this.vehicleAdded.emit();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erro ao adicionar veículo. Tente novamente.';
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
