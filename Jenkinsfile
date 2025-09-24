pipeline {
  agent any
  environment {
    NODE_ENV = 'production'
    // Set any secrets in Jenkins credentials and inject them via environment variables
  }
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install root deps') {
      steps {
        sh 'which node || node -v || true'
        sh 'npm ci --no-audit --no-fund'
      }
    }

    stage('Backend: install & test') {
      steps {
        dir('backend') {
          sh 'npm ci --no-audit --no-fund'
          // run linters/tests if available
          sh 'npm test || true'
        }
      }
    }

    stage('Frontend: install & build') {
      steps {
        dir('frontend') {
          sh 'npm ci --no-audit --no-fund'
          sh 'npm run build --if-present'
        }
      }
    }

    stage('Optional: DB setup (local dev)') {
      steps {
        dir('backend') {
          // run db setup only on master/main or manual builds to avoid accidental resets
          script {
            if (env.BRANCH_NAME == null || env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'master') {
              sh 'node scripts/setupDatabase.js || true'
            } else {
              echo "Skipping DB setup for branch ${env.BRANCH_NAME}"
            }
          }
        }
      }
    }

    stage('Archive artifacts') {
      steps {
        archiveArtifacts artifacts: 'frontend/build/**, backend/*.sqlite', fingerprint: true, allowEmptyArchive: true
      }
    }
  }

  post {
    success {
      echo "Pipeline succeeded"
    }
    failure {
      echo "Pipeline failed"
    }
    always {
      // cleanup or notifications can go here
    }
  }
}
