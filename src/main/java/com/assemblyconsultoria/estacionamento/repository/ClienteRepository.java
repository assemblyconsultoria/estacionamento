package com.assemblyconsultoria.estacionamento.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.assemblyconsultoria.estacionamento.entity.Cliente;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    
}
