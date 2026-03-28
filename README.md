# Aria_VA

Aria is a real-time voice scheduling agent that converts natural language into structured calendar actions using LLM tool-calling, FastAPI, Vapi, and Google Calendar integration.

## Why I built this
Scheduling is still a frustrating workflow full of manual back-and-forth. I built Aria to explore how AI systems can operate in live, user-facing environments where latency, reliability, and structured execution matter.

## What it does
- Accepts natural voice input
- Interprets scheduling intent
- Extracts structured fields like date, time, and participants
- Uses tool-calling to decide the correct action
- Executes calendar updates through Google Calendar API

## Stack
- Python
- FastAPI
- Vapi
- Google Calendar API
- OAuth
- LLM tool-calling

## What I personally built
I built the backend orchestration layer, API integrations, tool-calling flow, prompt/schema design, and deployment setup. I also added validation and clarification handling to improve reliability before executing calendar actions.

## Design constraints
- Low latency for real-time interaction
- Reliable structured execution
- Safe handling of incomplete or ambiguous inputs
- Secure calendar access through OAuth

## Evaluation
I validated the system by testing:
- intent recognition across phrasing variations
- entity extraction accuracy
- end-to-end scheduling success rate
- failure cases involving ambiguous or partial requests

## Repository structure
/backend   FastAPI backend and orchestration  
/docs      prompts and supporting documentation  
/frontend  UI assets and client-side logic  

## Future improvements
- better multi-turn memory
- scheduling conflict detection
- stronger evaluation harness
- broader calendar workflow support
