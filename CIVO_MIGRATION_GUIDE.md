# Civo Migration Guide for Dog Adoption App

## ✅ Pre-Migration Checklist

### 1. **Current EKS Setup Verified**
- ✅ All pods running: Frontend (3), Backend (3), Database (1)
- ✅ Database backup created: `database_backup.sql` (24KB)
- ✅ Storage classes updated from `gp2` to `civo-volume`
- ✅ Image loading issues fixed with proper cache headers

### 2. **Manifests Updated for Civo**
- ✅ `k8s/Backend/StatefulSet.yaml` - storage class updated
- ✅ `k8s/Database/StatefulSet.yaml` - storage class updated  
- ✅ `k8s/Backend/uploadPvc.yaml` - storage class updated

## 🚀 Civo Migration Steps

### Step 1: Create Civo Cluster
```bash
# Install Civo CLI if not already installed
curl -sL https://civo.com/get | sh

# Login to Civo
civo auth login

# Create cluster (replace with your preferred name)
civo k8s create dog-adoption-civo --size g3.k3s.small --nodes 3 --region NYC1

# Get kubeconfig
civo k8s config dog-adoption-civo --save --merge
```

### Step 2: Install Nginx Ingress Controller
```bash
# Install Nginx Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml

# Wait for ingress controller to be ready
kubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=120s
```

### Step 3: Install cert-manager for SSL
```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Wait for cert-manager to be ready
kubectl wait --namespace cert-manager --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=120s
```

### Step 4: Deploy Application to Civo
```bash
# Create namespace
kubectl create namespace dog-adoption

# Deploy database first
kubectl apply -f k8s/Database/ConfigMap.yaml
kubectl apply -f k8s/Database/StatefulSet.yaml
kubectl apply -f k8s/Database/Service.yaml

# Wait for database to be ready
kubectl wait --namespace dog-adoption --for=condition=ready pod --selector=app=dog-rescue-db --timeout=300s

# Verify database is working
kubectl exec -n dog-adoption dog-rescue-db-0 -- psql -U postgres -d dog_rescue_db -c "SELECT 'Database ready!' as status;"

# Deploy backend
kubectl apply -f k8s/Backend/uploadPvc.yaml
kubectl apply -f k8s/Backend/StatefulSet.yaml
kubectl apply -f k8s/Backend/Service.yaml

# Deploy frontend
kubectl apply -f k8s/Frontend/Deployment.yaml
kubectl apply -f k8s/Frontend/Service.yaml

# Deploy ingress
kubectl apply -f k8s/Ingress/ClusterIssuer.yaml
kubectl apply -f k8s/Ingress/Ingress.yaml
```

### Step 5: Import Database
```bash
# Copy database backup to database pod
kubectl cp database_backup.sql dog-rescue-db-0:/tmp/database_backup.sql -n dog-adoption

# Import database (ignore errors about existing tables - this is expected)
kubectl exec -n dog-adoption dog-rescue-db-0 -- sh -c "psql -U postgres -d dog_rescue_db -f /tmp/database_backup.sql"
```

### Step 6: Get LoadBalancer IP and Update DNS
```bash
# Get the external IP of the ingress controller
kubectl get svc -n ingress-nginx

# Note the EXTERNAL-IP value
```

### Step 7: Update DNS in Name.com
1. Go to [Name.com DNS Management](https://www.name.com/account/domain/details/dog-adoption.dev)
2. Update A records:
   - `dog-adoption.dev` → `[CIVO_LOADBALANCER_IP]`
   - `www.dog-adoption.dev` → `[CIVO_LOADBALANCER_IP]`
3. Wait for DNS propagation (5-15 minutes)

### Step 8: Verify Application
```bash
# Test the application
curl -k https://dog-adoption.dev/health
curl -k https://dog-adoption.dev/api/dogs
```

## 🔧 Troubleshooting

### If pods fail to start:
```bash
# Check pod logs
kubectl logs -n dog-adoption <pod-name>

# Check events
kubectl get events -n dog-adoption --sort-by='.lastTimestamp'
```

### If storage issues:
```bash
# Check storage classes
kubectl get storageclass

# Check PVCs
kubectl get pvc -n dog-adoption
```

### If ingress issues:
```bash
# Check ingress status
kubectl get ingress -n dog-adoption

# Check ingress controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller
```

## 📋 Post-Migration Checklist

- [ ] All pods running in Civo cluster
- [ ] Database imported successfully
- [ ] Application accessible via https://dog-adoption.dev
- [ ] Images loading correctly
- [ ] SSL certificate working
- [ ] All functionality tested
- [ ] DNS updated and propagated
- [ ] EKS cluster can be safely deleted

## 💰 Cost Optimization

After successful migration:
1. Delete EKS cluster to stop AWS charges
2. Monitor Civo usage in dashboard
3. Consider right-sizing nodes based on actual usage

## 🆘 Rollback Plan

If issues occur:
1. Keep EKS cluster running until Civo is fully verified
2. Revert DNS to EKS LoadBalancer IP
3. Debug issues in Civo cluster
4. Fix and retry migration
