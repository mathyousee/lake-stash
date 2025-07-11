# Lake Stash - React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Development

```bash
npm install
npm run dev
```

## Deployment

This app is deployed to Azure Static Web Apps with automatic GitHub Actions CI/CD.

### Manual Deployment
```bash
npm run build
npx swa deploy ./dist --env production
```

### Automatic Deployment
The app automatically deploys to production when you push to the `main` branch via GitHub Actions.

### Setting up GitHub Actions

1. **Add the deployment token to GitHub Secrets:**
   - Go to your GitHub repository
   - Navigate to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - Value: `6dd9dba8c620e4732401c94f26e452ada60eb90082bacc98dc3fd5274840123801-06addbf9-1d4a-4c59-bd37-c5dcb411387a010001702010ca10`

2. **The workflow will automatically:**
   - Build and deploy on pushes to `main`
   - Create preview deployments for pull requests
   - Clean up preview deployments when PRs are closed

## Authentication

The app uses Azure Active Directory authentication. All routes require authentication as configured in `staticwebapp.config.json`.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
