# 🐳 Guia de Uso com Docker

Este guia explica como executar o Sistema de Estacionamento usando Docker e Docker Compose.

## 📋 Pré-requisitos

- Docker instalado ([Download Docker](https://www.docker.com/get-started))
- Docker Compose instalado (geralmente incluído com Docker Desktop)

## 🚀 Início Rápido

### 1. Clone o Repositório
```bash
git clone <url-do-repositorio>
cd estacionamento
```

### 2. Inicie os Containers
```bash
docker-compose up -d
```

Este comando irá:
- ✅ Criar o container do PostgreSQL
- ✅ Criar o container da aplicação (Frontend + Backend)
- ✅ Criar a rede de comunicação entre os containers
- ✅ Criar volumes para persistência de dados
- ✅ Inicializar o banco de dados com as tabelas necessárias
- ✅ **Criar automaticamente o usuário admin com senha admin123**

### 3. Acesse o Sistema

Aguarde cerca de 30-40 segundos para os containers iniciarem completamente, então:

```
Frontend: http://localhost
Backend API: http://localhost:3000
```

### 4. Faça Login

Use as credenciais padrão criadas automaticamente:
- **Usuário**: `admin`
- **Senha**: `admin123`

## 📊 Estrutura dos Containers

```
┌─────────────────────────────────────┐
│  estacionamento-app (Porta 80/3000) │
│  ┌───────────────────────────────┐  │
│  │  Frontend (Angular 20)        │  │
│  │  - Nginx na porta 80          │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  Backend (Node.js/Express)    │  │
│  │  - API na porta 3000          │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
                  │
                  │ Conexão
                  ▼
┌─────────────────────────────────────┐
│  estacionamento-db (Porta 5430)     │
│  ┌───────────────────────────────┐  │
│  │  PostgreSQL 16                │  │
│  │  - Banco: estacionamento      │  │
│  │  - Usuário admin criado       │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## 🔧 Comandos Úteis

### Iniciar os Containers
```bash
docker-compose up -d
```

### Parar os Containers
```bash
docker-compose down
```

### Parar e Remover Tudo (incluindo volumes)
```bash
docker-compose down -v
```
⚠️ **ATENÇÃO**: Isso apagará todos os dados do banco de dados!

### Ver Logs
```bash
# Ver logs de todos os containers
docker-compose logs -f

# Ver logs apenas do app
docker-compose logs -f app

# Ver logs apenas do banco
docker-compose logs -f database
```

### Reiniciar Containers
```bash
# Reiniciar todos
docker-compose restart

# Reiniciar apenas o app
docker-compose restart app

# Reiniciar apenas o banco
docker-compose restart database
```

### Ver Status dos Containers
```bash
docker-compose ps
```

### Acessar o Container
```bash
# Acessar container da aplicação
docker-compose exec app sh

# Acessar container do banco
docker-compose exec database psql -U postgres -d estacionamento
```

## 🔍 Verificar se Está Funcionando

### 1. Verificar Health dos Containers
```bash
docker-compose ps
```

Você deve ver:
```
NAME                  STATUS
estacionamento-app    Up (healthy)
estacionamento-db     Up (healthy)
```

### 2. Testar Backend
```bash
curl http://localhost:3000/health
```

Resposta esperada:
```json
{"status":"ok","timestamp":"...","uptime":...}
```

### 3. Testar Usuário Admin
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Resposta esperada:
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "user": {
    "id": "...",
    "username": "admin",
    "isAdmin": true
  },
  "token": "..."
}
```

## 📝 Variáveis de Ambiente

Você pode customizar as variáveis de ambiente criando um arquivo `.env`:

```bash
# Banco de Dados
DB_NAME=estacionamento
DB_USER=postgres
DB_PASSWORD=postgres123
DB_PORT=5430

# Backend
PORT=3000
NODE_ENV=production
JWT_SECRET=seu-segredo-aqui
JWT_EXPIRES_IN=24h

# Frontend
FRONTEND_URL=http://localhost
APP_PORT=80
BACKEND_PORT=3000
```

## 🗄️ Persistência de Dados

Os dados do banco de dados são armazenados em um volume Docker chamado `estacionamento-postgres-data`. Isso garante que:
- ✅ Os dados sobrevivem a reinicializações dos containers
- ✅ O usuário admin é criado apenas uma vez
- ✅ Todos os veículos e usuários cadastrados são mantidos

### Backup do Banco de Dados
```bash
# Fazer backup
docker-compose exec database pg_dump -U postgres estacionamento > backup.sql

# Restaurar backup
docker-compose exec -T database psql -U postgres estacionamento < backup.sql
```

## 🔄 Atualizar o Sistema

Quando houver uma nova versão:

```bash
# 1. Baixar atualizações
git pull

# 2. Reconstruir as imagens
docker-compose build --no-cache

# 3. Reiniciar os containers
docker-compose down
docker-compose up -d
```

## 🐛 Troubleshooting

### Problema: Container do banco não inicia
```bash
# Verificar logs
docker-compose logs database

# Remover volume e recriar
docker-compose down -v
docker-compose up -d
```

### Problema: Porta 80 ou 3000 já está em uso
Edite o arquivo `docker-compose.yml` e altere as portas:
```yaml
ports:
  - "8080:80"      # Usar porta 8080 ao invés de 80
  - "3001:3000"    # Usar porta 3001 ao invés de 3000
```

### Problema: Usuário admin não foi criado
```bash
# Acessar o banco e verificar
docker-compose exec database psql -U postgres -d estacionamento -c "SELECT username, is_admin FROM users;"

# Se não existir, criar manualmente
docker-compose exec database psql -U postgres -d estacionamento -c "INSERT INTO users (username, password_hash, is_admin) VALUES ('admin', '\$2b\$10\$4GRKoULDiCsnNjAIRslr8eyKC//7yTATuliECJ73NxuJBWx6osuWS', true) ON CONFLICT (username) DO NOTHING;"
```

### Problema: Frontend não carrega
```bash
# Verificar se o container está rodando
docker-compose ps

# Verificar logs
docker-compose logs app

# Reiniciar container
docker-compose restart app
```

## 🔒 Segurança em Produção

Antes de usar em produção:

1. **Altere a senha do admin**:
   - Faça login no sistema
   - Clique em "Admin" no header
   - Clique em "Reset Senha" no usuário admin

2. **Configure JWT_SECRET**:
   - Crie um arquivo `.env`
   - Defina `JWT_SECRET=seu-segredo-super-secreto-e-aleatorio`

3. **Use HTTPS**:
   - Configure um proxy reverso (nginx, traefik, etc.)
   - Obtenha certificados SSL (Let's Encrypt)

4. **Altere a senha do banco**:
   - Edite `DB_PASSWORD` no `.env`
   - Recrie os containers

## 📚 Estrutura de Arquivos Docker

```
estacionamento/
├── docker-compose.yml           # Configuração principal
├── Dockerfile                   # Build da aplicação
├── backend/
│   ├── Dockerfile              # Build do backend
│   └── database/
│       ├── docker-init.sql     # Script de inicialização (cria admin)
│       └── schema.sql          # Schema completo
├── nginx.conf                  # Configuração do Nginx
└── supervisord.conf           # Gerenciador de processos
```

## 🎯 Próximos Passos

Após iniciar o sistema:

1. ✅ Acesse http://localhost
2. ✅ Faça login com admin/admin123
3. ✅ Altere a senha do admin (via painel admin)
4. ✅ Crie outros usuários conforme necessário
5. ✅ Comece a usar o sistema!

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs: `docker-compose logs -f`
2. Consulte a documentação em `ADMIN_SETUP.md`
3. Verifique se as portas não estão em uso
4. Tente remover os volumes: `docker-compose down -v && docker-compose up -d`

---

**Desenvolvido com ❤️ usando Docker, Angular 20, Node.js e PostgreSQL**
