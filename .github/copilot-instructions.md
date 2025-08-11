# Lake Stash - Cabin Inventory Management System

Lake Stash is a mobile-first React web application for tracking and managing cabin inventory items with Azure Static Web Apps hosting and Azure Functions backend. The system allows users to manage supplies with categories, quantities, status tracking (Enough, Low, Buy, Bring), and collaborative features.

**ALWAYS** reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap and Setup
- Install dependencies: `npm install` -- takes ~60 seconds, includes security vulnerabilities but builds successfully
- Install API dependencies: `cd api && npm install` -- takes ~2 seconds
- **CRITICAL**: Azure Functions Core Tools cannot be installed in this environment due to network restrictions. Use the development server instead.

### Building and Testing
- Build application: `npm run build` -- takes ~1.5 seconds. NEVER CANCEL. Timeout: 60+ seconds for safety.
- Lint code: `npm run lint` -- takes ~1 second. CURRENTLY HAS LINTING ERRORS in API files (CommonJS vs ESModules and unused variables). Linting errors do not break the build.
- **NO UNIT TESTS EXIST** -- Neither main package.json nor API package.json have test scripts (API shows "No tests yet...")
- **SECURITY VULNERABILITIES**: npm audit shows 6 vulnerabilities (5 low, 1 critical) - this is expected and doesn't prevent builds

### Development Environment
- Start frontend only: `npm run dev` -- starts in ~200ms on http://localhost:5173/
- Start API only: `npm run dev:api` -- starts immediately on http://localhost:7071 with mock authentication
- **RECOMMENDED**: Start full development: `npm run dev:full` -- runs both frontend and API concurrently
- Preview production build: `npm run preview` -- serves built application on http://localhost:4173/

### Azure Static Web Apps CLI (Alternative Method)
- **SWA CLI with static build + dev API**: `npx swa start dist --api-devserver-url http://localhost:7071`
  - Requires `npm run build` first and `npm run dev:api` running separately
  - Runs on http://localhost:4280 with Azure Static Web Apps emulation
- **SWA CLI CANNOT run full-stack mode** -- Azure Functions Core Tools installation fails due to network restrictions
- Use `npm run dev:full` for the most reliable development experience

### Development API Endpoints (Mock Authentication)
All development API calls work without authentication and use mock user "dev-user-123":
- GET /api/auth/user -- returns mock authenticated user info
- GET /api/inventory -- list all inventory items
- POST /api/inventory -- create new item (requires: name, quantity)
- PUT /api/inventory/:id -- update existing item
- DELETE /api/inventory/:id -- delete item

## Validation

### ALWAYS run these validation steps after making changes:
1. **Build validation**: `npm run build` -- must complete successfully
2. **Development server**: `npm run dev:full` -- both servers must start without errors
3. **API functionality test**:
   ```bash
   # Test authentication
   curl -s http://localhost:7071/api/auth/user | python3 -m json.tool
   
   # Test CRUD operations
   curl -s http://localhost:7071/api/inventory
   curl -s -X POST http://localhost:7071/api/inventory \
     -H "Content-Type: application/json" \
     -d '{"name": "Test Item", "quantity": 5, "category": "Pantry", "status": "Enough"}'
   ```
4. **Manual UI testing scenarios**:
   - Visit http://localhost:5173/ and verify the application loads
   - Test adding a new inventory item through the web interface
   - Test editing an existing item's quantity and status
   - Test filtering items by category
   - Test deleting items
   - Verify all CRUD operations work end-to-end

### Code Quality
- ALWAYS run `npm run lint` before committing -- currently fails with 37 problems (36 errors, 1 warning)
- Linting errors are in API files due to Node.js/CommonJS vs ESModule conflicts
- Linting errors do not prevent the application from building and running successfully

## Repository Structure

### Frontend (`/src`)
- Built with React + Vite
- Main components: App.jsx, InventoryApp.jsx, InventoryItem.jsx, etc.
- Responsive mobile-first design
- Proxy configuration for API calls in vite.config.js

### Backend (`/api`)
- Azure Functions using Node.js
- CosmosDB integration for production
- Development server (`/dev-server.js`) for local testing
- Authentication via Azure Static Web Apps (production) or mock (development)

### Key Configuration Files
- `package.json` -- main application dependencies and scripts
- `api/package.json` -- API dependencies
- `staticwebapp.config.json` -- Azure Static Web Apps configuration with authentication
- `swa-cli.config.json` -- SWA CLI configuration
- `vite.config.js` -- Vite build configuration with API proxy
- `eslint.config.js` -- ESLint configuration (currently has issues with API files)

## Common Tasks

### Starting Development
```bash
npm install
cd api && npm install
cd ..
npm run dev:full
# Servers start on http://localhost:5173/ (frontend) and http://localhost:7071 (API)
```

### Building for Production
```bash
npm run build
# Output goes to /dist folder
# Build time: ~2 seconds
```

### Azure Static Web Apps Deployment
- Automatic deployment via GitHub Actions (.github/workflows/azure-static-web-apps-ci-cd.yml)
- Triggers on push to main branch and pull requests
- Uses Node.js 18, npm ci, npm run build
- Deploys frontend from /dist and API from /api

### Development vs Production Authentication
- **Development**: Uses mock authentication with "dev-user-123" user
- **Production**: Uses Azure Active Directory authentication via Static Web Apps
- All routes require authentication in production (configured in staticwebapp.config.json)

## Frequently Referenced Files

### Repository Root Structure
```
.
├── .github/workflows/azure-static-web-apps-ci-cd.yml  # CI/CD pipeline
├── .vscode/                                           # VS Code settings
├── README.md                                          # Basic setup instructions
├── prd.md                                            # Detailed product requirements
├── package.json                                      # Main dependencies and scripts
├── vite.config.js                                    # Vite configuration
├── eslint.config.js                                  # Linting configuration
├── staticwebapp.config.json                          # Azure Static Web Apps config
├── swa-cli.config.json                              # SWA CLI configuration
├── dev-server.js                                     # Development API server
├── index.html                                        # HTML entry point
├── src/                                              # React application source
├── api/                                              # Azure Functions API
├── public/                                           # Static assets
└── dist/                                             # Build output (generated)
```

### Key Commands Reference
```bash
# Install all dependencies
npm install && cd api && npm install && cd ..

# Development (recommended)
npm run dev:full      # Runs both frontend and API

# Individual servers
npm run dev           # Frontend only (http://localhost:5173/)
npm run dev:api       # API only (http://localhost:7071)

# Build and preview
npm run build         # Build for production (~2 seconds)
npm run preview       # Preview production build
npm run lint          # Lint code (currently fails)

# Azure Static Web Apps CLI
npx swa start         # Alternative way to run full stack
npx swa --help        # SWA CLI documentation
```

### Common Development Patterns
- All inventory data is scoped to authenticated users
- Categories: Pantry, Fresh Food, Household, Personal Care, etc.
- Status values: Enough, Low, Buy, Bring
- Each item has: name, quantity, unit, category, status, notes, timestamps
- Mock development data persists only for the current session
- Real production data uses CosmosDB with user partitioning

## Troubleshooting

### Known Issues
- **Linting fails** with 37 problems in API files -- this is expected and doesn't break builds
- **Azure Functions Core Tools cannot be installed** -- use dev-server.js instead
- **Security vulnerabilities in npm packages** -- 6 vulnerabilities (5 low, 1 critical) but app builds successfully

### Common Solutions
- If builds fail, check Node.js version (tested with v20.19.4)
- If API calls fail in development, ensure `npm run dev:api` is running on port 7071
- If frontend doesn't load, ensure `npm run dev` is running on port 5173
- Use `npm run dev:full` to avoid port conflicts and run both servers

### Time Expectations
- **NEVER CANCEL** any build command
- npm install: ~60 seconds
- npm run build: ~1.5 seconds  
- Server startup: <1 second each
- Linting: ~1 second

### Manual UI Testing Scenarios (Required After Changes)
After making any changes, ALWAYS test these complete user workflows:

1. **Basic Inventory Management**:
   - Start full development: `npm run dev:full`
   - Visit http://localhost:5173/
   - Verify application loads without errors (should see inventory interface)
   - Add a new inventory item: name="Test Bread", quantity=2, category="Pantry", status="Enough"
   - Verify item appears in the inventory list
   - Edit the item: change quantity to 1, status to "Low"
   - Verify changes are saved and displayed
   - Delete the item and verify it's removed

2. **Category and Status Filtering**:
   - Add multiple items with different categories: "Pantry", "Fresh Food", "Household"
   - Add items with different statuses: "Enough", "Low", "Buy", "Bring"
   - Test search/filter functionality if available
   - Verify items display correctly with their categories and status

3. **Data Persistence Within Session**:
   - Add several inventory items
   - Refresh the page (should maintain items within development session)
   - Navigate away and back to verify data persistence

**Note**: Development uses mock authentication - no actual login required. Production uses Azure AD authentication.