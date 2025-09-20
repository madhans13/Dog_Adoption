#!/bin/bash

echo "🧹 Cleaning up unwanted files..."

# Remove documentation files
echo "Removing documentation files..."
rm -f API_DOCUMENTATION.md
rm -f CI_CD_IMPROVEMENTS.md
rm -f CONDITIONAL_BUILD_LOGIC.md
rm -f CIVO_MIGRATION_GUIDE.md
rm -f FIXED_LANDING_PAGE.md
rm -f IMAGE_SETUP.md
rm -f LANDING_PAGE_README.md
rm -f LANDING_PAGE_SETUP_COMPLETE.md
rm -f RESCUED_DOGS_SETUP.md
rm -f ROUTING_FLOW.md
rm -f ROUTING_STRUCTURE.md
rm -f SETUP_GUIDE.md
rm -f SETUP_INSTRUCTIONS.md
rm -f SETUP.md

# Remove database files
echo "Removing database files..."
rm -f add_missing_columns.sql
rm -f check_users.sql
rm -f create_admin_user_manual.sql
rm -f create_admin_user.sql
rm -f create_tables.sql
rm -f database_backup.sql
rm -f database_schema.sql
rm -f database_setup.sql
rm -f test_admin.js

# Remove build artifacts
echo "Removing build artifacts..."
rm -rf build/
rm -rf node_modules/
rm -rf backend/node_modules/
rm -f prisma/dev.db

# Remove test images
echo "Removing test images..."
rm -rf uploads/
rm -f hero.png
rm -f landingpage.png
rm -f test-image.jpg

# Remove development files
echo "Removing development files..."
rm -f backend/src/simpleApp.js
rm -f backend/src/testApp.js
rm -f entrypoint.sh
rm -rf "head text/"
rm -rf "Web Fonts/"
rm -f values.yaml
rm -f traefik-deployment.yaml
rm -f traefik-rbac.yaml
rm -f kind-config.yaml

# Remove redundant config files
echo "Removing redundant config files..."
rm -f env.template
rm -f components.json

echo "✅ Cleanup complete!"
echo "📊 Space saved: Check with 'du -sh .' before and after"


