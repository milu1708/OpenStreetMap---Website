// frontend/src/api.js

const NOMINATIM = "https://nominatim.openstreetmap.org";
const OVERPASS = "https://overpass.kumi.systems/api/interpreter";

const UA = "Vietnam-POI-Finder-FE/1.0 (contact: your_email@example.com)";
const headers = { 'User-Agent': UA };

export const geocodeLocation = async (query) => {
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    const params = new URLSearchParams({
        q: query, format: 'jsonv2', limit: 1, addressdetails: 1, countrycodes: 'vn'
    });
    const response = await fetch(`${NOMINATIM}/search?${params}`, { headers });
    if (!response.ok) throw new Error(`Geocoding failed: ${response.statusText}`);
    const data = await response.json();
    if (!data || data.length === 0) throw new Error("Không tìm thấy kết quả");
    const item = data[0];
    return { lat: parseFloat(item.lat), lon: parseFloat(item.lon), display_name: item.display_name };
};

// --- REVISED FUNCTION ---
export const findPois = async (lat, lon, radius = 1000, category = 'cafe') => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    let tagFilter = '';
    if (category === 'cafe') {
        tagFilter = '["amenity"="cafe"]';
    } else if (category === 'restaurant') {
        tagFilter = '["amenity"~"restaurant|fast_food"]';
    } else if (category === 'tourism') {
        tagFilter = '["tourism"~"attraction|museum|viewpoint"]';
    } else if (category === 'all') {
        tagFilter = `
        (["amenity"~"restaurant|cafe|bar|fast_food"];
         ["tourism"~"attraction|museum|viewpoint"];
         ["historic"];
         ["shop"~"mall|market"];
         ["leisure"~"park|garden"];)`;
    } else {
        return [];
    }

    const query = `
    [out:json][timeout:60];
    nwr(around:${radius},${lat},${lon})${tagFilter};
    out center meta tags;
    `;

    const response = await fetch(OVERPASS, {
        method: 'POST', headers: { ...headers, 'Content-Type': 'text/plain; charset=utf-8' }, body: query
    });
    if (!response.ok) throw new Error(`POI search failed: ${response.statusText}`);
    const data = await response.json();
    const elements = data.elements || [];

    const pois = elements.map(e => {
        const tags = e.tags || {};
        
        // --- KEY CHANGE: Filter out POIs without a name ---
        if (!tags.name || tags.name.trim() === '') {
            return null; // Discard this POI
        }
        // --- END OF KEY CHANGE ---

        const name = tags.name;
        const poiCategory = tags.amenity || tags.tourism || tags.historic || tags.shop || tags.leisure || "unknown";
        
        const houseNumber = tags['addr:housenumber'] || '';
        const street = tags['addr:street'] || '';
        const suburb = tags['addr:suburb'] || tags['addr:district'] || '';
        const city = tags['addr:city'] || '';
        
        let address = `${houseNumber} ${street}`.trim();
        if (suburb) address += `, ${suburb}`;
        if (city) address += `, ${city}`;
        if (!address) address = 'Địa chỉ không có sẵn';

        const poiLat = e.lat || e.center?.lat;
        const poiLon = e.lon || e.center?.lon;

        if (poiLat && poiLon) {
            return { name, category: poiCategory, address, lat: poiLat, lon: poiLon };
        }
        return null;
    }).filter(poi => poi !== null); // This will remove all the nulls

    return pois.slice(0, 5);
};