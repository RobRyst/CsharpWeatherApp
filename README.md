CSharpWeather — Weather Forecast App

A full-stack weather application that provides real-time weather conditions, hourly and weekly forecasts, and user location favorites — powered by OpenWeather API, ASP.NET Core, and React Native.

## 📌 Overview

CSharpWeather delivers a seamless weather experience across platforms:

📍 Search for locations and view real-time weather data

🕒 View detailed hourly forecasts for the next 24 hours

📅 Get weekly forecasts (up to 7 days) with min/max temperatures

⭐ Save favorite locations (requires login)

🔐 User authentication with JWT to sync favorites

🌈 Beautiful, animated UI with smooth transitions

## ⚙️ Backend (API)

.NET 8 / C# – ASP.NET Core Web API

Entity Framework Core + MySQL — persistent storage for users and favorites

JWT Authentication with role-based claims

OpenWeather API integration for live weather data

In-memory caching to reduce API calls and boost performance

Swagger / Swashbuckle for API documentation and testing

Structured logging with ILogger

## 📱 Frontend (Mobile App)

React Native + Expo — Cross-platform mobile app (Android/iOS/Web)

React Navigation — Multi-tab UI with smooth screen transitions

Axios — Fetch weather and favorites data from the API

AsyncStorage — Local JWT token storage

Context API — Centralized state for weather data & authentication

Tailored UI components — Weather backgrounds, icons, and animations

FlatList & Pull-to-Refresh for smooth lists and data reload

# ✨ Core Features
## 🌤️ Weather Forecasts

Real-time current weather (temperature, humidity, wind)

Hourly forecast for the next 24 hours

Weekly forecast (up to 7 days) with icons and descriptions

## ⭐ Favorites

Save and manage favorite locations

Set a default location

One-tap navigation from favorite to dashboard

## 🔐 Authentication

Register and log in via the backend API

Protected routes (favorites) require valid JWT

Auto-login on app start if token is valid

## ⚠️ Error Handling & UX

Friendly error messages for API/network failures

Graceful fallback UI when data is unavailable

Backend logs upstream API errors (OpenWeather failures)

## 🧱 Architecture

Backend: ASP.NET Core → Controllers → Services → EF Repositories

Frontend: React Native components → WeatherContext/AuthContext → Axios API layer

Data Flow: User action → Context → API → DB → Context → UI

## 🧠 What I Learned

Building a full-stack app from scratch with weather API integration

Implementing JWT authentication and secure favorites endpoints

Designing a mobile-first UI with smooth animations and weather visuals

Structuring a clean Context-based state architecture in React Native

Handling real-time data + API caching for performance and stability
