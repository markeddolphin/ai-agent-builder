# AI Agent Builder - Backend

Express.js + Drizzle ORM backend for the AI Agent Builder application.

## Features

- **Express.js** - Web framework
- **Drizzle ORM** - Type-safe database operations
- **PostgreSQL** - Database (via Supabase)
- **TypeScript** - Type safety
- **CORS** - Cross-origin support
- **REST API** - Clean API endpoints

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment variables:**
   Create a `.env` file:
   ```env
   DATABASE_URL=your_supabase_connection_string
   PORT=3001
   NODE_ENV=development
   ```

3. **Database setup:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run db:generate` - Generate database schema
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio

## Project Structure

```
src/
├── routes/         # API route handlers
├── services/       # Business logic
├── middleware/     # Express middleware
├── types/          # TypeScript types
└── db/             # Database schema and connection
```

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Pipelines
- `POST /api/pipelines` - Create a new pipeline
- `GET /api/pipelines` - Get all pipelines for a user
- `GET /api/pipelines/:id` - Get a specific pipeline
- `PUT /api/pipelines/:id` - Update a pipeline
- `DELETE /api/pipelines/:id` - Delete a pipeline

## Database

The backend uses Drizzle ORM with PostgreSQL hosted on Supabase:

- **Schema Management** - Drizzle Kit for migrations
- **Type Safety** - Full TypeScript support
- **Connection Pooling** - Optimized database connections
- **Row Level Security** - Data protection

## Development

- **Hot Reload** - Nodemon for automatic restarts
- **TypeScript** - Catch errors at compile time
- **ESLint** - Code quality and consistency
- **Database Studio** - Visual database management 