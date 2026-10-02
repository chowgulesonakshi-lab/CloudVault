pipeline {
    agent any

    environment {
        DATABASE_URL = 'postgresql://postgres:cloudvault123@localhost:5432/cloudvault'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/chowgulesonakshi-lab/CloudVault.git'
            }
        }

        stage('Backend Test') {
            steps {
                dir('backend') {
                    bat 'python -m pip install -r requirements.txt'
                    bat 'python -m pytest tests/test_app.py -k test_health'
                }
            }
        }

        stage('Frontend Build') {
            steps {
                dir('frontend') {
                    bat 'npm install'
                    bat 'npm run build'
                }
            }
        }

        stage('Docker Build') {
            steps {
                bat '''
                    set "PATH=C:\\Users\\Sonakshi\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin;%PATH%"
                    docker --version
                    docker build -t cloudvault-backend:latest backend
                '''
            }
        }

        stage('Kubernetes Deploy') {
            steps {
                bat '''
                    set "PATH=C:\\Users\\Sonakshi\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin;%PATH%"
                    set "KUBECONFIG=C:\\Users\\Sonakshi\\.kube\\config"

                    kubectl version --client
                    kubectl config use-context docker-desktop

                    kubectl create secret generic cloudvault-db-secret --from-literal=POSTGRES_PASSWORD=cloudvault123 --dry-run=client -o yaml | kubectl apply -f - --validate=false

                    kubectl apply -f k8s/postgres.yaml --validate=false
                    kubectl apply -f k8s/backend.yaml --validate=false
                    kubectl apply -f k8s/backend-service.yaml --validate=false
                '''
            }
        }

        stage('Verify') {
            steps {
                bat '''
                    set "PATH=C:\\Users\\Sonakshi\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin;%PATH%"
                    set "KUBECONFIG=C:\\Users\\Sonakshi\\.kube\\config"

                    kubectl get pods
                    kubectl get services
                '''
            }
        }
    }

    post {
        success {
            echo 'CloudVault CI/CD pipeline completed successfully!'
        }

        failure {
            echo 'CloudVault pipeline failed.'
        }
    }
}