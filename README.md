# AI Agent Builder

A powerful platform for creating and managing AI pipelines with a modern, intuitive interface. Build custom text processing workflows with drag-and-drop functionality and real-time testing.

## Features

- **Pipeline Builder**: Create custom AI workflows with drag-and-drop interface
- **Real-time Testing**: Test your pipelines with live input and see results instantly
- **AI Assistant**: Get help building pipelines with our intelligent chat interface
- **User Authentication**: Secure user accounts with email confirmation
- **Dashboard**: Manage and organize your AI pipelines
- **Text Processing**: Summarize, translate, rewrite, and extract information from text

## What's Complete ✅

### Core Features
- **User Authentication**: Complete Supabase integration with email confirmation
- **Pipeline Builder**: Drag-and-drop interface with step configuration
- **AI Pipeline Execution**: Real-time text processing with Groq AI
- **Database Schema**: Complete PostgreSQL schema with Drizzle ORM
- **REST API**: Full backend API with Express.js
- **Frontend UI**: Modern React interface with Tailwind CSS

### AI Capabilities
- **Text Summarization**: Extract key points with configurable length and format
- **Translation**: Support for 30+ languages with language validation
- **Text Rewriting**: Style-based rewriting (professional, casual, creative)
- **Information Extraction**: Extract topics, keywords, and structured data
- **Pipeline Generation**: AI-powered pipeline creation from natural language descriptions

### Technical Implementation
- **Type Safety**: Full TypeScript implementation
- **Database**: PostgreSQL with Drizzle ORM and migrations
- **Authentication**: Supabase Auth with email confirmation flow
- **API**: RESTful backend with proper error handling
- **UI Components**: Reusable Radix UI components
- **State Management**: React hooks and context for state management

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (Supabase recommended)
- Groq API key for AI services

### 1. Clone and Install

```bash
git clone <repository-url>
cd ai-agent-builder-1
npm install
```

### 2. Environment Configuration

Create environment files for both frontend and backend:

**Backend (/backend/.env):**
```bash
cp backend/env.example backend/.env
```
```env
DATABASE_URL=your_supabase_connection_string
GROQ_API_KEY=your_groq_api_key
PORT=3001
NODE_ENV=development
```
**Frontend (/frontend/.env):**
```bash
cp frontend/env.example frontend/.env
```
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PORT=3001
```

### 3. Database Setup

```bash
# Generate and push database schema
npm run db:generate
npm run db:push

# Optional: Open Drizzle Studio for database management
npm run db:studio
```

### 4. Start Development Servers

```bash
# Start both frontend and backend concurrently
npm run dev

# Or start individually:
npm run dev:frontend  # Frontend on http://localhost:5173
npm run dev:backend   # Backend on http://localhost:3001
```