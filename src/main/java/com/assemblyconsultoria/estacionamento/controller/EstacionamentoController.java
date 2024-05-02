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

import com.assemblyconsultoria.estacionamento.entity.Estacionamento;
import com.assemblyconsultoria.estacionamento.repository.EstacionamentoRepository;

@Controller
@RequestMapping("/estacionamentos")
public class EstacionamentoController {
    
    @Autowired
    private EstacionamentoRepository estacionamentoRepository;

    @GetMapping
    public String getAllEstacionamento(Model model) {
        model.addAttribute("estacionamentos", estacionamentoRepository.findAll());
        return "estacionamentos/list";
    }

    @PostMapping
    public String createEstacionamento(@ModelAttribute Estacionamento estacionamento) {
        estacionamentoRepository.save(estacionamento);
        return "redirect:/estacionamentos";
    }

    @PutMapping("/{id}")
    public String updateEstacionamento(@PathVariable Long id, @ModelAttribute Estacionamento estacionamento) {
        if(!estacionamentoRepository.existsById(id)) {
            throw new RuntimeException("Estacionamento não existe");
        }
        estacionamento.setId(id);
        estacionamentoRepository.save(estacionamento);
        return "redirect:/estacionamentos";
    }

    @DeleteMapping
    public String deleteEstacionamento(@PathVariable Long id) {
        estacionamentoRepository.deleteById(id);
        return "redirect:/estacionamentos";
    }
}
