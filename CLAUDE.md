# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sistema de Gerenciamento de Estacionamento desenvolvido com Angular 20. O sistema permite:
- Autenticação de usuários
- Registro de entrada de veículos
- Controle de tempo de permanência
- Cálculo automático de valores (R$ 5,00/hora)
- Retirada de veículos com geração de cobrança

## Getting Started

1. Instalar dependências:
```bash
npm install
```

2. Iniciar servidor de desenvolvimento:
```bash
ng serve
```

3. Acessar aplicação em: http://localhost:4200

## Development Commands

### Servidor de Desenvolvimento
```bash
ng serve                    # Inicia servidor dev na porta 4200
ng serve --open            # Inicia e abre no navegador
ng serve --port 4300       # Inicia em porta específica
```

### Build
```bash
ng build                   # Build de produção
ng build --configuration development  # Build de desenvolvimento
```

### Testes
```bash
ng test                    # Executa testes unitários
ng test --watch=false     # Executa testes uma vez
```

### Linting
```bash
ng lint                    # Verifica código
```

### Gerar Componentes/Serviços
```bash
ng generate component components/nome
ng generate service services/nome
ng generate guard guards/nome
```

## Architecture

### Estrutura de Diretórios
```
src/app/
├── components/           # Componentes da aplicação
│   ├── login/           # Página de autenticação
│   ├── parking/         # Página principal (lista de veículos)
│   ├── add-vehicle-modal/   # Modal para adicionar veículo
│   └── checkout-modal/      # Modal de retirada/pagamento
├── services/            # Serviços da aplicação
│   ├── auth.ts         # Gerenciamento de autenticação
│   └── parking.ts      # Gerenciamento de veículos
├── guards/              # Guards de rota
│   └── auth-guard.ts   # Proteção de rotas autenticadas
└── models/              # Interfaces/Models
    ├── vehicle.model.ts
    └── user.model.ts
```

### Fluxo de Autenticação
1. Usuário acessa `/login`
2. `Auth` service valida credenciais (mínimo 6 caracteres na senha)
3. Token gerado e armazenado em `localStorage`
4. `authGuard` protege rota `/parking`
5. Redirecionamento automático para `/parking` após login bem-sucedido

### Gerenciamento de Dados
- **Storage**: LocalStorage para persistência de dados
  - `authToken`: Token de autenticação
  - `usuario`: Nome do usuário logado
  - `vehicles`: Array de veículos estacionados

- **Vehicle Model**:
  ```typescript
  {
    id: string;
    marca: string;
    modelo: string;
    placa: string;
    dataEntrada: Date;
    dataSaida?: Date;
    valorTotal?: number;
    status: 'estacionado' | 'retirado';
  }
  ```

### Regras de Negócio

#### Cálculo de Valores
- Valor por hora: R$ 5,00
- Valor mínimo: R$ 5,00
- Cobrança por hora iniciada (arredondamento para cima)
- Fórmula: `Math.ceil(horasEstacionado) * 5.00`

#### Validações
- **Login**: Usuário e senha obrigatórios, senha mínima 6 caracteres
- **Placa**: Formato brasileiro ABC-1234 ou ABC1D23
- **Campos**: Todos os campos de veículo são obrigatórios

### Serviços Principais

#### Auth Service (src/app/services/auth.ts)
- `login(usuario, senha)`: Autentica usuário
- `logout()`: Remove autenticação e redireciona para login
- `isAuthenticated()`: Verifica se usuário está autenticado
- `getUsuario()`: Retorna nome do usuário logado

#### Parking Service (src/app/services/parking.ts)
- `addVehicle(marca, modelo, placa)`: Adiciona veículo ao estacionamento
- `getEstacionados()`: Retorna lista de veículos estacionados
- `calcularValor(vehicle)`: Calcula valor a pagar
- `checkoutVehicle(id)`: Processa retirada de veículo
- `vehicles$`: Observable para atualizações em tempo real

### Responsividade
O sistema é totalmente responsivo com breakpoints:
- Desktop: > 768px
- Tablet: 480px - 768px
- Mobile: < 480px

Todos os componentes possuem estilos adaptados para diferentes tamanhos de tela.

## Key Conventions

### Angular 20 Features
- **Standalone Components**: Todos os componentes usam `standalone: true` implicitamente
- **Control Flow Syntax**: Usa `@if`, `@for`, `@else` ao invés de `*ngIf`, `*ngFor`
- **Signals**: Preparado para usar signals quando necessário

### Nomenclatura
- Componentes: PascalCase (ex: `Login`, `Parking`)
- Serviços: PascalCase (ex: `Auth`, `Parking`)
- Arquivos: kebab-case (ex: `auth.ts`, `parking.service.ts`)

### Estilos
- SCSS usado em todos os componentes
- Gradientes: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Cores principais:
  - Primary: #667eea, #764ba2
  - Success: #10b981, #059669
  - Error: #c33
  - Text: #333
  - Gray: #666, #999

### Segurança
- Tokens armazenados com encoding Base64
- Validação de entrada em todos os formulários
- Guards de rota para proteção de páginas autenticadas
- Autocomplete configurado corretamente nos campos de formulário
