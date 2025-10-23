# Local Full-Stack Starter
Using FastAPI as a backend and Next.js as a frontend

## Installation of required packages
1. In terminal, either on your computer or IDE, you can create and set up a virtual environment using:

```bash
python -m venv. .venv
```

Then, activate the .venv:

```bash
.venv\Scripts\activate
```
And check if it is activated:
```bash
Get-Command python
```

2. You can download requirements.txt for python, FastAPI, and uvicorn:

```bash
pip install -r requirements.txt
```

3. Download Next.js:

```bash
npx create-next-app nextjs
```

Next.js will provide you some questions about its install, select:

 Would you like to use TypeScript? ... No
 Which linter would you like to use? » None
 Would you like to use Tailwind CSS? ... No
 Would you like your code inside a src/ directory? ... Yes
 Would you like to use App Router? (recommended) ... Yes
 Would you like to use Turbopack? (recommended) ... Yes
 Would you like to customize the import alias (@/* by default)? ... No

## How to run the servers

1. To run FastAPI, change directory to where your main.py resides:
```bash
cd C:\...\fastapi\"your_folder"
```

Then in the terminal, enter:
```bash
uvicorn main:app --reload
```

this will create the server and URL link in the terminal


2. To run Nextjs, change directory to nextjs directory:

```bash
cd C:\...\nextjs
```

Then enter:
```bash
npm run dev
```

This will create the server and URL link in the terminal

## Accessing /docs

Once you have opened the servers for FastAPI, you can access the docs by going to the link:

http://127.0.0.1:8000/docs

From there, you can access the CRUD functions and use them however you like.

## Accessing NextJS pages

Once you have opened both servers, you can fully use the functions in the frontend website. You can do this by writing down the pages after the url.

The pages include:

    1. /health

    2. /products

    3. /signup

## Starting up Docker

Change directory to 'fastapi'

```bash
cd .\fastapi
```

First use,

```bash
docker compose down
```
to reset any current containers that you may have

Then,

```bash
docker compose up --build
```
Which creates the containers.


## Next.js app (AI page)

Run:
1. Start FastAPI backend (from fastapi folder):
   - Locally: python -m uvicorn api.main:app --reload --port 8000
   - Or docker compose up --build (if configured)

2. Start Next.js:
   - cd nextjs
   - npm install
   - npm run dev (opens http://localhost:3000)

Notes:
- Theme and draft autosave are stored in LocalStorage using a namespaced key: `cst325:m6:settings:v1`.
  - Key format allows safe upgrades; increment the version (`v1` → `v2`) when making breaking changes to stored shape.
- The AI endpoint will return a safe stub when OPENAI_API_KEY is not set; UI displays stub/live status.
- Proof: place a screenshot showing persisted theme + draft restore at `/docs/theme-draft.png`.

## Network Testing (AI page)

When you are on the AI page to test 'perf.js', enter the following keys:

   CTRL  SHIFT  I

This would allow you to open up the devtools.

Go to the console tab in the devtools, and write down these statements:

```bash
performance.clearMarks();
```
```bash
performance.clearMeasures();
```
This allows the perf.js to record and measure the next action you will take.

Type anything into the AI text box and submit your prompt. Afterwards, the console should have the perf.js return its stats back to you.

## Useful Commands:

- python -m venv. .venv
- .venv\Scripts\activate
- pip install -r requirements.txt
- cd .\"repository_name_here"
- uvicorn main:app --reload
- npm run dev
- docker compose down
- docker compose up --build
- performance.clearMarks();
- performance.clearMeasures();
