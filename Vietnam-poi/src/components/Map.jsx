// frontend/src/components/Map.jsx
import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Vite requires explicit imports for assets like images
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default markers in Leaflet with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const Map = ({ center, pois }) => {
  useEffect(() => {
    // Create map
    const map = L.map('map').setView(center, 14);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add marker for the center location
    L.marker(center).addTo(map)
      .bindPopup('Vị trí của bạn')
      .openPopup();
    
    // Add markers for POIs
    pois.forEach(poi => {
      const marker = L.marker([poi.lat, poi.lon]).addTo(map);
      marker.bindPopup(`<b>${poi.name}</b><br>${poi.category}`);
    });
    
    // Cleanup function to remove the map when component unmounts
    return () => {
      map.remove();
    };
  }, [center, pois]); // Rerun effect if center or pois change
  
  return <div id="map" style={{ height: '500px', width: '100%' }}></div>;
};

export default Map;