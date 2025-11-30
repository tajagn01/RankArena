# RankArena Frontend

This is the frontend for RankArena, a platform to view and compare LeetCode stats of university students.
## Features

- User signup and login forms
- Profile page showing user info and LeetCode stats
- University leaderboard: see all users from your university and their LeetCode stats
- Responsive and modern UI with React and Tailwind CSS
## Getting Started

### 1. Install dependencies
```sh
npm install
```
### 2. Start the development server
```sh
npm run dev
```
### 3. Environment Variables
If you need to change the backend API URL, create a `.env` file in the `frontend/` directory:
```
VITE_API_URL=http://localhost:5000
```
Update your API calls in React to use this variable.
## Usage

1. **Signup:** Register a new account with name, email, password, university, and LeetCode username.
2. **Login:** Log in with your email and password.
3. **Profile:** View your profile and LeetCode stats.
4. **University Leaderboard:** See all users from your university and their LeetCode stats.
## API Integration

- The frontend communicates with the backend via REST API endpoints:
	- `POST /api/auth/signup`
	- `POST /api/auth/login`
	- `POST /api/auth/university-users`

## Project Structure

- `src/pages/` – Main pages (Home, Signup, Login, Profile)
- `src/components/` – Reusable UI components (Card, Footer, NavBar, etc.)
- `src/lib/` – Utility functions and API helpers
- `src/assets/` – Static assets (fonts, images)
## Tech Stack

- React
- Vite
- Tailwind CSS
## Contribution

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request
## License

MIT
