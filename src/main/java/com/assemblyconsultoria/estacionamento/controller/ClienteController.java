package com.assemblyconsultoria.estacionamento.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.assemblyconsultoria.estacionamento.entity.Cliente;
import com.assemblyconsultoria.estacionamento.repository.ClienteRepository;


@Controller
@RequestMapping("/clientes")
public class ClienteController {
    
    @Autowired
    private ClienteRepository clienteRepository;

    @GetMapping
    public String getAllClientes(Model model) {
        model.addAttribute("clientes", clienteRepository.findAll());
        return "clientes/list";
    }

    @PostMapping()
    public String createCliente(@ModelAttribute Cliente cliente) {
        clienteRepository.save(cliente);
        return "redirect:/clientes";
    }
    
    @PutMapping
    public String updateCliente(@PathVariable Long id, @ModelAttribute Cliente cliente) {
        if(!clienteRepository.existsById(id)) {
            throw new RuntimeException("Cliente não existe");
        }
        cliente.setId(id);
        clienteRepository.save(cliente);
        return "redirect:/clientes";
    }

    @DeleteMapping
    public String deleteCliente(@PathVariable Long id) {
        clienteRepository.deleteById(id);
        return "redirect:/clientes";

    }
}
