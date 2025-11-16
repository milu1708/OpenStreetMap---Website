# 24125050 - lab 05

# Vietnam POI Finder

A web application to find Points of Interest (POIs) like cafes, restaurants, and tourist spots near any location in Vietnam. Built with React, Vite, and Leaflet, it uses data from OpenStreetMap.

## Features

-   **Location Search:** Geocode any location name in Vietnam to get its coordinates.
-   **Category Filtering:** Choose to search for specific types of POIs:
    -   Cafes
    -   Restaurants
    -   Tourist Attractions
    -   All of the above
-   **Interactive Map:** Displays the search location and found POIs on a map using Leaflet.
-   **Detailed Results:** For each POI, the app displays:
    -   Name and Category
    -   Full Address (if available)
    -   Exact Coordinates (Latitude, Longitude)
    -   Distance from the search location
-   **Smart Search Expansion:** If fewer than 5 results are found, the app asks the user if they want to search a wider area (1km -> 5km -> 15km).

## Prerequisites

-   **Node.js:** Make sure you have Node.js (v16 or later) installed on your machine.
-   **npm:** This project uses npm (Node Package Manager) to handle its dependencies.

To check if you have them installed, run the following commands in your terminal:

node -v
npm -v

## Installation

npm install
npm run dev
