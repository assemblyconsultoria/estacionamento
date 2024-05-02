package com.assemblyconsultoria.estacionamento.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.assemblyconsultoria.estacionamento.entity.Estacionamento;

public interface EstacionamentoRepository extends JpaRepository<Estacionamento, Long> {
    
}
