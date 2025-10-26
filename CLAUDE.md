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

### Frontend Setup

1. Instalar dependências:
```bash
npm install
```

2. Iniciar servidor de desenvolvimento:
```bash
ng serve
```

3. Acessar aplicação em: http://localhost:4200

### Backend Setup (Required)

O sistema agora utiliza PostgreSQL ao invés de localStorage. Siga estes passos:

1. Instalar PostgreSQL (se ainda não tiver):
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS (usando Homebrew)
brew install postgresql
```

2. Configurar banco de dados:
```bash
# Acessar PostgreSQL
sudo -u postgres psql

# Executar script de setup
\i backend/database/setup.sql

# Ou criar manualmente:
CREATE DATABASE estacionamento;
\c estacionamento
\i backend/database/schema.sql
```

3. Instalar dependências do backend:
```bash
cd backend
npm install
```

4. Configurar variáveis de ambiente:
```bash
cd backend
cp .env.example .env
# Editar .env com suas credenciais do PostgreSQL
```

5. Iniciar servidor backend:
```bash
cd backend
npm run dev  # Modo desenvolvimento com auto-reload
# ou
npm start    # Modo produção
```

6. Verificar se está funcionando:
- Backend: http://localhost:3000/health
- Frontend: http://localhost:4200

### Criando Primeiro Usuário

Como o sistema agora usa autenticação real, você precisa registrar um usuário:

1. Usar a tela de login e clicar em "Registrar" (se disponível), ou
2. Usar a API diretamente:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"senha123"}'
```

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
- **Backend**: PostgreSQL com API REST
  - Banco de dados: `estacionamento`
  - Tabelas: `users`, `vehicles`
  - API rodando em: http://localhost:3000/api

- **LocalStorage**: Apenas para token JWT
  - `authToken`: Token JWT de autenticação
  - `usuario`: Nome do usuário logado
  - `userId`: ID do usuário

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
- `login(usuario, senha)`: Observable - Autentica usuário via API
- `logout()`: Remove token e redireciona para login
- `isAuthenticated()`: Verifica se possui token válido
- `getUsuario()`: Retorna nome do usuário logado
- `register(usuario, senha)`: Observable - Registra novo usuário
- `getCurrentUser()`: Observable - Busca dados do usuário na API

#### Parking Service (src/app/services/parking.ts)
- `addVehicle(marca, modelo, placa)`: Observable - Adiciona veículo via API
- `getEstacionados()`: Observable - Retorna lista de veículos estacionados
- `calcularValor(vehicle)`: Calcula valor a pagar (client-side)
- `checkoutVehicle(id)`: Observable - Processa retirada via API
- `vehicles$`: Observable para atualizações em tempo real
- `getAllVehicles()`: Observable - Retorna todos os veículos (estacionados e retirados)

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
- Autenticação JWT com tokens seguros
- Senhas hasheadas com bcrypt (10 rounds)
- Validação de entrada no frontend e backend
- Guards de rota para proteção de páginas autenticadas
- CORS configurado para aceitar apenas origem do frontend
- Prepared statements para prevenir SQL injection
- Autocomplete configurado corretamente nos campos de formulário

## Backend Architecture

### Stack Tecnológico
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express 5
- **Database**: PostgreSQL com pg (node-postgres)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: express-validator

### Estrutura do Backend
```
backend/
├── src/
│   ├── config/
│   │   └── database.js         # Configuração do pool PostgreSQL
│   ├── controllers/
│   │   ├── authController.js   # Login, register, user info
│   │   └── vehicleController.js # CRUD de veículos
│   ├── middleware/
│   │   ├── auth.js             # Autenticação JWT
│   │   ├── errorHandler.js     # Tratamento global de erros
│   │   └── validator.js        # Validação de inputs
│   ├── models/
│   │   ├── User.js             # Model de usuário
│   │   └── Vehicle.js          # Model de veículo
│   ├── routes/
│   │   ├── auth.js             # Rotas de autenticação
│   │   └── vehicles.js         # Rotas de veículos
│   └── server.js               # Servidor principal
├── database/
│   ├── schema.sql              # Schema completo do banco
│   └── setup.sql               # Script de setup rápido
├── .env                        # Variáveis de ambiente (não commitado)
├── .env.example                # Template de variáveis
└── package.json
```

### API Endpoints

#### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/user` - Obter dados do usuário (requer token)
- `POST /api/auth/logout` - Fazer logout (requer token)

#### Veículos (todos requerem autenticação)
- `GET /api/vehicles` - Listar todos os veículos
- `GET /api/vehicles/estacionados` - Listar veículos estacionados
- `GET /api/vehicles/:id` - Obter veículo por ID
- `POST /api/vehicles` - Adicionar novo veículo
- `PUT /api/vehicles/:id/checkout` - Processar retirada
- `GET /api/vehicles/:id/calcular-valor` - Calcular valor sem retirar
- `GET /api/vehicles/stats` - Obter estatísticas

### Database Schema

#### Tabela: users
```sql
id UUID PRIMARY KEY
username VARCHAR(100) UNIQUE NOT NULL
password_hash VARCHAR(255) NOT NULL
created_at TIMESTAMP WITH TIME ZONE
updated_at TIMESTAMP WITH TIME ZONE
```

#### Tabela: vehicles
```sql
id UUID PRIMARY KEY
marca VARCHAR(100) NOT NULL
modelo VARCHAR(100) NOT NULL
placa VARCHAR(20) NOT NULL
data_entrada TIMESTAMP WITH TIME ZONE NOT NULL
data_saida TIMESTAMP WITH TIME ZONE
valor_total NUMERIC(10, 2)
status vehicle_status NOT NULL ('estacionado' | 'retirado')
user_id UUID REFERENCES users(id)
created_at TIMESTAMP WITH TIME ZONE
updated_at TIMESTAMP WITH TIME ZONE
```

### Executando Backend e Frontend Simultaneamente

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
ng serve
```

### Variáveis de Ambiente

Frontend (src/environments/environment.ts):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

Backend (.env):
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=estacionamento
DB_USER=postgres
DB_PASSWORD=postgres123
PORT=3000
JWT_SECRET=seu-segredo-aqui
JWT_EXPIRES_IN=24h
```

## Troubleshooting

### Backend não conecta ao banco
1. Verificar se PostgreSQL está rodando: `sudo systemctl status postgresql`
2. Verificar credenciais no arquivo `.env`
3. Testar conexão: `psql -U postgres -d estacionamento`

### Frontend não conecta ao backend
1. Verificar se backend está rodando em http://localhost:3000
2. Verificar CORS no backend (deve aceitar http://localhost:4200)
3. Verificar ambiente em `src/environments/environment.ts`

### Erro 401 Unauthorized
1. Token JWT pode ter expirado (fazer login novamente)
2. Token não está sendo enviado no header
3. Verificar se JWT_SECRET está configurado no backend

### Erro ao adicionar veículo
1. Verificar se usuário está autenticado
2. Verificar formato da placa (ABC-1234 ou ABC1D23)
3. Verificar se não há outro veículo com mesma placa estacionado
