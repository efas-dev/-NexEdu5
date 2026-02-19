#!/bin/bash

# ============================================================================
# NexEdu Backend - Script de Testes Automatizados
# ============================================================================
# Este script valida todos os endpoints implementados no backend, verificando:
# - Autenticação e autorização
# - CRUD de turmas
# - Registro e consulta de presença
# - Sistema de mensagens
# - Endpoints dos pais
# ============================================================================

# Configurações
BASE_URL="http://localhost:3000"
TIMESTAMP=$(date +%s)

# Credenciais dinâmicas (evita conflito com dados existentes)
PROF_LOGIN="prof_teste_${TIMESTAMP}"
ALUNO_LOGIN="aluno_teste_${TIMESTAMP}"
PAI_LOGIN="pai_teste_${TIMESTAMP}"
ADMIN_LOGIN="admin_teste_${TIMESTAMP}"
SENHA="123456"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Contadores
PASSED=0
FAILED=0
TOTAL=0

# IDs criados durante os testes
PROF_ID=""
ALUNO_ID=""
PAI_ID=""
ADMIN_ID=""
TURMA_ID=""
MESSAGE_ID=""

# Tokens
TOKEN_PROF=""
TOKEN_ALUNO=""
TOKEN_PAI=""
TOKEN_ADMIN=""

# ============================================================================
# Funções Auxiliares
# ============================================================================

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_section() {
    echo ""
    echo -e "${CYAN}[$1]${NC} $2"
    echo "----------------------------------------"
}

# Função para testar endpoint
test_endpoint() {
    local name="$1"
    local expected_code="$2"
    local actual_code="$3"

    ((TOTAL++))

    if [ "$actual_code" -eq "$expected_code" ]; then
        echo -e "${GREEN}✓ PASS${NC}: $name (HTTP $actual_code)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}: $name (esperado: $expected_code, recebido: $actual_code)"
        ((FAILED++))
        return 1
    fi
}

# Função para fazer requisição e capturar código HTTP
do_request() {
    local method="$1"
    local endpoint="$2"
    local token="$3"
    local data="$4"

    if [ -n "$token" ] && [ -n "$data" ]; then
        curl -s -w "\n%{http_code}" --max-time 10 -X "$method" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d "$data" \
            "${BASE_URL}${endpoint}"
    elif [ -n "$token" ]; then
        curl -s -w "\n%{http_code}" --max-time 10 -X "$method" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            "${BASE_URL}${endpoint}"
    elif [ -n "$data" ]; then
        curl -s -w "\n%{http_code}" --max-time 10 -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "${BASE_URL}${endpoint}"
    else
        curl -s -w "\n%{http_code}" --max-time 10 -X "$method" \
            "${BASE_URL}${endpoint}"
    fi
}

# Extrai código HTTP da resposta
get_http_code() {
    echo "$1" | tail -n1
}

# Extrai body da resposta
get_body() {
    echo "$1" | sed '$d'
}

# Extrai valor de um campo JSON
extract_json_field() {
    local json="$1"
    local field="$2"
    echo "$json" | grep -o "\"$field\":[^,}]*" | head -1 | sed 's/.*://' | tr -d ' "'
}

# Extrai ID de resposta JSON
extract_id() {
    local json="$1"
    echo "$json" | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://'
}

# Extrai token de resposta JSON
extract_token() {
    local json="$1"
    echo "$json" | grep -o '"token":"[^"]*"' | head -1 | sed 's/"token":"//' | sed 's/"$//'
}

# ============================================================================
# Verificação Inicial
# ============================================================================

check_server() {
    print_section "1/9" "Verificando servidor..."

    local response=$(curl -s -w "\n%{http_code}" --max-time 5 -X GET "${BASE_URL}/" 2>/dev/null || echo -e "\n000")
    local code=$(get_http_code "$response")

    if [ "$code" == "200" ]; then
        test_endpoint "Servidor rodando na porta 3000" 200 200
    else
        echo -e "${RED}✗ ERRO: Servidor não está rodando em ${BASE_URL}${NC}"
        echo -e "${YELLOW}  Execute: cd backend && npm run dev${NC}"
        exit 1
    fi
}

check_dependencies() {
    if ! command -v curl &> /dev/null; then
        echo -e "${RED}✗ ERRO: curl não está instalado${NC}"
        exit 1
    fi
}

# ============================================================================
# Testes de Autenticação
# ============================================================================

test_auth() {
    print_section "2/9" "Autenticação..."

    # Registrar professor
    local response=$(do_request "POST" "/auth/register" "" "{\"name\":\"Professor Teste\",\"login\":\"$PROF_LOGIN\",\"password\":\"$SENHA\",\"role\":\"PROFESSOR\"}")
    local code=$(get_http_code "$response")
    local body=$(get_body "$response")
    test_endpoint "Registrar professor" 201 "$code"
    PROF_ID=$(extract_id "$body")

    # Registrar aluno
    response=$(do_request "POST" "/auth/register" "" "{\"name\":\"Aluno Teste\",\"login\":\"$ALUNO_LOGIN\",\"password\":\"$SENHA\",\"role\":\"ALUNO\"}")
    code=$(get_http_code "$response")
    body=$(get_body "$response")
    test_endpoint "Registrar aluno" 201 "$code"
    ALUNO_ID=$(extract_id "$body")

    # Registrar pai
    response=$(do_request "POST" "/auth/register" "" "{\"name\":\"Pai Teste\",\"login\":\"$PAI_LOGIN\",\"password\":\"$SENHA\",\"role\":\"PAI\"}")
    code=$(get_http_code "$response")
    body=$(get_body "$response")
    test_endpoint "Registrar pai" 201 "$code"
    PAI_ID=$(extract_id "$body")

    # Registrar admin
    response=$(do_request "POST" "/auth/register" "" "{\"name\":\"Admin Teste\",\"login\":\"$ADMIN_LOGIN\",\"password\":\"$SENHA\",\"role\":\"ADMIN\"}")
    code=$(get_http_code "$response")
    body=$(get_body "$response")
    test_endpoint "Registrar admin" 201 "$code"
    ADMIN_ID=$(extract_id "$body")

    # Login professor
    response=$(do_request "POST" "/auth/login" "" "{\"login\":\"$PROF_LOGIN\",\"password\":\"$SENHA\"}")
    code=$(get_http_code "$response")
    body=$(get_body "$response")
    test_endpoint "Login professor" 200 "$code"
    TOKEN_PROF=$(extract_token "$body")

    # Login aluno
    response=$(do_request "POST" "/auth/login" "" "{\"login\":\"$ALUNO_LOGIN\",\"password\":\"$SENHA\"}")
    code=$(get_http_code "$response")
    body=$(get_body "$response")
    test_endpoint "Login aluno" 200 "$code"
    TOKEN_ALUNO=$(extract_token "$body")

    # Login pai
    response=$(do_request "POST" "/auth/login" "" "{\"login\":\"$PAI_LOGIN\",\"password\":\"$SENHA\"}")
    code=$(get_http_code "$response")
    body=$(get_body "$response")
    test_endpoint "Login pai" 200 "$code"
    TOKEN_PAI=$(extract_token "$body")

    # Login admin
    response=$(do_request "POST" "/auth/login" "" "{\"login\":\"$ADMIN_LOGIN\",\"password\":\"$SENHA\"}")
    code=$(get_http_code "$response")
    body=$(get_body "$response")
    test_endpoint "Login admin" 200 "$code"
    TOKEN_ADMIN=$(extract_token "$body")

    # Teste de login inválido
    response=$(do_request "POST" "/auth/login" "" "{\"login\":\"usuario_inexistente\",\"password\":\"senha_errada\"}")
    code=$(get_http_code "$response")
    test_endpoint "Login inválido retorna 401" 401 "$code"
}

# ============================================================================
# Testes de Turmas
# ============================================================================

test_turmas() {
    print_section "3/9" "Turmas..."

    # Criar turma
    local response=$(do_request "POST" "/turmas" "$TOKEN_PROF" "{\"nome\":\"5A Teste\",\"serie\":\"5º ano\",\"turno\":\"MANHA\",\"anoLetivo\":2024}")
    local code=$(get_http_code "$response")
    local body=$(get_body "$response")
    test_endpoint "Criar turma" 201 "$code"
    TURMA_ID=$(extract_id "$body")

    # Listar turmas
    response=$(do_request "GET" "/turmas" "$TOKEN_PROF")
    code=$(get_http_code "$response")
    test_endpoint "Listar turmas" 200 "$code"

    # Buscar turma por ID
    response=$(do_request "GET" "/turmas/$TURMA_ID" "$TOKEN_PROF")
    code=$(get_http_code "$response")
    test_endpoint "Buscar turma por ID" 200 "$code"

    # Atualizar turma
    response=$(do_request "PUT" "/turmas/$TURMA_ID" "$TOKEN_PROF" "{\"nome\":\"5A Atualizada\"}")
    code=$(get_http_code "$response")
    test_endpoint "Atualizar turma" 200 "$code"

    # Vincular aluno à turma
    response=$(do_request "POST" "/turmas/$TURMA_ID/alunos" "$TOKEN_PROF" "{\"alunoIds\":[$ALUNO_ID]}")
    code=$(get_http_code "$response")
    test_endpoint "Vincular aluno à turma" 201 "$code"

    # Listar alunos da turma
    response=$(do_request "GET" "/turmas/$TURMA_ID/alunos" "$TOKEN_PROF")
    code=$(get_http_code "$response")
    test_endpoint "Listar alunos da turma" 200 "$code"

    # Vincular professor à turma
    response=$(do_request "POST" "/turmas/$TURMA_ID/professores" "$TOKEN_PROF" "{\"professorId\":$PROF_ID,\"disciplina\":\"Matemática\"}")
    code=$(get_http_code "$response")
    test_endpoint "Vincular professor à turma" 201 "$code"
}

# ============================================================================
# Testes de Vínculo Pai-Aluno
# ============================================================================

test_parent_link() {
    print_section "4/9" "Vínculo Pai-Aluno..."

    # Vincular pai ao aluno
    local response=$(do_request "POST" "/parent/link" "$TOKEN_PROF" "{\"parentId\":$PAI_ID,\"studentId\":$ALUNO_ID,\"parentesco\":\"PAI\",\"principal\":true}")
    local code=$(get_http_code "$response")
    test_endpoint "Vincular pai ao aluno" 201 "$code"
}

# ============================================================================
# Testes de Presença
# ============================================================================

test_attendance() {
    print_section "5/9" "Presença..."

    local TODAY=$(date +%Y-%m-%d)

    # Registrar presenças em lote
    local response=$(do_request "POST" "/attendance/bulk" "$TOKEN_PROF" "{\"turmaId\":$TURMA_ID,\"data\":\"$TODAY\",\"presencas\":[{\"alunoId\":$ALUNO_ID,\"presente\":true}]}")
    local code=$(get_http_code "$response")
    test_endpoint "Registrar presenças em lote" 201 "$code"

    # Consultar presenças da turma por data
    response=$(do_request "GET" "/attendance/turma/$TURMA_ID/date/$TODAY" "$TOKEN_PROF")
    code=$(get_http_code "$response")
    test_endpoint "Consultar presenças da turma por data" 200 "$code"

    # Histórico de presença do aluno (professor)
    response=$(do_request "GET" "/attendance/student/$ALUNO_ID" "$TOKEN_PROF")
    code=$(get_http_code "$response")
    test_endpoint "Histórico de presença do aluno (professor)" 200 "$code"

    # Resumo de presença do aluno (professor)
    response=$(do_request "GET" "/attendance/student/$ALUNO_ID/summary" "$TOKEN_PROF")
    code=$(get_http_code "$response")
    test_endpoint "Resumo de presença do aluno (professor)" 200 "$code"

    # Histórico de presença do aluno (pai)
    response=$(do_request "GET" "/attendance/student/$ALUNO_ID" "$TOKEN_PAI")
    code=$(get_http_code "$response")
    test_endpoint "Histórico de presença do aluno (pai)" 200 "$code"

    # Resumo de presença do aluno (pai)
    response=$(do_request "GET" "/attendance/student/$ALUNO_ID/summary" "$TOKEN_PAI")
    code=$(get_http_code "$response")
    test_endpoint "Resumo de presença do aluno (pai)" 200 "$code"
}

# ============================================================================
# Testes de Mensagens
# ============================================================================

test_messages() {
    print_section "6/9" "Mensagens..."

    # Enviar mensagem individual (professor)
    local response=$(do_request "POST" "/messages" "$TOKEN_PROF" "{\"titulo\":\"Aviso Individual\",\"conteudo\":\"Conteúdo da mensagem individual\",\"categoria\":\"AVISO\",\"alunoId\":$ALUNO_ID}")
    local code=$(get_http_code "$response")
    local body=$(get_body "$response")
    test_endpoint "Enviar mensagem individual (professor)" 201 "$code"
    MESSAGE_ID=$(extract_id "$body")

    # Enviar mensagem para turma (broadcast)
    response=$(do_request "POST" "/messages/broadcast" "$TOKEN_PROF" "{\"titulo\":\"Aviso para Turma\",\"conteudo\":\"Conteúdo do aviso para toda a turma\",\"categoria\":\"COMUNICADO\",\"turmaId\":$TURMA_ID}")
    code=$(get_http_code "$response")
    test_endpoint "Enviar mensagem para turma (broadcast)" 201 "$code"

    # Enviar mensagem global (admin)
    response=$(do_request "POST" "/messages/global" "$TOKEN_ADMIN" "{\"titulo\":\"Aviso Global\",\"conteudo\":\"Conteúdo do aviso global\",\"categoria\":\"URGENTE\"}")
    code=$(get_http_code "$response")
    test_endpoint "Enviar mensagem global (admin)" 201 "$code"

    # Listar mensagens enviadas (professor)
    response=$(do_request "GET" "/messages/sent" "$TOKEN_PROF")
    code=$(get_http_code "$response")
    test_endpoint "Listar mensagens enviadas (professor)" 200 "$code"

    # Listar inbox (pai)
    response=$(do_request "GET" "/messages/inbox" "$TOKEN_PAI")
    code=$(get_http_code "$response")
    test_endpoint "Listar inbox (pai)" 200 "$code"

    # Contar mensagens não lidas (pai)
    response=$(do_request "GET" "/messages/unread-count" "$TOKEN_PAI")
    code=$(get_http_code "$response")
    test_endpoint "Contar mensagens não lidas (pai)" 200 "$code"

    # Marcar mensagem como lida (pai)
    response=$(do_request "PUT" "/messages/$MESSAGE_ID/read" "$TOKEN_PAI")
    code=$(get_http_code "$response")
    test_endpoint "Marcar mensagem como lida (pai)" 200 "$code"
}

# ============================================================================
# Testes dos Endpoints do Pai
# ============================================================================

test_parent_endpoints() {
    print_section "7/9" "Endpoints do Pai..."

    # Listar filhos
    local response=$(do_request "GET" "/parent/children" "$TOKEN_PAI")
    local code=$(get_http_code "$response")
    test_endpoint "Listar filhos" 200 "$code"

    # Buscar frequência do filho
    response=$(do_request "GET" "/parent/children/$ALUNO_ID/attendance" "$TOKEN_PAI")
    code=$(get_http_code "$response")
    test_endpoint "Buscar frequência do filho" 200 "$code"

    # Dashboard do pai
    response=$(do_request "GET" "/parent/dashboard" "$TOKEN_PAI")
    code=$(get_http_code "$response")
    test_endpoint "Dashboard do pai" 200 "$code"
}

# ============================================================================
# Testes de Autorização (devem retornar 403)
# ============================================================================

test_authorization() {
    print_section "8/9" "Testes de Autorização (devem FALHAR com 403)..."

    # Aluno tentando acessar turmas
    local response=$(do_request "GET" "/turmas" "$TOKEN_ALUNO")
    local code=$(get_http_code "$response")
    test_endpoint "Aluno não pode listar turmas" 403 "$code"

    # Pai tentando registrar presença
    response=$(do_request "POST" "/attendance/bulk" "$TOKEN_PAI" "{\"turmaId\":$TURMA_ID,\"data\":\"2024-01-15\",\"presencas\":[]}")
    code=$(get_http_code "$response")
    test_endpoint "Pai não pode registrar presença" 403 "$code"

    # Professor tentando enviar mensagem global
    response=$(do_request "POST" "/messages/global" "$TOKEN_PROF" "{\"titulo\":\"Teste\",\"conteudo\":\"Teste\",\"categoria\":\"AVISO\"}")
    code=$(get_http_code "$response")
    test_endpoint "Professor não pode enviar mensagem global" 403 "$code"

    # Aluno tentando criar turma
    response=$(do_request "POST" "/turmas" "$TOKEN_ALUNO" "{\"nome\":\"Teste\",\"serie\":\"1º ano\",\"turno\":\"MANHA\",\"anoLetivo\":2024}")
    code=$(get_http_code "$response")
    test_endpoint "Aluno não pode criar turma" 403 "$code"

    # Pai tentando acessar inbox de professor
    response=$(do_request "GET" "/messages/sent" "$TOKEN_PAI")
    code=$(get_http_code "$response")
    test_endpoint "Pai não pode ver mensagens enviadas" 403 "$code"

    # Requisição sem token
    response=$(do_request "GET" "/turmas" "")
    code=$(get_http_code "$response")
    test_endpoint "Requisição sem token retorna 401" 401 "$code"
}

# ============================================================================
# Cleanup (opcional)
# ============================================================================

cleanup() {
    print_section "9/9" "Limpeza (deletando dados de teste)..."

    # Deletar turma
    if [ -n "$TURMA_ID" ]; then
        local response=$(do_request "DELETE" "/turmas/$TURMA_ID" "$TOKEN_PROF")
        local code=$(get_http_code "$response")
        test_endpoint "Deletar turma de teste" 200 "$code"
    fi

    # Deletar usuários (precisa de token de professor)
    if [ -n "$ALUNO_ID" ]; then
        response=$(do_request "DELETE" "/users/$ALUNO_ID" "$TOKEN_PROF")
        code=$(get_http_code "$response")
        test_endpoint "Deletar aluno de teste" 200 "$code"
    fi

    if [ -n "$PAI_ID" ]; then
        response=$(do_request "DELETE" "/users/$PAI_ID" "$TOKEN_PROF")
        code=$(get_http_code "$response")
        test_endpoint "Deletar pai de teste" 200 "$code"
    fi

    if [ -n "$ADMIN_ID" ]; then
        response=$(do_request "DELETE" "/users/$ADMIN_ID" "$TOKEN_PROF")
        code=$(get_http_code "$response")
        test_endpoint "Deletar admin de teste" 200 "$code"
    fi

    if [ -n "$PROF_ID" ]; then
        # Professor não pode deletar a si mesmo, vamos pular
        echo -e "${YELLOW}⚠ SKIP${NC}: Deletar professor de teste (auto-delete não permitido)"
    fi
}

# ============================================================================
# Resultado Final
# ============================================================================

print_results() {
    print_header "RESULTADO FINAL"

    local success_rate=0
    if [ $TOTAL -gt 0 ]; then
        success_rate=$((PASSED * 100 / TOTAL))
    fi

    echo -e "Total:    ${BLUE}$TOTAL${NC} testes"
    echo -e "Passou:   ${GREEN}$PASSED${NC}"
    echo -e "Falhou:   ${RED}$FAILED${NC}"
    echo ""

    if [ $success_rate -ge 90 ]; then
        echo -e "Taxa de sucesso: ${GREEN}${success_rate}%${NC}"
    elif [ $success_rate -ge 70 ]; then
        echo -e "Taxa de sucesso: ${YELLOW}${success_rate}%${NC}"
    else
        echo -e "Taxa de sucesso: ${RED}${success_rate}%${NC}"
    fi

    echo ""

    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}✓ Todos os testes passaram!${NC}"
    else
        echo -e "${RED}✗ Alguns testes falharam. Verifique os logs acima.${NC}"
    fi
}

# ============================================================================
# Execução Principal
# ============================================================================

main() {
    print_header "NexEdu Backend - Script de Testes"

    echo -e "Timestamp: ${CYAN}$TIMESTAMP${NC}"
    echo -e "Base URL:  ${CYAN}$BASE_URL${NC}"
    echo ""

    # Verifica dependências
    check_dependencies

    # Executa testes
    check_server
    test_auth
    test_turmas
    test_parent_link
    test_attendance
    test_messages
    test_parent_endpoints
    test_authorization

    # Pergunta se deve fazer cleanup
    echo ""
    echo -e "${YELLOW}Deseja deletar os dados de teste? (s/N)${NC}"
    read -r answer
    if [[ "$answer" =~ ^[Ss]$ ]]; then
        cleanup
    else
        echo -e "${CYAN}Dados de teste mantidos no banco.${NC}"
        echo -e "IDs criados:"
        echo -e "  Professor: $PROF_ID (login: $PROF_LOGIN)"
        echo -e "  Aluno:     $ALUNO_ID (login: $ALUNO_LOGIN)"
        echo -e "  Pai:       $PAI_ID (login: $PAI_LOGIN)"
        echo -e "  Admin:     $ADMIN_ID (login: $ADMIN_LOGIN)"
        echo -e "  Turma:     $TURMA_ID"
    fi

    # Resultado final
    print_results

    # Exit code baseado no resultado
    if [ $FAILED -gt 0 ]; then
        exit 1
    fi
    exit 0
}

# Executa o script
main "$@"
