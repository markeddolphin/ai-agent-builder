# AI Agent Builder - Frontend

React + Vite frontend for the AI Agent Builder application.

## Features

- **React 18** - Modern React with hooks
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS
- **React Query** - Data fetching and caching
- **React Router** - Client-side routing
- **Supabase Auth** - Authentication

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment variables:**
   Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:3001/api
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── services/      # API services
├── hooks/         # Custom React hooks
├── contexts/      # React contexts
├── types/         # TypeScript types
└── lib/           # Utilities and configs
```

## API Integration

The frontend communicates with the backend API for:
- Pipeline CRUD operations
- User authentication (via Supabase)
- Real-time data updates

## Development

- **Hot Module Replacement** - Instant updates during development
- **TypeScript** - Catch errors at compile time
- **ESLint** - Code quality and consistency
- **Tailwind CSS** - Rapid UI development 