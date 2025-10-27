# Docker Quick Start Guide

Sistema de Gerenciamento de Estacionamento - Guia Rapido de Inicializacao com Docker

## Inicio Rapido (3 comandos)

```bash
# 1. Copiar arquivo de ambiente
cp .env.docker .env

# 2. Iniciar todos os servicos
docker-compose up -d --build

# 3. Acessar a aplicacao
# Frontend: http://localhost:4200
# Backend:  http://localhost:3000
```

## Primeiro Acesso

Como o banco de dados inicia vazio, voce precisa registrar um usuario:

### Opcao 1: Usando a API
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"senha123"}'
```

### Opcao 2: Usando a Interface Web
1. Acesse http://localhost:4200
2. Clique em "Registrar" na tela de login
3. Crie sua conta

## Comandos Essenciais

### Iniciar Servicos
```bash
# Modo producao
docker-compose up -d

# Modo desenvolvimento (com hot-reload)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Parar Servicos
```bash
docker-compose down
```

### Ver Logs
```bash
# Todos os servicos
docker-compose logs -f

# Servico especifico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database
```

### Status dos Servicos
```bash
docker-compose ps
```

### Reconstruir Imagens
```bash
docker-compose up -d --build
```

## Arquitetura dos Containers

```
┌─────────────────────────────────────┐
│  Frontend (Angular 20 + nginx)      │
│  Container: estacionamento-frontend │
│  Port: 4200:80                      │
│  URL: http://localhost:4200         │
└──────────────┬──────────────────────┘
               │
               │ Proxy /api/* requests
               │
┌──────────────▼──────────────────────┐
│  Backend (Node.js + Express 5)      │
│  Container: estacionamento-backend  │
│  Port: 3000:3000                    │
│  URL: http://localhost:3000         │
└──────────────┬──────────────────────┘
               │
               │ SQL Queries
               │
┌──────────────▼──────────────────────┐
│  Database (PostgreSQL 16)           │
│  Container: estacionamento-db       │
│  Port: 5432:5432                    │
│  Database: estacionamento           │
└─────────────────────────────────────┘
```

## Fluxo de Requisicoes

1. **Usuario acessa**: http://localhost:4200
2. **Frontend carrega**: Angular app servido pelo nginx
3. **Usuario faz login**: POST /api/auth/login
4. **nginx proxeia**: Encaminha para http://backend:3000/api/auth/login
5. **Backend processa**: Valida credenciais no PostgreSQL
6. **Backend retorna**: JWT token
7. **Frontend armazena**: Token no localStorage
8. **Requisicoes futuras**: Incluem token no header Authorization

## Variavies de Ambiente

Arquivo: `.env`

```env
# Database
DB_NAME=estacionamento
DB_USER=postgres
DB_PASSWORD=postgres123  # Mude em producao!

# Ports
FRONTEND_PORT=4200
BACKEND_PORT=3000
DB_PORT=5432

# JWT (CRITICO: mude em producao!)
JWT_SECRET=seu-segredo-super-secreto-aqui
JWT_EXPIRES_IN=24h

# CORS
FRONTEND_URL=http://localhost:4200
```

## Gerenciamento do Banco de Dados

### Acessar o PostgreSQL
```bash
docker-compose exec database psql -U postgres -d estacionamento
```

### Backup do Banco
```bash
docker-compose exec -T database pg_dump -U postgres estacionamento > backup.sql
```

### Restaurar Backup
```bash
docker-compose exec -T database psql -U postgres estacionamento < backup.sql
```

### Resetar Banco (CUIDADO: apaga todos os dados!)
```bash
docker-compose down
docker volume rm estacionamento-postgres-data
docker-compose up -d
```

## Troubleshooting

### Porta ja em uso
```bash
# Verificar qual processo esta usando a porta
sudo lsof -i :4200

# Mudar a porta no .env
echo "FRONTEND_PORT=4201" >> .env
docker-compose up -d
```

### Backend nao conecta ao banco
```bash
# Ver logs do banco
docker-compose logs database

# Verificar saude dos servicos
docker-compose ps

# Reiniciar servicos
docker-compose restart backend database
```

### Limpar cache do Docker
```bash
# Remover imagens nao usadas
docker image prune -a

# Limpar tudo (cuidado!)
docker system prune -a --volumes
```

## Desenvolvimento

### Hot Reload (Desenvolvimento)
```bash
# Iniciar com hot-reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Agora qualquer mudanca no codigo sera refletida automaticamente!
```

### Acessar shell do container
```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh

# Database
docker-compose exec database bash
```

## Seguranca para Producao

1. **Trocar JWT_SECRET**: Use um valor aleatorio forte
   ```bash
   openssl rand -base64 32
   ```

2. **Trocar senha do banco**: Use uma senha forte
   ```bash
   openssl rand -base64 24
   ```

3. **Configurar HTTPS**: Use reverse proxy (nginx/traefik) com SSL

4. **Restringir portas**: Exponha apenas 80/443 atraves de reverse proxy

## Documentacao Completa

Para documentacao detalhada, consulte:
- **README.docker.md**: Guia completo com troubleshooting avancado
- **CLAUDE.md**: Documentacao do projeto e arquitetura

## Suporte

Problemas? Verifique:
1. `docker-compose logs -f` - Ver logs em tempo real
2. `docker-compose ps` - Verificar status dos servicos
3. `docker stats` - Ver uso de recursos
4. README.docker.md - Troubleshooting detalhado
