import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Parking } from '../../services/parking';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-export-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './export-modal.html',
  styleUrl: './export-modal.scss',
})
export class ExportModal {
  @Output() close = new EventEmitter<void>();

  private parkingService = inject(Parking);

  periodoSelecionado: 'dia' | 'semana' | 'mes' | 'customizado' = 'dia';
  diasCustomizado: number = 7;
  exportando = false;

  fecharModal() {
    this.close.emit();
  }

  exportarExcel() {
    // Validar período customizado
    if (this.periodoSelecionado === 'customizado') {
      if (!this.diasCustomizado || this.diasCustomizado < 1) {
        alert('Por favor, informe um número válido de dias (mínimo 1 dia).');
        return;
      }
      if (this.diasCustomizado > 365) {
        alert('O período máximo é de 365 dias.');
        return;
      }
    }

    this.exportando = true;

    // Calcular datas de início e fim baseado no período selecionado
    const dataFim = new Date();
    const dataInicio = new Date();

    switch (this.periodoSelecionado) {
      case 'dia':
        dataInicio.setHours(0, 0, 0, 0);
        dataFim.setHours(23, 59, 59, 999);
        break;
      case 'semana':
        dataInicio.setDate(dataInicio.getDate() - 7);
        dataInicio.setHours(0, 0, 0, 0);
        break;
      case 'mes':
        dataInicio.setMonth(dataInicio.getMonth() - 1);
        dataInicio.setHours(0, 0, 0, 0);
        break;
      case 'customizado':
        dataInicio.setDate(dataInicio.getDate() - this.diasCustomizado);
        dataInicio.setHours(0, 0, 0, 0);
        break;
    }

    this.parkingService.getAllVehicles().subscribe({
      next: (vehicles) => {
        // Filtrar veículos pelo período selecionado
        const vehiclesFiltrados = vehicles.filter(v => {
          const dataEntrada = new Date(v.dataEntrada);
          return dataEntrada >= dataInicio && dataEntrada <= dataFim;
        });

        // Validar se há dados para exportar
        if (vehiclesFiltrados.length === 0) {
          this.exportando = false;
          alert(this.getMensagemSemDados());
          return;
        }

        // Calcular total
        const valorTotal = vehiclesFiltrados.reduce((total, v) => {
          return total + (Number(v.valorTotal) || 0);
        }, 0);

        // Preparar dados para exportação
        const dadosExcel = vehiclesFiltrados.map(v => ({
          'Marca': v.marca,
          'Modelo': v.modelo,
          'Placa': v.placa,
          'Data Entrada': new Date(v.dataEntrada).toLocaleString('pt-BR'),
          'Data Saída': v.dataSaida ? new Date(v.dataSaida).toLocaleString('pt-BR') : 'Estacionado',
          'Status': v.status === 'estacionado' ? 'Estacionado' : 'Retirado',
          'Valor Total': v.valorTotal ? `R$ ${Number(v.valorTotal).toFixed(2)}` : 'R$ 0,00'
        }));

        // Adicionar linha de total
        dadosExcel.push({
          'Marca': '',
          'Modelo': '',
          'Placa': '',
          'Data Entrada': '',
          'Data Saída': '',
          'Status': 'TOTAL',
          'Valor Total': `R$ ${valorTotal.toFixed(2)}`
        });

        // Criar planilha
        const worksheet = XLSX.utils.json_to_sheet(dadosExcel);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');

        // Definir largura das colunas
        const columnWidths = [
          { wch: 15 }, // Marca
          { wch: 20 }, // Modelo
          { wch: 12 }, // Placa
          { wch: 20 }, // Data Entrada
          { wch: 20 }, // Data Saída
          { wch: 15 }, // Status
          { wch: 15 }  // Valor Total
        ];
        worksheet['!cols'] = columnWidths;

        // Gerar arquivo
        const sufixoPeriodo = this.periodoSelecionado === 'customizado'
          ? `${this.diasCustomizado}_dias`
          : this.periodoSelecionado;
        const nomeArquivo = `relatorio_estacionamento_${sufixoPeriodo}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, nomeArquivo);

        this.exportando = false;
        this.fecharModal();
      },
      error: (err) => {
        console.error('Erro ao exportar:', err);
        alert('Erro ao exportar relatório. Tente novamente.');
        this.exportando = false;
      }
    });
  }

  private getMensagemSemDados(): string {
    switch (this.periodoSelecionado) {
      case 'dia':
        return 'Não há dados para exportar no período selecionado (hoje).\n\nNenhum veículo foi registrado hoje.';
      case 'semana':
        return 'Não há dados para exportar no período selecionado (última semana).\n\nNenhum veículo foi registrado nos últimos 7 dias.';
      case 'mes':
        return 'Não há dados para exportar no período selecionado (último mês).\n\nNenhum veículo foi registrado nos últimos 30 dias.';
      case 'customizado':
        return `Não há dados para exportar no período selecionado (últimos ${this.diasCustomizado} dias).\n\nNenhum veículo foi registrado neste período.`;
      default:
        return 'Não há dados para exportar no período selecionado.';
    }
  }
}
