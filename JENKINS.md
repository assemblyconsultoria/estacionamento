# Configuração CI/CD com Jenkins

Este documento descreve como configurar e usar a pipeline CI/CD do Jenkins para o Sistema de Gerenciamento de Estacionamento.

## Pré-requisitos

- Jenkins instalado e rodando em http://localhost:9090
- Credenciais: usuário `fabio` / senha `F4bio#242`
- Plugins necessários instalados no Jenkins:
  - Pipeline
  - Git
  - Docker Pipeline
  - Credentials Binding
  - Timestamper
  - AnsiColor (opcional, para logs coloridos)

## Configuração Inicial do Jenkins

### 1. Instalar Plugins Necessários

1. Acesse Jenkins: http://localhost:9090
2. Faça login com `fabio` / `F4bio#242`
3. Vá em **Manage Jenkins** > **Plugin Manager**
4. Na aba **Available plugins**, instale:
   - Pipeline
   - Git plugin
   - Docker Pipeline
   - Credentials Binding Plugin
   - Timestamper
   - JUnit Plugin (para relatórios de testes)

### 2. Configurar Credenciais

As credenciais são armazenadas de forma segura no Jenkins:

1. Vá em **Manage Jenkins** > **Credentials** > **System** > **Global credentials**
2. Clique em **Add Credentials**

#### Credencial 1: Senha do PostgreSQL

- **Kind**: Secret text
- **Scope**: Global
- **Secret**: `postgres123` (ou sua senha)
- **ID**: `estacionamento-db-password`
- **Description**: Database password for estacionamento

#### Credencial 2: JWT Secret

- **Kind**: Secret text
- **Scope**: Global
- **Secret**: Gere um secret seguro, ex: `meu-jwt-secret-super-seguro-12345`
- **ID**: `estacionamento-jwt-secret`
- **Description**: JWT secret for estacionamento API

#### Credencial 3: GitHub (se repositório privado)

- **Kind**: Username with password
- **Scope**: Global
- **Username**: Seu usuário GitHub
- **Password**: Personal Access Token do GitHub
- **ID**: `github-credentials`
- **Description**: GitHub credentials

### 3. Criar o Job da Pipeline

1. No Dashboard do Jenkins, clique em **New Item**
2. Digite o nome: `estacionamento-pipeline`
3. Selecione **Pipeline** e clique em **OK**

#### Configurações do Job

**Aba General:**
- ✅ **Discard old builds**
  - Days to keep builds: `30`
  - Max # of builds to keep: `10`
- **Description**: `CI/CD Pipeline para Sistema de Gerenciamento de Estacionamento`

**Aba Build Triggers:**
- ✅ **Poll SCM**: `H/5 * * * *` (verifica mudanças a cada 5 minutos)
- ✅ **GitHub hook trigger for GITScm polling** (se configurar webhook)

**Aba Pipeline:**
- **Definition**: Pipeline script from SCM
- **SCM**: Git
  - **Repository URL**: `https://github.com/assemblyconsultoria/estacionamento.git`
  - **Credentials**: Selecione `github-credentials` (se privado) ou deixe em branco (se público)
  - **Branch Specifier**: `*/main`
- **Script Path**: `Jenkinsfile`
- ✅ **Lightweight checkout**

Clique em **Save**

## Estrutura da Pipeline

A pipeline é composta por várias etapas (stages):

### 1. Checkout
- Clona o repositório Git
- Obtém informações do commit e autor

### 2. Environment Info
- Verifica versões de Node.js, npm, Docker e Docker Compose

### 3. Install Dependencies (Paralelo)
- **Frontend**: Instala dependências do Angular
- **Backend**: Instala dependências do Node.js

### 4. Lint & Code Quality (Paralelo)
- Executa linting no frontend e backend

### 5. Run Tests (Paralelo)
- **Frontend**: Testes unitários com Karma/Jasmine
- **Backend**: Testes do Node.js (se configurados)

### 6. Build Frontend
- Compila a aplicação Angular para produção
- Gera arquivos otimizados em `dist/`

### 7. Build Docker Images
- Cria imagem Docker unificada (frontend + backend)
- Tag com número do build e `latest`

### 8. Stop Previous Deployment
- Para containers em execução do deploy anterior

### 9. Deploy
- Cria arquivo `.env` com configurações
- Inicia containers com `docker-compose up -d`

### 10. Health Check
- Verifica se backend está respondendo em `/health`
- Verifica se frontend está acessível

### 11. Smoke Tests
- Testa endpoint de registro de usuário
- Valida funcionamento básico da API

## Executando a Pipeline

### Executar Manualmente

1. Acesse o job: http://localhost:9090/job/estacionamento-pipeline/
2. Clique em **Build Now**
3. Acompanhe o progresso em **Build History** > **Console Output**

### Execução Automática

A pipeline será executada automaticamente quando:
- Houver push no branch `main` (se webhook configurado)
- A cada 5 minutos (poll SCM ativo)

## Monitoramento e Logs

### Ver Status da Pipeline

1. Dashboard do job mostra:
   - ✅ Último build bem-sucedido
   - ❌ Último build falho
   - Gráfico de tendência de builds
   - Duração média

### Acessar Logs

1. Clique no número do build (ex: `#5`)
2. Clique em **Console Output** para ver logs completos
3. Use **Pipeline Steps** para ver cada stage individualmente

### Visualização Blue Ocean (Opcional)

Se instalado o plugin Blue Ocean:
1. Clique em **Open Blue Ocean**
2. Visualização moderna com stages em paralelo
3. Logs mais legíveis e organizados

## Configurar Webhook do GitHub (Opcional)

Para builds instantâneos ao fazer push:

### No GitHub

1. Vá no repositório > **Settings** > **Webhooks**
2. Clique em **Add webhook**
3. **Payload URL**: `http://SEU-IP:9090/github-webhook/`
4. **Content type**: `application/json`
5. **Events**: Marque `Just the push event`
6. Clique em **Add webhook**

### No Jenkins

1. No job, vá em **Configure**
2. Em **Build Triggers**, marque:
   - ✅ **GitHub hook trigger for GITScm polling**
3. Salve

## Variáveis de Ambiente

A pipeline usa as seguintes variáveis (configuradas no Jenkinsfile):

| Variável | Valor Padrão | Descrição |
|----------|--------------|-----------|
| `DB_NAME` | `estacionamento` | Nome do banco PostgreSQL |
| `DB_USER` | `postgres` | Usuário do banco |
| `DB_PASSWORD` | *credential* | Senha do banco (via credential) |
| `JWT_SECRET` | *credential* | Secret para tokens JWT |
| `APP_PORT` | `9091` | Porta do frontend |
| `BACKEND_PORT` | `3001` | Porta do backend |
| `DB_PORT` | `5430` | Porta do PostgreSQL |

Para alterar valores padrão, edite o `Jenkinsfile` na seção `environment`.

## Troubleshooting

### Build Falha na Instalação de Dependências

**Problema**: `npm ci` falha

**Solução**:
```bash
# No servidor Jenkins, execute:
node --version  # Deve ser v20+
npm --version   # Deve ser v10+
```

Se versões estiverem erradas, instale Node.js 20:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Build Falha no Docker

**Problema**: `docker: command not found`

**Solução**:
1. Instale Docker no servidor Jenkins
2. Adicione usuário Jenkins ao grupo docker:
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Credenciais Não Encontradas

**Problema**: `No such credential: estacionamento-db-password`

**Solução**:
1. Verifique se criou as credenciais corretamente
2. Confirme que o **ID** está exato:
   - `estacionamento-db-password`
   - `estacionamento-jwt-secret`

### Health Check Falha

**Problema**: `curl: (7) Failed to connect`

**Solução**:
```bash
# Verifique se containers estão rodando
docker-compose ps

# Verifique logs
docker-compose logs app

# Teste manualmente
curl http://localhost:3001/health
curl http://localhost:9091/
```

### Porta em Uso

**Problema**: `Error: Port 9091 is already in use`

**Solução**:
```bash
# Encontre processo usando a porta
sudo lsof -i :9091

# Pare deployment anterior
docker-compose down

# Ou mude a porta no .env
```

## Limpeza e Manutenção

### Limpar Builds Antigos

Configurado automaticamente para manter apenas 10 builds.

### Limpar Imagens Docker Antigas

A pipeline limpa automaticamente imagens antigas no `post success`, mantendo as 3 últimas versões.

Para limpeza manual:
```bash
# Remover imagens sem tag
docker image prune -f

# Remover todas imagens não usadas
docker system prune -a
```

### Resetar Workspace

```bash
# No servidor Jenkins
cd /var/lib/jenkins/workspace/estacionamento-pipeline
rm -rf *
```

Ou pelo Jenkins:
1. Job > **Workspace** > **Wipe Out Current Workspace**

## Melhorias Futuras

- [ ] Adicionar análise de código com SonarQube
- [ ] Testes de integração
- [ ] Testes E2E com Cypress/Playwright
- [ ] Deploy em ambientes de staging/production
- [ ] Notificações por email/Slack
- [ ] Métricas e relatórios de cobertura de código
- [ ] Rollback automático em caso de falha
- [ ] Deploy blue-green ou canary

## Referências

- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [Docker Pipeline Plugin](https://plugins.jenkins.io/docker-workflow/)
- [Jenkins Credentials](https://www.jenkins.io/doc/book/using/using-credentials/)
