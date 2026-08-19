pipeline {
  agent any

  environment {
    IMAGE_REPO = credentials('genshield-ecr-repo')
    AWS_DEFAULT_REGION = 'ap-south-1'
    IMAGE_TAG = "${env.BUILD_NUMBER}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Backend Tests') {
      steps {
        dir('backend') {
          sh 'python -m pip install --upgrade pip'
          sh 'python -m pip install -r requirements-dev.txt'
          sh 'python -m pytest'
        }
      }
    }

    stage('Frontend Build') {
      steps {
        dir('frontend') {
          sh 'npm ci'
          sh 'npm run build'
        }
      }
    }

    stage('Docker Build') {
      steps {
        sh 'docker compose build'
      }
    }

    stage('Docker Push') {
      when {
        expression { return env.IMAGE_REPO?.trim() }
      }
      steps {
        sh 'aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $IMAGE_REPO'
        sh 'docker build -t $IMAGE_REPO/backend:$IMAGE_TAG ./backend'
        sh 'docker build -t $IMAGE_REPO/frontend:$IMAGE_TAG ./frontend'
        sh 'docker push $IMAGE_REPO/backend:$IMAGE_TAG'
        sh 'docker push $IMAGE_REPO/frontend:$IMAGE_TAG'
      }
    }

    stage('Deploy') {
      when {
        branch 'main'
      }
      steps {
        sh './deployment/deploy-ec2.sh $IMAGE_TAG'
      }
    }
  }
}
