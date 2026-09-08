# Data Extraction Service (Loan Requirement Assistant)

A lightweight Proof-of-Concept CLI service powered by **Gemini 3.6 Flash** and **Zod** that interactively extracts and validates loan applicant requirements through natural conversation.

## Features

- **Dynamic Purpose-Based Extraction:** Adapts required fields based on loan purpose (e.g., asks for `course_fees` for education loans, vs. `project_cost` for business loans).
- **Interactive Option Suggestions:** Proactively presents tailored activity choices (e.g., Startup, Retail Store, Manufacturing) when discussing business or education activities.
- **Strict Schema Validation:** Ensures structured data accuracy using Zod (`src/schema.ts`).
- **Automatic JSON Persistence:** Saves completed applicant profiles into `data/user-requirements.json`.

---

## Project Structure

```text
├── data/
│   └── user-requirements.json   # Output storage for completed requirements
├── src/
│   ├── chatbot.ts               # Gemini API prompt & structured response logic
│   ├── gemini.ts                # Google GenAI client initialization
│   ├── index.ts                 # CLI interactive readline loop
│   └── schema.ts                # Zod schema definitions
├── .env                         # Environment variables (GEMINI_API_KEY)
└── package.json                 # Project dependencies & scripts
```

---

## Setup & Running

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Run the CLI Assistant:**
   ```bash
   npm run dev
   ```

