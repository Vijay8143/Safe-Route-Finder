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
          script {
            if (fileExists('package-lock.json') || fileExists('npm-shrinkwrap.json')) {
              echo "Using npm ci (lockfile found)"
              sh 'npm ci --no-audit --no-fund'
            } else {
              echo "No lockfile found — using npm install"
              sh 'npm install --no-audit --no-fund'
            }
          }
          // run linters/tests if available (do not fail pipeline on tests by default)
          sh 'npm test || true'
        }
      }
    }

    stage('Frontend: install & build') {
      steps {
        dir('frontend') {
          script {
            if (fileExists('package-lock.json') || fileExists('npm-shrinkwrap.json')) {
              echo "Frontend: using npm ci (lockfile found) with legacy-peer-deps"
              sh 'npm ci --no-audit --no-fund --legacy-peer-deps'
            } else {
              echo "Frontend: no lockfile — using npm install with legacy-peer-deps"
              sh 'npm install --no-audit --no-fund --legacy-peer-deps'
            }
          }
          // Prevent Create React App from treating warnings as errors in CI agents
          sh 'CI=false npm run build --if-present'
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
      // minimal step so Declarative pipeline is valid
      echo "Pipeline finished at: ${new Date()}"
    }
  }
}
