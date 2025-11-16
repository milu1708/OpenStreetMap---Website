// frontend/src/App.jsx
import React, { useState } from 'react';
import './App.css';
import Map from './components/Map';
import Modal from './components/Modal';
import { geocodeLocation, findPois } from './api';

// Embedded utility function
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

function App() {
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('cafe');
  const [locationData, setLocationData] = useState(null);
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [noPoisMessage, setNoPoisMessage] = useState(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [nextSearchRadius, setNextSearchRadius] = useState(null);

  const handleSearch = async (e, startRadius = 1) => {
    e.preventDefault();
    if (!location.trim()) return;
    
    setLoading(true);
    setError(null);
    setNoPoisMessage(null);
    setPois([]);
    
    try {
      let currentLocationData;
      if (startRadius === 1) {
        const geocodeData = await geocodeLocation(location);
        currentLocationData = geocodeData;
        setLocationData(geocodeData);
      } else {
        if (!locationData) {
          throw new Error("Lỗi: Dữ liệu vị trí bị mất. Vui lòng tìm kiếm lại.");
        }
        currentLocationData = locationData;
      }

      if (!currentLocationData || typeof currentLocationData.lat !== 'number' || typeof currentLocationData.lon !== 'number') {
        throw new Error("Dữ liệu vị trí không hợp lệ.");
      }

      let searchRadius = startRadius;
      let foundPois = [];
      
      while (searchRadius <= 15) {
        foundPois = await findPois(currentLocationData.lat, currentLocationData.lon, searchRadius * 1000, category);

        const poisWithDistance = foundPois.map(poi => {
          if (!poi || typeof poi.lat !== 'number' || typeof poi.lon !== 'number') {
            return { ...poi, distance: null };
          }
          try {
            const distance = calculateDistance(currentLocationData.lat, currentLocationData.lon, poi.lat, poi.lon);
            return { ...poi, distance };
          } catch (err) {
            return { ...poi, distance: null };
          }
        });

        if (poisWithDistance.length >= 5) {
          setPois(poisWithDistance);
          setNoPoisMessage(null);
          break; 
        } else {
          let message = '';
          const categoryText = category === 'cafe' ? 'quán cà phê' : 'điểm quan tâm';
          
          if (poisWithDistance.length === 0) {
            if (searchRadius === 1) {
              message = `Không tìm thấy ${categoryText} nào (có tên) trong bán kính 1km. Bạn có muốn tìm rộng hơn không?`;
              setNextSearchRadius(5);
            } else if (searchRadius === 5) {
              message = `Không tìm thấy ${categoryText} nào (có tên) trong bán kính 5km. Bạn có muốn tìm rộng hơn không?`;
              setNextSearchRadius(15);
            }
          } else {
            if (searchRadius === 1) {
              message = `Chỉ tìm thấy ${poisWithDistance.length} ${categoryText} (có tên). Bạn có muốn tìm trong bán kính 5km để có nhiều lựa chọn hơn không?`;
              setNextSearchRadius(5);
            } else if (searchRadius === 5) {
              message = `Chỉ tìm thấy ${poisWithDistance.length} ${categoryText} (có tên). Bạn có muốn tìm trong bán kính 15km để có nhiều lựa chọn hơn không?`;
              setNextSearchRadius(15);
            }
          }

          if (message) {
            setModalMessage(message);
            setIsModalVisible(true);
            setPois(poisWithDistance); 
            return;
          } else {
            setPois(poisWithDistance);
            if(poisWithDistance.length > 0) {
              setNoPoisMessage(`Đã tìm thấy ${poisWithDistance.length} ${categoryText} (có tên) trong bán kính tối đa là ${searchRadius} km.`);
            } else {
              setNoPoisMessage(`Không tìm thấy ${categoryText} nào (có tên) trong bán kính tối đa là ${searchRadius} km.`);
            }
            break;
          }
        }
        
        searchRadius = searchRadius === 1 ? 5 : 15;
      }

    } catch (err) {
      console.error("Search failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModalConfirm = () => {
    setIsModalVisible(false);
    handleSearch({ preventDefault: () => {} }, nextSearchRadius);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Tìm kiếm Points of interest tại Việt Nam</h1>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Nhập tên địa điểm (ví dụ: Hà Nội, Thành phố Hồ Chí Minh)"
            className="search-input"
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="category-select">
            <option value="cafe">Quán cà phê</option>
            <option value="restaurant">Nhà hàng</option>
            <option value="tourism">Điểm du lịch</option>
            <option value="all">Tất cả</option>
          </select>
          <button type="submit" disabled={loading} className="search-button">
            {loading ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </header>
      
      <main className="App-main">
        {locationData && (
          <div className="location-info">
            <h2>Vị trí: {locationData.display_name}</h2>
            <p>Tọa độ: {locationData.lat.toFixed(6)}, {locationData.lon.toFixed(6)}</p>
          </div>
        )}
        
        {noPoisMessage && (
          <div className="info-message">
            <p>{noPoisMessage}</p>
          </div>
        )}
        
        {pois.length > 0 && (
          <div className="pois-info">
            <h2>Điểm quan tâm gần nhất:</h2>
            <ul className="pois-list">
              {pois.map((poi, index) => (
                <li key={index} className="poi-item">
                  <div className="poi-details">
                    <span className="poi-name">{poi.name}</span>
                    <span className="poi-category">({poi.category})</span>
                  </div>
                  <div className="poi-address">{poi.address}</div>
                  <div className="poi-meta">
                    <span className="poi-distance">{poi.distance !== null ? `${poi.distance.toFixed(2)} km` : 'N/A'}</span>
                    <span className="poi-coords">@ ({poi.lat.toFixed(6)}, {poi.lon.toFixed(6)})</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {locationData && <Map center={[locationData.lat, locationData.lon]} pois={pois} />}
      </main>

      <Modal
        isVisible={isModalVisible}
        message={modalMessage}
        onConfirm={handleModalConfirm}
        onClose={handleModalClose}
      />
    </div>
  );
}

export default App;