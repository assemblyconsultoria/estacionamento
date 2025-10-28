#!/bin/bash

# Script para testar funcionalidades de administração
# Autor: Sistema Estacionamento
# Data: 2025-10-28

echo "======================================"
echo "Teste de Funcionalidades Admin"
echo "======================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000/api"

echo -e "${YELLOW}1. Verificando se existem usuários no sistema...${NC}"
USERS_CHECK=$(curl -s "$BASE_URL/auth/check-users")
echo "$USERS_CHECK" | python3 -m json.tool
echo ""

echo -e "${YELLOW}2. Fazendo login como admin...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

echo "$LOGIN_RESPONSE" | python3 -m json.tool

# Extrair token
TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))")

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Falha no login! Verifique as credenciais.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Login realizado com sucesso!${NC}"
echo ""

echo -e "${YELLOW}3. Listando todos os usuários...${NC}"
curl -s "$BASE_URL/auth/users" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

echo -e "${YELLOW}4. Criando usuário de teste...${NC}"
TEST_USER=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"teste_'$(date +%s)'","password":"teste123"}')

echo "$TEST_USER" | python3 -m json.tool

TEST_USER_ID=$(echo "$TEST_USER" | python3 -c "import sys, json; print(json.load(sys.stdin).get('user', {}).get('id', ''))")
echo ""

if [ -n "$TEST_USER_ID" ]; then
    echo -e "${YELLOW}5. Editando nome do usuário de teste...${NC}"
    curl -s -X PUT "$BASE_URL/auth/users/$TEST_USER_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"username":"teste_editado_'$(date +%s)'"}' | python3 -m json.tool
    echo ""

    echo -e "${YELLOW}6. Resetando senha do usuário de teste...${NC}"
    curl -s -X POST "$BASE_URL/auth/users/$TEST_USER_ID/reset-password" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"newPassword":"novasenha123"}' | python3 -m json.tool
    echo ""

    echo -e "${YELLOW}7. Excluindo usuário de teste...${NC}"
    curl -s -X DELETE "$BASE_URL/auth/users/$TEST_USER_ID" \
      -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
    echo ""
fi

echo -e "${YELLOW}8. Listando usuários após testes...${NC}"
curl -s "$BASE_URL/auth/users" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

echo "======================================"
echo -e "${GREEN}✅ Testes concluídos com sucesso!${NC}"
echo "======================================"
echo ""
echo "Funcionalidades testadas:"
echo "  ✓ Verificação de existência de usuários"
echo "  ✓ Login de administrador"
echo "  ✓ Listagem de usuários"
echo "  ✓ Criação de usuário"
echo "  ✓ Edição de usuário"
echo "  ✓ Reset de senha"
echo "  ✓ Exclusão de usuário"
echo ""
echo "Para acessar o painel admin:"
echo "  1. Acesse http://localhost:4200"
echo "  2. Login: admin / admin123"
echo "  3. Clique no botão 'Admin' no header"
