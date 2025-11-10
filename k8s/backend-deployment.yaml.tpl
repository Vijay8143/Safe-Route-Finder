apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: saferoute
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      imagePullSecrets:
        - name: acr-secret
      containers:
        - name: backend
          image: ${ACR_LOGIN_SERVER}/safroute/backend:${IMAGE_TAG}
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 5000
          env:
            - name: NODE_ENV
              value: "production"
            - name: PORT
              value: "5000"
          readinessProbe:
            httpGet:
              path: /health
              port: 5000
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /health
              port: 5000
            initialDelaySeconds: 15
            periodSeconds: 20
