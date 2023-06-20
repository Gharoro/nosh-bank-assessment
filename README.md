# nosh-bank-assessment

A Node.Js/Express bank API with versioning.

## API Documentation and Live URL

- [https://documenter.getpostman.com/view/6511530/2s93z3f5Zu](https://documenter.getpostman.com/view/6511530/2s93z3f5Zu)
- [https://nosh-bank-assessment-production.up.railway.app/](https://nosh-bank-assessment-production.up.railway.app/)

## Features

- Signup as "admin" or "customer"
- Login
- Refresh Token
- Account lookup using account number
- Funds transfer between customers using account number
- Only Admin can fund customers account
- Transfers history (sent and received)

- Used Mongodb for persistent data storage
- Used Redis for caching transfers history and token refresh mechanism
- Implemented rate limiting

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/Gharoro/nosh-bank-assessment.git
   ```

2. Cd into directory:

   ```bash
   cd nosh-bank-assessment
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Update .env file

   ```bash
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=
   JWT_REFRESH_SECRET=
   JWT_EXPIRE=1h
   ```

5. Run the app

   ```bash
   npm start
   ```
