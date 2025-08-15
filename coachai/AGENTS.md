# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build the application (runs TypeScript compilation + Vite build)
- `npm run preview` - Preview the built application

## Architecture Overview

This is a TypeScript + Vite web application that implements a voice-based productivity coaching AI using OpenAI's Realtime API.

### Core Architecture

**VoiceAgent Class** (`src/voice-agent.ts`):
- Wraps OpenAI's RealtimeAgent and RealtimeSession
- Handles ephemeral token generation for secure API access
- Manages connection state and voice session lifecycle
- Uses `gpt-4o-realtime-preview-2025-06-03` model with 'alloy' voice

**Main Application** (`src/main.ts`):
- Simple DOM-based UI with voice indicator and connection controls
- Event-driven architecture for voice activity (listening/speaking states)
- Handles connection/disconnection flows with proper error handling

**Supabase Client** (`src/supabaseClient.ts`):
- Initializes and exports a singleton Supabase client.
- Connects to the Supabase backend for database and other services.

### Key Implementation Details

- **Authentication**: Uses ephemeral tokens generated client-side by calling OpenAI's `/v1/realtime/sessions` endpoint
- **Environment Variables**: Requires `VITE_OPENAI_API_KEY`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` (see `.env.example`)
- **Voice States**: Implements visual feedback for idle/connecting/listening/speaking states
- **Error Handling**: Graceful degradation when voice events are not available

### Dependencies

- `@openai/agents` - OpenAI's official agents SDK for realtime voice
- `@supabase/supabase-js` - Supabase client library for interacting with the backend.
- `zod` - Runtime type validation (pinned to <=3.25.67)
- Standard Vite + TypeScript development stack

## Configuration Notes

- TypeScript configured with strict mode and modern ES2022 target
- Vite handles bundling with modern ES modules
- No linting/testing setup currently configured