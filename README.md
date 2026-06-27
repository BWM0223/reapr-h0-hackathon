# TaskFlow AI

**H0: Hack the Zero Stack** submission — AI-powered task management platform built on AWS DynamoDB + Vercel.

## Live Demo
https://reapr-h0-hackathon.vercel.app

## Architecture

```
Vercel (Next.js 14)  ──▶  AWS DynamoDB
        │
        ▼
   OpenAI API (task AI)
```

## Stack
- **Frontend**: Next.js 14 App Router + Tailwind CSS on Vercel
- **Database**: AWS DynamoDB via `@aws-sdk/lib-dynamodb`
- **AI**: OpenAI GPT-4o for task prioritization and smart suggestions
- **Auth**: NextAuth.js with JWT

## Features
- Create, update, delete tasks with real-time sync
- AI-powered task prioritization (asks GPT-4o to rank by impact)
- Smart deadline suggestions based on task complexity
- Team collaboration with shared workspaces
- Full audit log stored in DynamoDB

## Local Setup

```bash
git clone https://github.com/BWM0223/reapr-h0-hackathon
cd reapr-h0-hackathon
npm install
cp .env.example .env.local
# Fill in AWS credentials and OpenAI key
npm run dev
```

## Environment Variables

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
DYNAMODB_TABLE_NAME=taskflow-tasks
OPENAI_API_KEY=your_openai_key
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

## DynamoDB Table Schema

```
Table: taskflow-tasks
PK: userId (String)
SK: taskId (String)
Attributes: title, description, priority, deadline, status, aiSuggestion, createdAt, updatedAt
```

## Why This Wins
1. **Real AWS DynamoDB** — not mocked, actual table with proper data model
2. **Production Vercel deploy** — CI/CD via GitHub integration
3. **AI that adds value** — GPT-4o ranks tasks by actual business impact
4. **Shippable today** — complete CRUD, auth, real-time updates

## Track
Open Innovation + Best Technical Implementation
