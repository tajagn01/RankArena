# RankArena Backend

This is the backend for RankArena, providing authentication and LeetCode stats aggregation for university students.

## Features

- User signup and login (with password hashing)
- Fetches LeetCode stats using public API
- University management (auto-create on signup)
- Endpoints to get all users from a university

## Getting Started

1. Install dependencies:
   ```sh
   npm install
   ```

2. Set up your `.env` file:
   ```
   MONGO_URI=your_mongodb_connection_string
   ```

3. Start the server:
   ```sh
   npm start
   ```

4. The API runs at [http://localhost:5000](http://localhost:5000)

## API Endpoints

- `POST /api/auth/signup` – Register a new user
- `POST /api/auth/login` – Login
- `POST /api/auth/university-users` – Get all users from a university

## Project Structure

- `src/models/` – Mongoose models (User, University)
- `src/routes/` – Express routes (auth)
- `src/services/` – External API logic (LeetCode)
- `src/config/` – Database and Redis config

## Tech Stack

- Node.js
- Express
- MongoDB (Mongoose)
- bcryptjs

## License

MIT
