# Limitless Horizons

A modern React application with authentication, built with Vite, Tailwind CSS, and Axios for API communication.

## 🚀 Features

- **Instagram-style Login Page** - Beautiful, responsive login interface
- **User Authentication** - Secure login/logout with token-based authentication
- **Home Dashboard** - Welcome page with onboarding status and quick actions
- **Onboarding Management** - View and manage all onboarding tasks
- **Onboarding Flow** - Multi-step onboarding process with progress tracking
- **Protected Routes** - Secure access to authenticated pages
- **API Integration** - Centralized API client with automatic token management
- **Django Backend Integration** - Connected to Django REST API backend
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **GitHub Pages Ready** - Automated deployment via GitHub Actions

## 🛠️ Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **Django** - Backend API (separate repository)

## 📦 Installation

```bash
# Install dependencies
npm install
```

## 🏃 Development

### Prerequisites

- **Node.js** (v18 or higher)
- **Django Backend** - The Django API server must be running locally

### Start Django Backend

Make sure your Django backend is running on `http://localhost:8000`:

```bash
# In your Django project directory
python manage.py runserver
```

The Django server should be accessible at `http://localhost:8000`

### Start React Development Server

```bash
npm run dev
```

The React app will be available at `http://localhost:5173`

### Environment Variables

Create a `.env` file in the root directory to configure the API URL:

```env
VITE_API_URL=http://localhost:8000
```

If not set, it defaults to `http://localhost:8000` (Django's default port).

**Note:** Vite requires the `VITE_` prefix for environment variables to be exposed to the client.

### Django Backend Requirements

The Django backend should provide the following endpoints:

- `POST /login/` - User login (expects `{ email, password }`, returns `{ token, user }`)
- `POST /logout/` - User logout (requires Bearer token)
- `GET /me/` - Get current user (requires Bearer token)

**CORS Configuration:** Make sure your Django backend has CORS configured to allow requests from `http://localhost:5173` during development.

## 🏗️ Build

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 🧪 Linting and Formatting

### Linting

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix
```

### Formatting

```bash
# Format all files
npm run format

# Check formatting without making changes
npm run format:check
```

### Combined Checks

```bash
# Run both linting and format checks
npm run check

# Auto-fix both linting and formatting issues
npm run check:fix
```

### Code Quality Tools

- **ESLint** - Code linting with React and React Hooks rules
- **Prettier** - Code formatting with consistent style
- **GitHub Actions CI** - Automated checks on pull requests

The project uses ESLint for code quality and Prettier for formatting. Both are configured to work together without conflicts.

## 🔄 Continuous Integration

This project uses GitHub Actions for CI/CD:

### CI Workflow

The CI workflow (`.github/workflows/ci.yml`) runs on:

- Pull requests to `main` or `develop` branches
- Pushes to `main` or `develop` branches

**Checks performed:**

- ESLint validation
- Prettier formatting check
- Build verification

### Branch Protection Setup

To ensure PRs can't merge until checks pass:

1. Go to your repository → **Settings** → **Branches**
2. Click **Add rule** or edit existing rule for `main` branch
3. Enable **Require status checks to pass before merging**
4. Select the required checks:
   - `lint-and-format` (from CI workflow)
   - `build-and-deploy` (from deploy workflow)
5. Optionally enable:
   - **Require branches to be up to date before merging**
   - **Require pull request reviews before merging**
6. Click **Save changes**

Now PRs will be blocked from merging if linting, formatting, or build checks fail.

## 📤 Deployment

### GitHub Pages (Automatic)

This project is configured for automatic deployment to GitHub Pages via GitHub Actions.

1. **Enable GitHub Pages:**
   - Go to your repository → Settings → Pages
   - Source: Select **"GitHub Actions"**
   - Save

2. **Push to main branch:**

   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

3. **Check deployment:**
   - Go to Actions tab in GitHub
   - The workflow will automatically:
     - Run linting checks
     - Check code formatting
     - Build the project
     - Deploy to GitHub Pages
   - Your site will be available at: `https://[username].github.io/[repository-name]/`

**Note:** The `base` path in `vite.config.js` is set to `/` for root-level deployment. Update it if deploying to a subdirectory.

**Important:** The deploy workflow includes linting and formatting checks. If these fail, the deployment will not proceed.

## 📁 Project Structure

```
reat/
├── public/              # Static assets
├── src/
│   ├── assets/         # Images and other assets
│   ├── services/       # API services and authentication
│   │   ├── apiClient.js    # Centralized Axios instance
│   │   └── authService.js  # Authentication functions
│   ├── App.jsx         # Main application component
│   ├── App.css         # Application styles
│   ├── index.css       # Global styles and Tailwind imports
│   └── main.jsx        # Application entry point
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Actions deployment workflow
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── package.json        # Project dependencies
```

## 🔧 Configuration

### Vite Configuration

The `vite.config.js` file contains:

- Base path for GitHub Pages deployment
- React plugin configuration
- Tailwind CSS plugin

### Tailwind CSS

This project uses **Tailwind CSS v4**, which supports custom variables in multiple ways:

#### Method 1: CSS Custom Properties (Recommended)

Define variables in `src/index.css`:

```css
:root {
  --color-primary: #646cff;
  --spacing-md: 1rem;
}
```

Use them directly:

```jsx
<div style={{ backgroundColor: 'var(--color-primary)' }}>Content</div>
```

#### Method 2: @theme Directive (Tailwind v4)

Define theme values in `src/index.css`:

```css
@theme {
  --color-brand-primary: #646cff;
  --spacing-custom-md: 1rem;
}
```

Use as Tailwind utilities:

```jsx
<div className="bg-brand-primary p-custom-md">Content</div>
```

#### Method 3: Extend Theme in Config

Define custom values in `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      'custom-primary': '#646cff',
    },
    spacing: {
      'custom-md': '1rem',
    },
  },
}
```

## 🔐 Authentication

The app uses token-based authentication with Django backend:

- **Login:** POST to `/login/` with email and password
- **Logout:** POST to `/logout/`
- **Get Current User:** GET `/me/`
- **Token Storage:** JWT tokens stored in `localStorage`
- **Auto Token Injection:** Axios interceptor automatically adds Bearer token to requests
- **Django Integration:** All endpoints expect Django REST Framework format with trailing slashes

## 🛣️ Routes

The application uses React Router for navigation:

### Public Routes

- `/login` - Login page (redirects to home if authenticated)

### Protected Routes (require authentication)

- `/` - Home page/Dashboard - Welcome page showing onboarding status
  - Shows "Resume Onboarding" button if onboarding is in progress
  - Shows "View All Onboardings" button if no onboarding in progress
- `/onboardings` - List all onboardings (pending, in progress, completed, pending review)
- `/onboarding/:id/step/:stepId` - Onboarding detail page
  - **In Progress:** Resumes from where user left off, allows editing
  - **Completed/Pending Review:** View-only mode showing all answers
  - Supports navigation between steps

### Other Routes

- `/dashboard` - Legacy dashboard page (still supported)
- `/404` - Not found page
- `/500` - Server error page

## 📝 API Client

The `apiClient.js` provides a centralized Axios instance with:

- Automatic base URL configuration from environment variables
- Request interceptor for adding authentication tokens
- Response interceptor for error handling
- Development logging for debugging

## 🎨 Styling

The app uses a custom color scheme:

- Primary: `#0F5E7B` (Dark teal)
- Accent: `#FFD350` (Yellow)
- Background: Gradient from `#61C8D0` to `#FFE596`

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For questions or issues, please contact the project maintainer.
