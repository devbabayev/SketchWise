# SketchWise

An AI-integrated workspace for engineers and designers to calculate production costs, discover affordable materials, and optimize blueprints.

SketchWise analyzes your sketches, PDFs, and blueprints to extract required project variables and uses advanced LLMs to identify cost-cutting opportunities without compromising structural integrity.

## Features

- **Kinetic Design UI:** A polished, modern interface leveraging Three.js for 3D visualization and Framer Motion for magnetic hover states and smooth transitions.
- **AI Cost Estimation:** Upload image sketches or PDFs and let the AI extract variables (like dimensions and materials) to compute the original vs. optimized costs.
- **Secure Paywall Architecture:** Ensure data remains secure. The platform only issues a teaser payload during the estimation phase. The detailed cost breakdown, materials list, and full AI optimization report are locked behind an Express/SQLite backend and are only released upon purchase.
- **Admin Configuration Console:** Securely manage AI API Tokens on a dedicated `/admin` route without hardcoding keys into the client application.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and configure your admin password:

   ```env
   ADMIN_PASSWORD=your_secure_password
   ```

4. Start the Express backend server (default port is 3001):

   ```bash
   npm run start:server
   ```

5. In a separate terminal, start the Vite development server:

   ```bash
   npm run dev
   ```

> [!NOTE]
> The Vite development server proxy is configured to automatically route `/api/*` requests to the Express backend running on `http://localhost:3001`.

## Architecture Overview

SketchWise is structured as a full-stack monolith:
- **Frontend (Vite + React):** Resides in `src/`. Uses `@react-three/fiber` for 3D elements and `lucide-react` for iconography. Routing is handled by `react-router-dom`.
- **Backend (Express + SQLite):** Resides in `server/`. Connects to a local SQLite database (`database.sqlite`) to store AI tokens and user credentials (12-digit unique IDs) after successful purchases. 

### Security Strategy

To prevent bypassing the paywall via DevTools (e.g. manipulating HTML/CSS or React state), the application implements a strict data-withholding model. 
When files are uploaded for analysis, the API performs the calculation but only responds with the summarized cost savings (teaser). The complete JSON response (materials, calculations) is held in server memory until the user authenticates a purchase transaction.

## Testing

The project uses `vitest` for both backend API testing and frontend React component testing (via JSDOM).

To run the complete test suite:

```bash
npm run test
```
