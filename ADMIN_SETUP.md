# Instruções de Configuração do Sistema de Administração

## ✅ Status da Implementação

Todas as funcionalidades de administração foram implementadas e testadas com sucesso!

## 🔧 Configuração Inicial

### Para Banco de Dados Existente

Se você já tinha o banco de dados rodando antes desta atualização, precisa aplicar a migration:

```bash
# Aplicar migration para adicionar campo is_admin
PGPASSWORD=postgres123 psql -U postgres -h localhost -d estacionamento -f backend/database/migration_add_admin.sql
```

Isso irá:
- ✅ Adicionar o campo `is_admin` na tabela `users`
- ✅ Criar índice para otimização
- ✅ Tornar o primeiro usuário registrado um administrador automaticamente

### Para Nova Instalação

Se você está instalando pela primeira vez, o Docker já configurará tudo automaticamente.

## 👤 Credenciais de Acesso

### Usuário Administrador Padrão (Docker)
Quando você inicia o sistema com Docker, o usuário admin é criado automaticamente:
- **Usuário**: `admin`
- **Senha**: `admin123`
- **Tipo**: Administrador (is_admin = true)

**IMPORTANTE**: Este usuário é criado automaticamente pelo script `docker-init.sql` na primeira inicialização do container do banco de dados.

## 🚀 Como Usar

### 1. Acessar o Sistema

```bash
# Certifique-se de que o backend e frontend estão rodando
# Backend: http://localhost:3000
# Frontend: http://localhost:4200
```

### 2. Primeiro Acesso (Sistema Novo)

Se não houver usuários no sistema:
1. Acesse `http://localhost:4200`
2. Clique no botão **"Primeiro Acesso"** (aparece automaticamente)
3. Crie o primeiro usuário (será admin automaticamente)

### 3. Login como Administrador

1. Acesse `http://localhost:4200`
2. Entre com:
   - Usuário: `admin`
   - Senha: `admin123`
3. Você verá o botão **"Admin"** no header (visível apenas para admins)

### 4. Gerenciar Usuários

1. Clique no botão **"Admin"** no header
2. No modal de administração você pode:
   - ✏️ **Editar** nome de usuário
   - 🔑 **Resetar senha** de qualquer usuário
   - 🗑️ **Excluir** usuários (exceto você mesmo)
   - 👁️ Ver quais usuários são administradores (badge azul)

## 🔒 Funcionalidades de Segurança

### Implementadas
- ✅ Primeiro usuário automaticamente é admin
- ✅ JWT com campo `isAdmin` para autorização
- ✅ Middleware `requireAdmin` protege rotas administrativas
- ✅ Admin não pode deletar a si mesmo
- ✅ Admin não pode resetar sua própria senha pelo painel
- ✅ Senhas hasheadas com bcrypt (10 rounds)
- ✅ Validações de entrada no frontend e backend

## 📊 Endpoints da API

### Públicos
```bash
# Verificar se existem usuários
GET /api/auth/check-users

# Registrar novo usuário (primeiro é admin automaticamente)
POST /api/auth/register
{
  "username": "nome",
  "password": "senha123"
}

# Login
POST /api/auth/login
{
  "username": "admin",
  "password": "admin123"
}
```

### Protegidos (Requerem Admin)
```bash
# Listar todos os usuários
GET /api/auth/users
Header: Authorization: Bearer {token}

# Editar usuário
PUT /api/auth/users/:id
Header: Authorization: Bearer {token}
Body: { "username": "novo_nome" }

# Resetar senha
POST /api/auth/users/:id/reset-password
Header: Authorization: Bearer {token}
Body: { "newPassword": "nova_senha" }

# Excluir usuário
DELETE /api/auth/users/:id
Header: Authorization: Bearer {token}
```

## 🧪 Testes Realizados

Todos os endpoints foram testados e estão funcionando:
- ✅ Verificação de existência de usuários
- ✅ Login com admin (isAdmin: true no token)
- ✅ Listagem de usuários
- ✅ Edição de nome de usuário
- ✅ Reset de senha
- ✅ Exclusão de usuário
- ✅ Primeiro usuário se torna admin automaticamente

## 🐳 Docker

O sistema está pronto para Docker:
- ✅ docker-init.sql atualizado com campo is_admin
- ✅ Schema do banco atualizado
- ✅ Dockerfile configurado

Para subir com Docker:
```bash
docker-compose up -d
```

## 🔄 Próximos Passos

1. **Altere a senha padrão** do usuário admin
2. **Configure JWT_SECRET** no .env do backend
3. **Crie backup** do banco de dados regularmente

## ⚠️ Notas Importantes

- A migration é **idempotente** - pode ser executada múltiplas vezes sem causar erros
- Usuários criados após o primeiro **não são admins** por padrão
- O campo `is_admin` pode ser alterado diretamente no banco se necessário
- Em produção, altere a senha padrão e o JWT_SECRET

## 📝 Estrutura do Banco de Dados

```sql
-- Tabela users atualizada
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,  -- NOVO CAMPO
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para otimização
CREATE INDEX idx_users_is_admin ON users(is_admin);
```

## 🎉 Pronto!

O sistema de administração está completamente funcional e pronto para uso!
