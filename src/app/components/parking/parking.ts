import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Parking as ParkingService } from '../../services/parking';
import { Vehicle } from '../../models/vehicle.model';
import { AddVehicleModal } from '../add-vehicle-modal/add-vehicle-modal';
import { CheckoutModal } from '../checkout-modal/checkout-modal';
import { ExportModal } from '../export-modal/export-modal';
import { AdminModal } from '../admin-modal/admin-modal';

@Component({
  selector: 'app-parking',
  imports: [CommonModule, FormsModule, AddVehicleModal, CheckoutModal, ExportModal, AdminModal],
  templateUrl: './parking.html',
  styleUrl: './parking.scss',
})
export class Parking implements OnInit {
  vehicles: Vehicle[] = [];
  usuario: string | null = '';
  isAdmin = false;
  showAddModal = false;
  showCheckoutModal = false;
  showExportModal = false;
  showAdminModal = false;
  selectedVehicle: Vehicle | null = null;
  searchTerm: string = '';

  constructor(
    private authService: Auth,
    private parkingService: ParkingService
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUsuario();
    this.isAdmin = this.authService.isAdmin();
    this.loadVehicles();

    // Inscreve-se para atualizações automáticas
    this.parkingService.vehicles$.subscribe(vehicles => {
      this.vehicles = vehicles.filter(v => v.status === 'estacionado');
    });
  }

  loadVehicles(): void {
    this.parkingService.getEstacionados().subscribe({
      next: (vehicles) => {
        this.vehicles = vehicles;
      },
      error: (error) => {
        console.error('Erro ao carregar veículos:', error);
        this.vehicles = [];
      }
    });
  }

  openAddModal(): void {
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  onVehicleAdded(): void {
    this.closeAddModal();
    this.loadVehicles();
  }

  openCheckoutModal(vehicle: Vehicle): void {
    this.selectedVehicle = vehicle;
    this.showCheckoutModal = true;
  }

  closeCheckoutModal(): void {
    this.showCheckoutModal = false;
    this.selectedVehicle = null;
  }

  onVehicleCheckedOut(): void {
    this.closeCheckoutModal();
    this.loadVehicles();
  }

  openExportModal(): void {
    this.showExportModal = true;
  }

  closeExportModal(): void {
    this.showExportModal = false;
  }

  openAdminModal(): void {
    this.showAdminModal = true;
  }

  closeAdminModal(): void {
    this.showAdminModal = false;
  }

  logout(): void {
    this.authService.logout();
  }

  getTempoEstacionado(vehicle: Vehicle): string {
    const entrada = new Date(vehicle.dataEntrada);
    const agora = new Date();
    const diff = agora.getTime() - entrada.getTime();

    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (horas === 0) {
      return `${minutos} min`;
    }
    return `${horas}h ${minutos}min`;
  }

  get filteredVehicles(): Vehicle[] {
    if (!this.searchTerm.trim()) {
      return this.vehicles;
    }

    const term = this.searchTerm.toLowerCase().trim();
    return this.vehicles.filter(vehicle =>
      vehicle.modelo.toLowerCase().includes(term) ||
      vehicle.placa.toLowerCase().includes(term)
    );
  }
}
