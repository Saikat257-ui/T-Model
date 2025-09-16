# T-Model Platform - Setup & Installation Guide

## 🎯 Project Overview

The T-Model Platform is a comprehensive multi-industry business management system supporting Tour Management, Travel Services, and Logistics & Shipping industries with a shared base layer and industry-specific vertical implementations.

## 📋 Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher
- **Supabase Account**: For database and storage
- **Git**: For version control

## 🚀 Quick Setup

### Option 1: Automated Setup (Windows)
```bash
# Run the automated setup script
setup.bat
```

### Option 2: Manual Setup

#### 1. Clone and Install Dependencies

```bash
# Backend setup
cd backend
npm install

# Frontend setup
cd ../frontend
npm install
```

#### 2. Environment Configuration

**Backend Environment** (`backend/.env`):
```env
# Server Configuration
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=7d

# Supabase Database Configuration
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase Configuration
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_KEY=your_supabase_service_role_key_here

# Supabase Storage Configuration
SUPABASE_STORAGE_BUCKET=t-model-platform-files
SUPABASE_STORAGE_URL=https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/

# File Upload Settings
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend Environment** (`frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:5000/api
GENERATE_SOURCEMAP=false
```

#### 3. Database Setup

```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Push database schema to Supabase
npm run prisma:push

# Seed database with initial data
npm run prisma:seed
```

## 🔧 Development Commands

### Backend Commands
```bash
cd backend

# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database commands
npm run prisma:generate    # Generate Prisma client
npm run prisma:push       # Push schema to database
npm run prisma:studio     # Open Prisma Studio
npm run prisma:seed       # Seed database with initial data

# Database seeding
npm run db:seed           # Alternative seed command
```

### Frontend Commands
```bash
cd frontend

# Development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject (not recommended)
npm run eject
```

## 🗃️ Database Schema

The platform uses a comprehensive PostgreSQL schema with:

### Core Tables
- `users` - User authentication and profiles
- `industries` - Available business types (Tour, Travel, Logistics, Other)
- `user_profiles` - Extended user information

### Industry-Specific Tables
- **Tour Management**: `tour_packages`, `tour_bookings`
- **Travel Services**: `travel_bookings`, `travel_documents`
- **Logistics**: `shipments`, `vehicles`, `shipment_tracking`

### Gamification System
- `user_progress` - User progress tracking
- `badges` - Achievement badges
- `user_badges` - Earned badges
- `achievements` - User achievements
- `leaderboards` - Ranking system

## 🎮 Initial Data Seeding

The seed script creates:
- **4 Industries**: Tour Management, Travel Services, Logistics & Shipping, Other Industries
- **15 Badges**: 5 badges per industry with different categories (Achievement, Milestone, Special, Revenue)
- **Gamification Framework**: Progress tracking and achievement system

## 🔐 Supabase Configuration

### 1. Create Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create new project: `t-model-platform`
3. Note down your credentials:
   - Project URL
   - Anon Key
   - Service Role Key
   - Database Password

### 2. Storage Setup
The system automatically creates storage buckets:
- `t-model-platform-files` - Main file storage
- Organized folders: `documents/`, `avatars/`, `tour/`, `travel/`, `logistics/`

## 🚦 Starting the Application

### Development Mode
```bash
# Terminal 1: Start Backend API Server
cd backend
npm run dev
# Server runs on http://localhost:5000

# Terminal 2: Start Frontend React App
cd frontend
npm start
# App runs on http://localhost:3000
```

### Production Mode
```bash
# Build both applications
cd t-model-platform/backend; npm run build
cd t-model-platform/frontend; npm run build

# Start production server
cd t-model-platform/backend; npm start
```