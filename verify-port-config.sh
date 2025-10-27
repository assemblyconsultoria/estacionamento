#!/bin/bash

# PostgreSQL Port Configuration Verification Script
# This script verifies that the Docker configuration correctly uses port 5430

set -e

echo "=========================================="
echo "PostgreSQL Port Configuration Verification"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

success_count=0
fail_count=0

# Function to check a condition
check() {
    local description="$1"
    local command="$2"
    local expected="$3"

    echo -n "Checking: $description... "

    if eval "$command" | grep -q "$expected"; then
        echo -e "${GREEN}PASS${NC}"
        ((success_count++))
        return 0
    else
        echo -e "${RED}FAIL${NC}"
        echo "  Expected to find: $expected"
        ((fail_count++))
        return 1
    fi
}

echo "1. Configuration File Checks"
echo "----------------------------"

# Check docker-compose.yml
check "docker-compose.yml port mapping" \
    "grep 'DB_PORT:-5430' docker-compose.yml" \
    '5430.*5432'

check "docker-compose.yml backend DB_PORT" \
    "grep 'DB_PORT:' docker-compose.yml" \
    'DB_PORT: 5432'

# Check docker-compose.dev.yml
check "docker-compose.dev.yml port mapping" \
    "grep '5430:5432' docker-compose.dev.yml" \
    '5430:5432'

# Check .env.docker
check ".env.docker DB_PORT value" \
    "grep '^DB_PORT=' .env.docker" \
    'DB_PORT=5430'

echo ""
echo "2. Documentation Checks"
echo "----------------------"

# Check README.docker.md
check "README.docker.md mentions port 5430" \
    "grep -c '5430' README.docker.md" \
    '[1-9]'

check "README.docker.md architecture diagram" \
    "grep 'Port:' README.docker.md" \
    '5430:5432'

# Check DOCKER-QUICKSTART.md
check "DOCKER-QUICKSTART.md port configuration" \
    "grep 'DB_PORT=' DOCKER-QUICKSTART.md" \
    '5430'

# Check DOCKER-SETUP-SUMMARY.md
check "DOCKER-SETUP-SUMMARY.md port details" \
    "grep 'Port:' DOCKER-SETUP-SUMMARY.md" \
    '5430:5432'

# Check DOCKER-CHECKLIST.md
check "DOCKER-CHECKLIST.md port verification" \
    "grep 'lsof.*5430' DOCKER-CHECKLIST.md" \
    '5430'

echo ""
echo "3. Port Mapping Validation"
echo "-------------------------"

# Validate the docker-compose configuration
if command -v docker-compose &> /dev/null; then
    echo -n "Validating docker-compose configuration... "
    if docker-compose config > /dev/null 2>&1; then
        echo -e "${GREEN}PASS${NC}"
        ((success_count++))

        # Check the resolved port mapping
        echo -n "Checking resolved port mapping... "
        if docker-compose config | grep -A 3 "database:" | grep -q "5430"; then
            echo -e "${GREEN}PASS${NC}"
            ((success_count++))
        else
            echo -e "${RED}FAIL${NC}"
            ((fail_count++))
        fi
    else
        echo -e "${RED}FAIL${NC}"
        echo "  docker-compose config validation failed"
        ((fail_count++))
    fi
else
    echo -e "${YELLOW}SKIP${NC} - docker-compose not installed"
fi

echo ""
echo "4. Port Availability Check"
echo "-------------------------"

# Check if port 5430 is available or in use by PostgreSQL
echo -n "Checking port 5430 status... "
if command -v lsof &> /dev/null; then
    if sudo lsof -i :5430 &> /dev/null; then
        echo -e "${YELLOW}IN USE${NC} (This is OK if Docker is running)"
    else
        echo -e "${GREEN}AVAILABLE${NC}"
    fi
elif command -v netstat &> /dev/null; then
    if sudo netstat -tuln | grep -q ":5430 "; then
        echo -e "${YELLOW}IN USE${NC} (This is OK if Docker is running)"
    else
        echo -e "${GREEN}AVAILABLE${NC}"
    fi
else
    echo -e "${YELLOW}SKIP${NC} - lsof/netstat not available"
fi

echo ""
echo "5. Container Runtime Checks (if running)"
echo "---------------------------------------"

if command -v docker &> /dev/null && docker ps | grep -q "estacionamento-db"; then
    echo -n "Checking running database container port... "
    if docker port estacionamento-db 2>/dev/null | grep -q "5430"; then
        echo -e "${GREEN}PASS${NC}"
        ((success_count++))
    else
        echo -e "${RED}FAIL${NC}"
        echo "  Container is running but port mapping is incorrect"
        ((fail_count++))
    fi

    echo -n "Testing connection to database on port 5430... "
    if timeout 5 bash -c "echo > /dev/tcp/localhost/5430" 2>/dev/null; then
        echo -e "${GREEN}PASS${NC}"
        ((success_count++))
    else
        echo -e "${RED}FAIL${NC}"
        echo "  Cannot connect to localhost:5430"
        ((fail_count++))
    fi
else
    echo -e "${YELLOW}SKIP${NC} - Database container not running"
    echo "  Run 'docker-compose up -d' to start containers and test runtime"
fi

echo ""
echo "=========================================="
echo "Verification Summary"
echo "=========================================="
echo -e "Passed: ${GREEN}${success_count}${NC}"
echo -e "Failed: ${RED}${fail_count}${NC}"
echo ""

if [ $fail_count -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "Port configuration is correct:"
    echo "  - External port: 5430 (host access)"
    echo "  - Internal port: 5432 (container network)"
    echo ""
    echo "Connection examples:"
    echo "  From host:      psql -h localhost -p 5430 -U postgres -d estacionamento"
    echo "  From container: docker-compose exec database psql -U postgres -d estacionamento"
    exit 0
else
    echo -e "${RED}✗ Some checks failed!${NC}"
    echo ""
    echo "Please review the failed checks above and ensure:"
    echo "  1. All configuration files have been updated"
    echo "  2. Port mapping is set to 5430:5432 in docker-compose files"
    echo "  3. DB_PORT=5430 is set in .env.docker"
    echo "  4. Documentation reflects the port changes"
    exit 1
fi
