# World Cup Simulator

A web application built with React and Vite that consumes the challenge 
API, simulates the full World Cup tournament, and submits the final result 
following the required specifications.

 **Live demo:** 
https://costantsh.github.io/world-cup-simulator/

---

## Challenge Requirements Coverage

-  Fetch all teams from API (`/WorldCup/GetAllTeams`)
-  Include required `git-user` header in all requests
-  Simulate full tournament (group stage + knockout)
-  Apply correct scoring and tie-break rules
-  Ensure knockout matches always produce a winner (penalties)
-  Submit final result via POST (`/WorldCup/FinalResult`)

---

## Project Architecture

The project follows a clear separation of concerns:

- **UI Layer (`src/App.jsx`)**
  - Orchestrates the tournament flow
  - Controls phase navigation and summary visualization

- **API Layer (`src/api/api.js`)**
  - Handles data fetching and submission
  - Injects required `git-user` header in all requests

- **Business Logic (`src/services/*`)**
  - `groupService.js`: group generation, sorting, qualification
  - `matchService.js`: match scheduling and stats updates
  - `knockoutService.js`: knockout stage simulation and round progression

This separation isolates domain logic from UI concerns, improving testability, maintainability, and readability.

---

## Tournament Rules Implemented

### Group Stage

- 32 teams are randomly distributed into **8 groups (A–H)** with **4 teams each**
- Each group plays **6 matches across 3 rounds**:
  - Round 1: (0 vs 1), (2 vs 3)
  - Round 2: (0 vs 2), (1 vs 3)
  - Round 3: (0 vs 3), (1 vs 2)
- Goals are randomly generated (uniform distribution) between **0 and 4**

**Scoring system**
- Win: 3 points  
- Draw: 1 point  
- Loss: 0 points  

**Tie-breakers**
1. Points (descending)
2. Goal difference (descending)
3. Random draw

**Qualification**
- Top 2 teams from each group advance:
  `A1, A2, B1, B2, ... H1, H2`

---

### Knockout Stage

- All matches must produce a winner
- Draws are resolved via **penalty shootout** (until scores differ)

**Round of 16 pairings**
- 1A×2B, 1C×2D, 1E×2F, 1G×2H  
- 1B×2A, 1D×2C, 1F×2E, 1H×2G  

---

## API Integration

- All requests include the required `git-user` header
- Teams are fetched from:
  - `/WorldCup/GetAllTeams`
- Final result is submitted to:
  - `/WorldCup/FinalResult`

### Final Payload

```json
{
  "equipeA": "TEAM_TOKEN",
  "equipeB": "TEAM_TOKEN",
  "golsEquipeA": 0,
  "golsEquipeB": 0,
  "golsPenaltyTimeA": 0,
  "golsPenaltyTimeB": 0
}
````

### Debug Visibility in UI

After running a full simulation:

* Click **"Ver resumo"**
* At the bottom of the page:

  * View the exact payload sent to the API
  * View the API response

---

## Technical Decisions

* Deterministic match structure ensures consistent tournament flow
* Randomized scoring simulates match outcomes
* Tie-breakers follow simplified FIFA rules (points → goal difference → random draw)
* Business logic is centralized in service layers to avoid duplication in UI

---

## How to Run Locally

## Testing

```bash
npm run test:run
```

### Requirements

* Node.js 18+

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

---

## Deployment (GitHub Pages)

This project is deployed using GitHub Pages via the `gh-pages` branch.

* Repository: `world-cup-simulator`
* Base path configured in Vite:

  ```
  /world-cup-simulator/
  ```

### Deploy steps

```bash
npm run build
npx gh-pages -d dist
```

---

## Project Structure

```txt

src/
  App.jsx
  App.css
  main.jsx
  index.css
  api/
    api.js
  services/
    groupService.js
    matchService.js
    knockoutService.js
    __tests__/
      groupService.test.js
      matchService.test.js
      knockoutService.test.js

public/
  favicon.svg
  icons.svg

```
