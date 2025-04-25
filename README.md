# GYM Authentication System

This is a full-stack authentication system built with React, Spring Boot, and MySQL.

## Project Structure

- `backend/`: Spring Boot backend application
- `frontend/`: React frontend application

## Technologies Used

### Backend
- Spring Boot 2.7.14
- Spring Security with JWT
- Spring Data JPA
- MySQL 8
- Java 11

### Frontend
- React 18
- React Router 6
- Bootstrap 5
- Formik & Yup for form validation
- Axios for API calls

## Setup and Installation

### Database Setup
1. Create a MySQL database named `gym_auth`
2. Update database credentials in `backend/src/main/resources/application.properties` if needed

### Backend Setup
1. Navigate to the `backend` directory
2. Run `mvn clean install` to build the application
3. Run `mvn spring-boot:run` to start the backend server

### Frontend Setup
1. Navigate to the `frontend` directory
2. Run `npm install` to install dependencies
3. Run `npm start` to start the development server

## Features

- User registration with validation
- User login with JWT authentication
- Profile page for authenticated users
- Navigation with conditional rendering based on authentication status

## API Endpoints

- `POST /api/auth/signup`: Register a new user
- `POST /api/auth/signin`: Authenticate a user and get JWT token

## Screenshots

*Add screenshots of your application here* 