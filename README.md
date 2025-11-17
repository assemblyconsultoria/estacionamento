# Sistema de Gerenciamento de Estacionamento

Sistema completo de gerenciamento de estacionamento desenvolvido com Angular 20 e Node.js, com interface responsiva e moderna.

## Funcionalidades

- **Autenticação de Usuários**: Sistema de login seguro com JWT e validação
- **Registro de Usuários**: Interface intuitiva para criação de novas contas
- **Gestão de Veículos**: Registro de entrada com marca, modelo e placa
- **Controle de Tempo**: Monitoramento automático do tempo de permanência
- **Cálculo Automático**: Geração de valores baseado em R$ 5,00/hora
- **Retirada de Veículos**: Modal com detalhamento de valores a pagar
- **Interface Responsiva**: Adaptável para desktop, tablet e mobile
- **Persistência de Dados**: Banco de dados PostgreSQL
- **API REST**: Backend completo com autenticação e validação

## Tecnologias Utilizadas

### Frontend
- Angular 20.3.7
- TypeScript
- SCSS
- RxJS

### Backend
- Node.js 20
- Express 5
- PostgreSQL 16
- JWT Authentication
- bcrypt para hash de senhas

### DevOps
- Docker & Docker Compose
- Nginx
- Multi-stage builds

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.7.

## Instalação

### Opção 1: Usando Docker (Recomendado)

A forma mais rápida de executar o projeto completo:

1. Clone o repositório:
```bash
git clone <repository-url>
cd estacionamento
```

2. Configure as variáveis de ambiente (opcional):
```bash
cp backend/.env.example backend/.env
# Edite o .env se necessário
```

3. Inicie os containers:
```bash
docker-compose up -d
```

4. Acesse a aplicação:
   - Frontend: http://localhost
   - Backend API: http://localhost:3000/health

5. **Login inicial (Docker)**:
   - Usuário: `admin`
   - Senha: `admin123`
   - Um usuário admin é criado automaticamente no primeiro start

### Opção 2: Instalação Manual

#### Pré-requisitos
- Node.js 20+
- PostgreSQL 16+
- npm ou yarn

#### Backend

1. Instale o PostgreSQL:
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS (Homebrew)
brew install postgresql
```

2. Configure o banco de dados:
```bash
sudo -u postgres psql
CREATE DATABASE estacionamento;
\c estacionamento
\i backend/database/schema.sql
\q
```

3. Configure o backend:
```bash
cd backend
npm install
cp .env.example .env
# Edite o .env com suas credenciais do PostgreSQL
```

4. Inicie o backend:
```bash
cd backend
npm run dev  # Modo desenvolvimento (porta 3000)
```

#### Frontend

1. Instale as dependências:
```bash
npm install
```

2. Inicie o servidor de desenvolvimento:
```bash
ng serve
```

3. Acesse http://localhost:4200

## Como Usar

### Primeiro Acesso

1. **Registrar Usuário**:

   **Opção 1: Via Interface (Recomendado)**
   - Acesse a página de login
   - Clique no link "Não tem uma conta? Registre-se"
   - Preencha o formulário com:
     - Nome de usuário
     - Senha (mínimo 6 caracteres)
     - Confirmação de senha
   - Clique em "Criar Conta"

   **Opção 2: Docker (usuário pré-criado)**
   - Se estiver usando Docker, use: usuário `admin` e senha `admin123`

   **Opção 3: Via API**
   - Registre um novo usuário via API:
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"senha123"}'
   ```

2. **Fazer Login**:
   - Digite seu usuário e senha (mínimo 6 caracteres)
   - Clique em "Entrar"

### Navegação entre Login e Registro

A tela de login permite alternar facilmente entre os modos:
- **Login**: "Já tem uma conta? Faça login"
- **Registro**: "Não tem uma conta? Registre-se"

Basta clicar no link correspondente para alternar entre os formulários.

### Operações Diárias

1. **Adicionar Veículo**:
   - Clique no botão "Adicionar Veículo"
   - Preencha: Marca, Modelo e Placa (formato: ABC-1234 ou ABC1D23)
   - Clique em "Adicionar"

2. **Retirar Veículo**:
   - Na lista de veículos, clique no botão "Retirada"
   - Visualize o tempo e valor calculado
   - Clique em "Confirmar Retirada"

## Regras de Negócio

- **Cobrança**: R$ 5,00 por hora ou fração de hora
- **Valor mínimo**: R$ 5,00
- **Validação de placa**: Formato brasileiro (ABC-1234 ou ABC1D23)
- **Senha mínima**: 6 caracteres
- **Autenticação**: Token JWT com expiração de 24 horas

## Arquitetura do Sistema

### Estrutura de Diretórios
```
estacionamento/
├── src/                    # Frontend Angular
│   ├── app/
│   │   ├── components/    # Componentes da UI
│   │   ├── services/      # Serviços (Auth, Parking)
│   │   ├── guards/        # Guards de rota
│   │   └── models/        # Interfaces TypeScript
│   └── environments/      # Configurações de ambiente
├── backend/
│   ├── src/
│   │   ├── config/        # Configuração do banco
│   │   ├── controllers/   # Controllers da API
│   │   ├── middleware/    # Middlewares (Auth, Validation)
│   │   ├── models/        # Models do banco
│   │   ├── routes/        # Rotas da API
│   │   └── server.js      # Servidor Express
│   └── database/
│       ├── schema.sql     # Schema do PostgreSQL
│       └── docker-init.sql # Script de inicialização Docker
├── docker-compose.yml     # Orquestração dos containers
├── Dockerfile            # Build do container da aplicação
└── nginx.conf            # Configuração do Nginx
```

### API Endpoints

#### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login (retorna JWT token)
- `GET /api/auth/user` - Obter dados do usuário autenticado
- `POST /api/auth/logout` - Fazer logout

#### Veículos (requer autenticação)
- `GET /api/vehicles` - Listar todos os veículos
- `GET /api/vehicles/estacionados` - Listar veículos estacionados
- `GET /api/vehicles/:id` - Obter veículo por ID
- `POST /api/vehicles` - Adicionar novo veículo
- `PUT /api/vehicles/:id/checkout` - Processar retirada
- `GET /api/vehicles/:id/calcular-valor` - Calcular valor sem retirar

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

## Docker

### Containers

O projeto utiliza 2 containers:

1. **database** (PostgreSQL 16):
   - Porta: 5432 (host) → 5432 (container)
   - Volume persistente para dados
   - Healthcheck configurado

2. **app** (Frontend + Backend unificado):
   - Frontend (Nginx): porta 80 (host) → 80 (container)
   - Backend (Node.js): porta 3000 (host) → 3000 (container)
   - Multi-stage build otimizado
   - Supervisord gerencia ambos os processos

### Comandos Docker

```bash
# Iniciar containers
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar containers
docker-compose down

# Reconstruir após mudanças
docker-compose up -d --build

# Resetar dados (cuidado: apaga o banco)
docker-compose down -v
docker-compose up -d
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto para customizar (opcional):

```env
# Database
DB_NAME=estacionamento
DB_USER=postgres
DB_PASSWORD=postgres123
DB_PORT=5432

# Application
APP_PORT=80
BACKEND_PORT=3000
JWT_SECRET=seu-segredo-aqui
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost
```

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## CI/CD com Jenkins

O projeto inclui uma pipeline CI/CD completa configurada para Jenkins.

### Funcionalidades da Pipeline

- Build automático do frontend e backend
- Testes unitários e de integração
- Análise de código (lint)
- Build de imagens Docker
- Deploy automático com Docker Compose
- Health checks e smoke tests
- Limpeza automática de builds antigos

### Quick Start

1. **Configure credenciais no Jenkins**:
   - Acesse: http://localhost:9090
   - Crie credenciais secretas:
     - `estacionamento-db-password`: Senha do PostgreSQL
     - `estacionamento-jwt-secret`: Secret para JWT

2. **Crie o job da pipeline**:
   - New Item > Pipeline
   - Nome: `estacionamento-pipeline`
   - Definition: Pipeline script from SCM
   - Repository: `https://github.com/assemblyconsultoria/estacionamento.git`
   - Script Path: `Jenkinsfile`

3. **Execute o build**:
   - Clique em "Build Now"
   - Acompanhe em "Console Output"

### Documentação Completa

Para instruções detalhadas de configuração e troubleshooting, consulte:
- [JENKINS.md](JENKINS.md) - Guia completo de CI/CD

### Estrutura da Pipeline

```
Checkout → Environment Info → Install Dependencies (paralelo)
    ↓
Lint & Code Quality (paralelo) → Run Tests (paralelo)
    ↓
Build Frontend → Build Docker Images
    ↓
Stop Previous Deployment → Deploy → Health Check → Smoke Tests
```

### Acesso Pós-Deploy

Após build bem-sucedido:
- Frontend: http://localhost
- Backend: http://localhost:3000
- Database: localhost:5432

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Troubleshooting

### Backend não conecta ao banco de dados

1. Verifique se PostgreSQL está rodando:
```bash
# Se usando Docker
docker-compose ps

# Se instalação local
sudo systemctl status postgresql
```

2. Verifique as credenciais no arquivo `.env` do backend

3. Teste a conexão manualmente:
```bash
psql -U postgres -d estacionamento -h localhost -p 5432
```

### Frontend não conecta ao backend

1. Verifique se o backend está rodando:
```bash
curl http://localhost:3000/health
```

2. Verifique o CORS no backend (deve aceitar requisições de `http://localhost:4200`)

3. Verifique `src/environments/environment.ts` no frontend

### Erro 401 Unauthorized

1. O token JWT pode ter expirado (faça login novamente)
2. Verifique se o token está sendo enviado no header Authorization
3. Verifique se `JWT_SECRET` está configurado no backend

### Docker: Container app não inicia

1. Verifique se a porta 80 já está em uso:
```bash
sudo lsof -i :80
```

2. Aguarde o healthcheck do container database completar:
```bash
docker-compose logs database
```

3. Reconstrua os containers:
```bash
docker-compose down
docker-compose up -d --build
```

### Erro ao adicionar veículo

1. Verifique se o usuário está autenticado
2. Valide o formato da placa (ABC-1234 ou ABC1D23)
3. Verifique os logs do backend:
```bash
# Docker
docker-compose logs app

# Local
# Verifique o terminal onde rodou npm run dev
```

## Licença

MIT License
