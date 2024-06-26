# Bike Rental System

This project is a backend system for managing bike rentals. It includes functionalities such as managing users, bikes, and rental processes. The system is designed to facilitate easy and efficient bike rentals for a rental service.

## Features

- User authentication and management
- Bike inventory management
- Rental operations including renting a bike and returning a bike
- Viewing and managing current rentals

## Technologies

- Node.js
- Express.js
- MongoDB with Mongoose

## Getting Started

### Prerequisites

Before you begin, ensure you have met the following requirements:
- Node.js installed (version 14 or later recommended)
- MongoDB running locally or remotely
- npm for managing Node.js packages

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/mdyasenrafe/bike-rental-assigment-3
cd bike-rental-assigment-3
yarn
```

### Setting Up Environment Variables

Create a `.env` file in the root directory with the following contents:

```bash
PORT=3001
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
ACCESS_TOKEN_SECRET=your_jwt_secret
```

#### Running the Application

To start the application in development mode :

```bash
yarn dev
```

To start the application in production mode:

```bash
yarn start
```
## API Documentation

### Auth Routes

- POST /api/auth/signup: Register a new user
- POST /api/auth/login: Log in an existing user

### Bike Routes
 - GET /api/bikes: List all bikes
 - POST /api/bikes: Add a new bike
- PUT /api/bikes/:id Update bike details
- DELETE /api/bikes/:id Delete a bike

### Rental Routes

- POST /api/rentals: Create a new rental
- PUT /api/rentals//return: Return a bike
- GET /api/rentals: Get all rentals for the logged-in user



#### Live Deployment

Visit the live application at [live website](https://rental-bike-assignment-3.vercel.app/). The [live version](https://rental-bike-assignment-3.vercel.app/) supports all the operations described above.

Testing with Postman
To test these APIs, you can use Postman:

[<img src="https://run.pstmn.io/button.svg" alt="Run In Postman" style="width: 128px; height: 32px;">](https://god.gw.postman.com/run-collection/36553719-6ee3ef19-3b51-4d60-a47b-77be3146a033?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D36553719-6ee3ef19-3b51-4d60-a47b-77be3146a033%26entityType%3Dcollection%26workspaceId%3D6158bcb0-8372-48ca-b2f3-5bfa3cf13f75)