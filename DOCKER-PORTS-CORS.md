# Guia de Configuração de Portas e CORS no Docker

Este documento explica as configurações de portas e CORS implementadas no sistema.

## 🔌 Configuração de Portas

### Portas Externas (Host)
- **Frontend**: `9091` → Acesse em `http://localhost:9091`
- **Backend API**: `3001` → Acesse em `http://localhost:3001` (para debug/desenvolvimento)
- **PostgreSQL**: `5430` → Conexão direta ao banco (se necessário)

### Portas Internas (Container)
- **Nginx (Frontend)**: `80` (interna)
- **Node.js (Backend)**: `3000` (interna)
- **PostgreSQL**: `5432` (interna)

### Mapeamento no docker-compose.yml
```yaml
app:
  ports:
    - "9091:80"    # Frontend: Host:9091 → Container:80
    - "3001:3000"  # Backend: Host:3001 → Container:3000
```

## 🌐 Configuração de CORS

### Problema Original
O CORS estava configurado para aceitar apenas `http://localhost:4200` (servidor de desenvolvimento Angular), causando erros ao acessar via Docker na porta 80 ou 9091.

### Solução Implementada
O backend agora aceita múltiplas origens:

```javascript
const allowedOrigins = [
  'http://localhost:4200',       // Development Angular server
  'http://localhost:9091',       // Docker production
  'http://localhost',            // Alternative Docker access
  process.env.FRONTEND_URL       // Custom URL from env
];
```

### Configurações CORS Aplicadas
```javascript
app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    // Verifica se a origin está na lista permitida
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS not allowed'), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## 🔄 Fluxo de Requisições

### Opção 1: Via Proxy Nginx (Recomendado)
```
Browser → http://localhost:9091/api/auth/login
   ↓
Nginx (Container:80) → Proxy para http://localhost:3000/api/auth/login
   ↓
Backend (Container:3000)
```

**Vantagens:**
- ✅ Mesma origem (sem problemas de CORS)
- ✅ Mais seguro
- ✅ Melhor performance

### Opção 2: Diretamente ao Backend
```
Browser → http://localhost:3001/api/auth/login
   ↓
Backend (Container:3000)
```

**Uso:**
- 🔧 Debug e desenvolvimento
- 🧪 Testes com curl/Postman
- 📊 Ferramentas de monitoramento

## 📁 Arquivos Modificados

### 1. docker-compose.yml
```yaml
environment:
  FRONTEND_URL: ${FRONTEND_URL:-http://localhost:9091}
ports:
  - "${APP_PORT:-9091}:80"
  - "${BACKEND_PORT:-3001}:3000"
```

### 2. backend/src/server.js
- Adicionado array `allowedOrigins`
- Configuração dinâmica de CORS
- Suporte a múltiplas origens

### 3. .env.example
```bash
FRONTEND_URL=http://localhost:9091
APP_PORT=9091
BACKEND_PORT=3001
```

## 🛠️ Customizar Portas

### Via Arquivo .env
Crie um arquivo `.env` na raiz do projeto:

```bash
# Customizar portas
APP_PORT=8080
BACKEND_PORT=3002
FRONTEND_URL=http://localhost:8080
```

### Via Linha de Comando
```bash
APP_PORT=8080 BACKEND_PORT=3002 docker-compose up -d
```

### Editando docker-compose.yml Diretamente
```yaml
ports:
  - "8080:80"      # Porta customizada para frontend
  - "3002:3000"    # Porta customizada para backend
```

## 🔍 Verificar Configuração

### 1. Verificar Portas Abertas
```bash
docker-compose ps
```

### 2. Testar Frontend
```bash
curl http://localhost:9091
```

### 3. Testar Backend
```bash
curl http://localhost:3001/health
```

### 4. Testar CORS
```bash
curl -H "Origin: http://localhost:9091" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:3001/api/auth/login \
     -v
```

Resposta esperada deve incluir:
```
< Access-Control-Allow-Origin: http://localhost:9091
< Access-Control-Allow-Credentials: true
< Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

## ⚠️ Problemas Comuns

### Erro: "CORS policy blocked"
**Causa**: Origin não está na lista permitida

**Solução**:
1. Verificar se está acessando via `http://localhost:9091`
2. Verificar variável `FRONTEND_URL` no container:
   ```bash
   docker-compose exec app env | grep FRONTEND_URL
   ```
3. Adicionar sua origin em `backend/src/server.js`

### Erro: "Port already in use"
**Causa**: Porta 9091 ou 3001 já está sendo usada

**Solução**:
```bash
# Verificar qual processo está usando a porta
sudo lsof -i :9091
sudo lsof -i :3001

# Matar o processo OU alterar as portas no .env
APP_PORT=8080 BACKEND_PORT=3002 docker-compose up -d
```

### Frontend não carrega
**Causa**: Container não iniciou corretamente

**Solução**:
```bash
# Ver logs
docker-compose logs app

# Reiniciar
docker-compose restart app
```

## 📊 Diagrama de Rede

```
┌─────────────────────────────────────────────┐
│  Host (Seu Computador)                      │
│                                              │
│  Browser → http://localhost:9091            │
│           ↓                                  │
│  ┌───────────────────────────────────────┐  │
│  │  Docker Network                       │  │
│  │                                       │  │
│  │  estacionamento-app                   │  │
│  │  ┌─────────────┐  ┌─────────────┐   │  │
│  │  │ Nginx :80   │→ │ Node :3000  │   │  │
│  │  │ (Frontend)  │  │ (Backend)   │   │  │
│  │  └─────────────┘  └─────────────┘   │  │
│  │         ↑                ↓           │  │
│  │    Porta 9091      Porta 3001       │  │
│  │                         ↓            │  │
│  │               ┌─────────────┐       │  │
│  │               │ PostgreSQL  │       │  │
│  │               │   :5432     │       │  │
│  │               └─────────────┘       │  │
│  │                    ↑                 │  │
│  │               Porta 5430             │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## 🎯 Recomendações

### Para Desenvolvimento
```bash
# Use o servidor Angular standalone
ng serve
# Acesse: http://localhost:4200

# Backend separado
cd backend && npm run dev
# API em: http://localhost:3000
```

### Para Produção (Docker)
```bash
# Use Docker Compose
docker-compose up -d
# Acesse: http://localhost:9091

# API disponível (para monitoramento):
# http://localhost:3001
```

### Segurança em Produção
1. **Não exponha** a porta 3001 (backend) publicamente
2. **Use HTTPS** com certificado SSL
3. **Altere** o `JWT_SECRET`
4. **Restrinja** os `allowedOrigins` apenas aos domínios necessários
5. **Use** um proxy reverso (nginx, traefik) na frente do Docker

## 📚 Mais Informações

- [docker-compose.yml](docker-compose.yml) - Configuração principal
- [README-DOCKER.md](README-DOCKER.md) - Guia completo Docker
- [.env.example](.env.example) - Variáveis de ambiente
- [backend/src/server.js](backend/src/server.js) - Configuração CORS

---

**Última atualização**: 2025-10-28
**Versão**: 2.0 (Portas 9091/3001 com CORS fixo)
