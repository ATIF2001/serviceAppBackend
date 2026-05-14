# Home Services Backend API

Production-ready backend API for a Home Services mobile app using Node.js, Express.js, PostgreSQL, Sequelize ORM, JWT authentication, and secure middleware.

## Features

- MVC architecture
- JWT auth with bcrypt hashing
- Categories, services, bookings, reviews modules
- Optional auth for browsing and mandatory auth for bookings/profile
- Pagination, search, sort, filters
- Featured, popular, recommended, recently viewed services
- Availability check endpoint
- AWS S3 upload support for profile/service images
- Swagger docs and Postman collection
- Seed script with demo providers/services

## Setup

1. Install dependencies
```bash
npm install
```
2. Configure environment
- Copy `.env.example` to `.env`
- Update PostgreSQL and AWS credentials

3. Run server
```bash
npm run dev
```

4. Seed database
```bash
npm run seed
```

## API Docs

- Swagger UI: `http://localhost:5000/api-docs`
- Health: `http://localhost:5000/health`

## Main Routes

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/users/me`
- `PUT /api/users/me`
- `GET /api/categories`
- `GET /api/services`
- `GET /api/services/:id`
- `POST /api/bookings`
- `GET /api/bookings/my`
- `POST /api/reviews`
- `GET /api/reviews/service/:id`

## Notes

- Service listing and details are public.
- Booking/profile routes are protected.
- Use `Authorization: Bearer <token>` for protected routes.
