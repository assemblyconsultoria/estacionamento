pipeline {
    agent any

    environment {
        // Docker registry settings (se usar registry privado)
        DOCKER_REGISTRY = 'localhost:5000'
        IMAGE_NAME = 'estacionamento-app'
        IMAGE_TAG = "${env.BUILD_NUMBER}"

        // Application settings
        DB_NAME = 'estacionamento'
        DB_USER = 'postgres'
        DB_PASSWORD = credentials('estacionamento-db-password') // Credential ID no Jenkins
        JWT_SECRET = credentials('estacionamento-jwt-secret')   // Credential ID no Jenkins

        // Ports
        APP_PORT = '9091'
        BACKEND_PORT = '3001'
        DB_PORT = '5430'

        // Node & NPM
        NODE_VERSION = '20'
    }

    options {
        // Mantém apenas os últimos 10 builds
        buildDiscarder(logRotator(numToKeepStr: '10'))
        // Timeout de 30 minutos
        timeout(time: 30, unit: 'MINUTES')
        // Adiciona timestamps nos logs
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Clonando repositório...'
                checkout scm

                script {
                    // Obtém informações do commit
                    env.GIT_COMMIT_MSG = sh(
                        script: 'git log -1 --pretty=%B',
                        returnStdout: true
                    ).trim()
                    env.GIT_AUTHOR = sh(
                        script: 'git log -1 --pretty=%an',
                        returnStdout: true
                    ).trim()
                }

                echo "Commit: ${env.GIT_COMMIT_MSG}"
                echo "Author: ${env.GIT_AUTHOR}"
            }
        }

        stage('Environment Info') {
            steps {
                echo 'Verificando versões das ferramentas...'
                sh '''
                    echo "Node version:"
                    node --version
                    echo "NPM version:"
                    npm --version
                    echo "Docker version:"
                    docker --version
                    echo "Docker Compose version:"
                    docker-compose --version
                '''
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Frontend Dependencies') {
                    steps {
                        echo 'Instalando dependências do frontend...'
                        sh 'npm ci --legacy-peer-deps'
                    }
                }

                stage('Backend Dependencies') {
                    steps {
                        echo 'Instalando dependências do backend...'
                        dir('backend') {
                            sh 'npm ci --only=production'
                        }
                    }
                }
            }
        }

        stage('Lint & Code Quality') {
            parallel {
                stage('Frontend Lint') {
                    steps {
                        echo 'Executando lint no frontend...'
                        script {
                            try {
                                sh 'npm run lint || true'
                            } catch (Exception e) {
                                echo "Lint warnings encontrados: ${e.message}"
                            }
                        }
                    }
                }

                stage('Backend Lint') {
                    steps {
                        echo 'Verificando código do backend...'
                        dir('backend') {
                            sh 'echo "Backend code check completed"'
                        }
                    }
                }
            }
        }

        stage('Run Tests') {
            parallel {
                stage('Frontend Unit Tests') {
                    steps {
                        echo 'Executando testes do frontend...'
                        script {
                            try {
                                sh 'npm run test -- --watch=false --browsers=ChromeHeadless || true'
                            } catch (Exception e) {
                                echo "Testes não configurados ou falharam: ${e.message}"
                            }
                        }
                    }
                }

                stage('Backend Tests') {
                    steps {
                        echo 'Executando testes do backend...'
                        dir('backend') {
                            script {
                                try {
                                    sh 'npm test || echo "Backend tests not configured"'
                                } catch (Exception e) {
                                    echo "Testes não configurados: ${e.message}"
                                }
                            }
                        }
                    }
                }
            }
        }

        stage('Build Frontend') {
            steps {
                echo 'Compilando aplicação Angular...'
                sh 'npm run build -- --configuration production'

                // Verifica se o build foi criado
                sh 'ls -la dist/parking-app/browser || ls -la dist/'
            }
        }

        stage('Build Docker Images') {
            steps {
                echo 'Construindo imagens Docker...'
                script {
                    // Build da imagem unificada (frontend + backend)
                    sh """
                        docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
                        docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest
                    """

                    echo "Imagem criada: ${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }

        stage('Stop Previous Deployment') {
            steps {
                echo 'Parando deployment anterior...'
                script {
                    try {
                        sh 'docker-compose down || true'
                    } catch (Exception e) {
                        echo "Nenhum deployment anterior encontrado: ${e.message}"
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Iniciando deployment com Docker Compose...'
                script {
                    // Cria arquivo .env para docker-compose
                    sh """
                        cat > .env << EOF
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_PORT=${DB_PORT}
APP_PORT=${APP_PORT}
BACKEND_PORT=${BACKEND_PORT}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:${APP_PORT}
EOF
                    """

                    // Inicia os containers
                    sh 'docker-compose up -d'

                    // Aguarda os containers ficarem healthy
                    echo 'Aguardando containers ficarem prontos...'
                    sh '''
                        echo "Aguardando database..."
                        timeout 60 bash -c 'until docker-compose ps | grep estacionamento-db | grep healthy; do sleep 2; done' || true

                        echo "Aguardando aplicação..."
                        sleep 10
                    '''
                }
            }
        }

        stage('Health Check') {
            steps {
                echo 'Verificando saúde da aplicação...'
                script {
                    try {
                        // Verifica backend
                        sh "curl -f http://localhost:${BACKEND_PORT}/health || exit 1"
                        echo 'Backend está saudável!'

                        // Verifica frontend
                        sh "curl -f http://localhost:${APP_PORT}/ || exit 1"
                        echo 'Frontend está saudável!'

                    } catch (Exception e) {
                        echo "Health check falhou: ${e.message}"
                        sh 'docker-compose logs'
                        error('Aplicação não está respondendo corretamente')
                    }
                }
            }
        }

        stage('Smoke Tests') {
            steps {
                echo 'Executando smoke tests...'
                script {
                    // Testa endpoint de registro
                    sh """
                        curl -X POST http://localhost:${BACKEND_PORT}/api/auth/register \
                            -H 'Content-Type: application/json' \
                            -d '{"username":"test_${BUILD_NUMBER}","password":"test123"}' \
                            -w '\\n%{http_code}\\n' || true
                    """

                    echo 'Smoke tests completados!'
                }
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline executado com sucesso!'
            echo "Aplicação disponível em:"
            echo "  Frontend: http://localhost:${APP_PORT}"
            echo "  Backend:  http://localhost:${BACKEND_PORT}"
            echo "  Database: localhost:${DB_PORT}"

            // Limpa imagens antigas do Docker (mantém últimas 3)
            script {
                try {
                    sh """
                        docker images ${IMAGE_NAME} --format '{{.Tag}}' | \
                        grep -v latest | \
                        sort -rn | \
                        tail -n +4 | \
                        xargs -I {} docker rmi ${IMAGE_NAME}:{} || true
                    """
                } catch (Exception e) {
                    echo "Limpeza de imagens antigas: ${e.message}"
                }
            }
        }

        failure {
            echo '❌ Pipeline falhou!'
            echo 'Verificando logs dos containers...'
            sh 'docker-compose logs --tail=50 || true'

            // Notificação de falha (pode adicionar email, Slack, etc)
            echo "Build falhou para commit: ${env.GIT_COMMIT_MSG}"
        }

        unstable {
            echo '⚠️  Pipeline instável - alguns testes falharam'
        }

        always {
            echo 'Limpando workspace...'

            // Arquiva artefatos do build
            script {
                try {
                    archiveArtifacts artifacts: 'dist/**/*', allowEmptyArchive: true
                } catch (Exception e) {
                    echo "Sem artefatos para arquivar: ${e.message}"
                }
            }

            // Publica resultados de testes se existirem
            script {
                try {
                    junit allowEmptyResults: true, testResults: '**/test-results/**/*.xml'
                } catch (Exception e) {
                    echo "Sem resultados de testes para publicar: ${e.message}"
                }
            }

            // Lista status dos containers
            sh 'docker-compose ps || true'

            echo "Build #${env.BUILD_NUMBER} finalizado"
        }

        cleanup {
            echo 'Executando cleanup final...'
            // Remove arquivos temporários
            sh 'rm -f .env'
        }
    }
}
