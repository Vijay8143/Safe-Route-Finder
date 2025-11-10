apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: saferoute
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      imagePullSecrets:
        - name: acr-secret
      containers:
        - name: frontend
          image: ${ACR_LOGIN_SERVER}/safroute/frontend:${IMAGE_TAG}
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 80
          readinessProbe:
            httpGet:
              path: /
              port: 80
            initialDelaySeconds: 5
            periodSeconds: 10
