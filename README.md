AI Resume Evaluation Platform

## Why I Built This
I recently started working with Next.js, TypeScript, Prisma, and PostgreSQL at work, and I wanted to go beyond just using them in small tasks. I decided to build a full stack application from scratch so I could properly understand how these technologies work together in a real system.

Instead of following a tutorial, I wanted to design everything myself. From setting up the database schema to building the API routes and handling AI responses, the goal was to learn by actually building an end to end project.

I also wanted the project to be practical. A resume evaluator is something people can use in their day to day life, while still being complex enough to explore more advanced engineering concepts.

Another major goal was to understand how real world AI systems are integrated into applications. I did not want to just call an API and return raw text. I wanted to design a proper evaluation pipeline with structured outputs, validation, normalization, and reproducibility.

My goal was to treat the AI as part of the system architecture, not just a black box.
I wanted to fully own the architecture and understand each layer instead of abstracting the complexity away.

This project is my way of learning the stack deeply by building something complete and intentional.

## This Project Explores How To:
- Structure LLM prompts for consistent output
- Validate and normalize AI responses before database storage
- Cache evaluations intelligently using compound keys
- Track prompt versions for reproducibility

## Current Status:
As of 18th Feb 2026, the API layer is complete.
The frontend UI and additional features are still in progress.

## This Project's Tech Stack Consists Of:
- Frontend / API: Next.js (App Router)
- Database: PostgreSQL
- ORM: Prisma
- AI Model: llama-3.1-8b-instant (via Groq API)
- Language: TypeScript 

## To Run This Project, You Will Need To Have The Following Installed:
- Node.js (v24.13.0)
- Prisma (v6.19.0)
- Groq API key

## Installation:
npm install
npm run dev

## Create a .env file:
DATABASE_URL=your_database_url
GROQ_API_KEY=your_api_key

Server Runs On:
http://localhost:3000

## Future Improvements:
- Resume content hashing for smarter caching
- Weighted deterministic scoring (skills vs experience)
- Streaming LLM responses
- Rate limiting & abuse protection
- Multi-model comparison engine
- Evaluation analytics dashboard
