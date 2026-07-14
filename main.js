/* main.js */

// Initialize the map with leaflet-rotate plugin enabled
const map = L.map('map', {
    rotate: true,
    rotateControl: {
        closeOnZeroBearing: false,
        position: 'topright'
    },
    bearing: 0
}).setView([12.9716, 77.5946], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

const markers = [];
let userLatLng = null;
let userMarker = null;
let routingControl = null;

const areaAliases = {
    "whitefield": ["whitefield"],
    "electronic city": ["electronic city", "e-city", "elec. city"],
    "marathahalli": ["marathahalli", "marathalli"],
    "bellandur": ["bellandur", "belandur"],
    "hsr layout": ["hsr layout", "hsr"],
    "koramangala": ["koramangala"],
    "indiranagar": ["indiranagar", "indira nagar"],
    "jp nagar": ["jp nagar", "j.p. nagar", "j. p. nagar"],
    "jayanagar": ["jayanagar"],
    "banashankari": ["banashankari", "bsk"],
    "btm layout": ["btm layout", "btm"],
    "yelahanka": ["yelahanka"],
    "hebbal": ["hebbal"],
    "thanisandra": ["thanisandra"],
    "kr puram": ["kr puram", "k.r. puram", "krishnarajapuram"],
    "kengeri": ["kengeri"],
    "rajajinagar": ["rajajinagar", "rajaji nagar"],
    "vijayanagar": ["vijayanagar", "vijaya nagar"],
    "malleshwaram": ["malleshwaram", "malleswaram"],
    "basavanagudi": ["basavanagudi"],
    "rr nagar": ["rr nagar", "r r nagar", "r.r. nagar", "rajarajeshwari nagar"],
    "sarjapur road": ["sarjapur", "sarjapura"],
    "hoodi": ["hoodi"],
    "mahadevapura": ["mahadevapura", "mahadevapuri"],
    "cv raman nagar": ["cv raman", "c.v. raman"],
    "yeshwanthpur": ["yeshwanthpur", "yeswanthpur", "yeshwantpur"],
    "bommanahalli": ["bommanahalli"],
    "bommasandra": ["bommasandra"],
    "kothanur": ["kothanur"],
    "nagawara": ["nagawara", "nagavara"]
};

const areasConfig = {
    "whitefield": { center: [12.9698, 77.7500], radius: 4.0, population: 520000 },
    "electronic city": { center: [12.8452, 77.6602], radius: 3.5, population: 480000 },
    "marathahalli": { center: [12.9569, 77.7011], radius: 2.5, population: 410000 },
    "bellandur": { center: [12.9304, 77.6784], radius: 2.5, population: 380000 },
    "hsr layout": { center: [12.9116, 77.6388], radius: 2.5, population: 320000 },
    "koramangala": { center: [12.9352, 77.6244], radius: 2.5, population: 300000 },
    "indiranagar": { center: [12.9719, 77.6412], radius: 2.2, population: 250000 },
    "jp nagar": { center: [12.9063, 77.5857], radius: 2.5, population: 470000 },
    "jayanagar": { center: [12.9307, 77.5832], radius: 2.2, population: 390000 },
    "banashankari": { center: [12.9254, 77.5468], radius: 3.0, population: 450000 },
    "btm layout": { center: [12.9166, 77.6101], radius: 2.2, population: 350000 },
    "yelahanka": { center: [13.1007, 77.5963], radius: 4.5, population: 520000 },
    "hebbal": { center: [13.0354, 77.5988], radius: 2.5, population: 330000 },
    "thanisandra": { center: [13.0582, 77.6417], radius: 2.5, population: 290000 },
    "kr puram": { center: [13.0117, 77.7017], radius: 3.5, population: 480000 },
    "kengeri": { center: [12.8996, 77.4827], radius: 3.5, population: 360000 },
    "rajajinagar": { center: [12.9882, 77.5550], radius: 2.2, population: 280000 },
    "vijayanagar": { center: [12.9696, 77.5350], radius: 2.2, population: 340000 },
    "malleshwaram": { center: [13.0031, 77.5696], radius: 2.2, population: 230000 },
    "basavanagudi": { center: [12.9417, 77.5755], radius: 2.2, population: 210000 },
    "rr nagar": { center: [12.9207, 77.5196], radius: 3.5, population: 390000 },
    "sarjapur road": { center: [12.9096, 77.6684], radius: 3.5, population: 310000 },
    "hoodi": { center: [12.9898, 77.7179], radius: 2.5, population: 190000 },
    "mahadevapura": { center: [12.9896, 77.6953], radius: 2.5, population: 450000 },
    "cv raman nagar": { center: [12.9790, 77.6650], radius: 2.2, population: 250000 },
    "yeshwanthpur": { center: [13.0250, 77.5462], radius: 2.5, population: 280000 },
    "bommanahalli": { center: [12.9030, 77.6242], radius: 2.5, population: 420000 },
    "bommasandra": { center: [12.8166, 77.6784], radius: 3.0, population: 310000 },
    "kothanur": { center: [13.0625, 77.6450], radius: 2.5, population: 180000 },
    "nagawara": { center: [13.0238, 77.6231], radius: 2.5, population: 220000 }
};

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

function getColor(category) {
    category = (category || "").toLowerCase();
    if (category.includes("hospital")) return "red";
    if (category.includes("clinic") || category.includes("doctors") || category.includes("doctor")) return "orange";
    if (category.includes("pharmacy")) return "green";
    if (category.includes("dentist")) return "blue";
    if (category.includes("veterinary")) return "violet";
    return "grey";
}

function markerIcon(color) {
    return new L.Icon({
        iconUrl: `https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-${color}.png`,
        iconRetinaUrl: `https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
}

function updateStats(matchCount, selectedArea) {
    let population = 9930000;
    if (selectedArea !== "all" && areasConfig[selectedArea]) {
        population = areasConfig[selectedArea].population;
    }
    
    document.getElementById("stat-population").innerText = population.toLocaleString();
    
    if (matchCount > 0) {
        const density = (matchCount / population) * 10000;
        document.getElementById("stat-density").innerText = density.toFixed(2);
        
        const ratio = Math.round(population / matchCount);
        document.getElementById("stat-ratio").innerText = "1 per " + ratio.toLocaleString() + " people";
    } else {
        document.getElementById("stat-density").innerText = "0.00";
        document.getElementById("stat-ratio").innerText = "N/A";
    }
}

function filterMarkers() {
    const searchText = document.getElementById("search").value.toLowerCase();
    const selectedCategory = document.getElementById("category-filter").value.toLowerCase();
    const selectedArea = document.getElementById("area-filter").value.toLowerCase();

    let visibleLatLngs = [];
    let matchCount = 0;

    markers.forEach(m => {
        const matchesSearch = m.name.includes(searchText) || m.address.includes(searchText);
        
        let matchesCategory = false;
        if (selectedCategory === "all") {
            matchesCategory = true;
        } else if (selectedCategory === "other") {
            const known = ["hospital", "clinic", "pharmacy", "doctors", "doctor", "dentist", "veterinary"];
            matchesCategory = !known.some(k => m.category.includes(k));
        } else {
            matchesCategory = m.category.includes(selectedCategory);
        }

        let matchesArea = false;
        if (selectedArea === "all") {
            matchesArea = true;
        } else {
            const config = areasConfig[selectedArea];
            if (config) {
                const dist = getDistance(m.lat, m.lng, config.center[0], config.center[1]);
                if (dist <= config.radius) {
                    matchesArea = true;
                }
            }
            if (!matchesArea) {
                const aliases = areaAliases[selectedArea] || [selectedArea];
                matchesArea = aliases.some(alias => m.address.includes(alias) || m.name.includes(alias));
            }
        }

        if (matchesSearch && matchesCategory && matchesArea) {
            if (!map.hasLayer(m.marker)) {
                map.addLayer(m.marker);
            }
            visibleLatLngs.push(m.marker.getLatLng());
            matchCount++;
        } else {
            if (map.hasLayer(m.marker)) {
                map.removeLayer(m.marker);
            }
        }
    });

    document.getElementById("locations-count").innerText = matchCount;
    updateStats(matchCount, selectedArea);

    if (selectedArea !== "all" && visibleLatLngs.length > 0) {
        const bounds = L.latLngBounds(visibleLatLngs);
        map.fitBounds(bounds, { padding: [50, 50] });
    }
}

// Global directions trigger called from popup buttons
window.getRouteTo = function(destLat, destLng, destName) {
    let startLatLng = userLatLng || map.getCenter();
    
    if (routingControl) {
        map.removeControl(routingControl);
    }
    
    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(startLatLng),
            L.latLng(destLat, destLng)
        ],
        routeWhileDragging: true,
        lineOptions: {
            styles: [{ color: '#3182ce', opacity: 0.85, weight: 6 }]
        },
        createMarker: function(i, wp, nWps) {
            if (i === 0) {
                return L.marker(wp.latLng, {
                    icon: markerIcon('blue')
                }).bindPopup("Start Location");
            } else {
                return L.marker(wp.latLng, {
                    icon: markerIcon('red')
                }).bindPopup("Destination: " + destName);
            }
        }
    }).addTo(map);
    
    document.getElementById("clear-route-btn").style.display = "block";
};

// Geolocation control
const locateBtn = document.getElementById("locate-btn");
locateBtn.addEventListener("click", () => {
    locateBtn.innerText = "Locating...";
    map.locate({ setView: true, maxZoom: 15 });
});

map.on('locationfound', (e) => {
    userLatLng = e.latlng;
    locateBtn.innerText = "Locate Me";
    
    if (userMarker) {
        map.removeLayer(userMarker);
    }
    
    userMarker = L.marker(userLatLng, {
        icon: markerIcon('blue')
    }).addTo(map).bindPopup("<b>My Current Location</b>").openPopup();
});

map.on('locationerror', () => {
    locateBtn.innerText = "Locate Me";
    alert("Location access denied or unavailable. Routing from map center.");
});

// Clear routing control
const clearRouteBtn = document.getElementById("clear-route-btn");
clearRouteBtn.addEventListener("click", () => {
    if (routingControl) {
        map.removeControl(routingControl);
        routingControl = null;
    }
    clearRouteBtn.style.display = "none";
});

// Draggable controls panel logic
const panel = document.getElementById("controls-panel");
const header = document.getElementById("panel-header-drag");

let isDragging = false;
let startX, startY, initialX, initialY;

header.addEventListener("mousedown", dragStart);
header.addEventListener("touchstart", touchStart, { passive: true });

function dragStart(e) {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = panel.getBoundingClientRect();
    initialX = rect.left;
    initialY = rect.top;
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
    panel.style.left = initialX + 'px';
    panel.style.top = initialY + 'px';
    document.addEventListener("mousemove", dragMove);
    document.addEventListener("mouseup", dragEnd);
}

function dragMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    panel.style.left = (initialX + dx) + 'px';
    panel.style.top = (initialY + dy) + 'px';
}

function dragEnd() {
    isDragging = false;
    document.removeEventListener("mousemove", dragMove);
    document.removeEventListener("mouseup", dragEnd);
}

function touchStart(e) {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    const touch = e.touches[0];
    isDragging = true;
    startX = touch.clientX;
    startY = touch.clientY;
    const rect = panel.getBoundingClientRect();
    initialX = rect.left;
    initialY = rect.top;
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
    panel.style.left = initialX + 'px';
    panel.style.top = initialY + 'px';
    document.addEventListener("touchmove", touchMove, { passive: false });
    document.addEventListener("touchend", touchEnd);
}

function touchMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    panel.style.left = (initialX + dx) + 'px';
    panel.style.top = (initialY + dy) + 'px';
}

function touchEnd() {
    isDragging = false;
    document.removeEventListener("touchmove", touchMove);
    document.removeEventListener("touchend", touchEnd);
}

// Minimize panel logic
const minimizeBtn = document.getElementById("minimize-btn");
minimizeBtn.addEventListener("click", () => {
    panel.classList.toggle("collapsed");
    if (panel.classList.contains("collapsed")) {
        minimizeBtn.innerText = "+";
        minimizeBtn.title = "Expand";
    } else {
        minimizeBtn.innerText = "—";
        minimizeBtn.title = "Minimize";
    }
});

// Parse locations database and add map markers
Papa.parse("bangalore_medical_database.csv?v=" + new Date().getTime(), {
    download: true,
    header: true,
    complete: function (results) {
        results.data.forEach(row => {
            if (!row.Latitude || !row.Longitude) return;

            const category = (row.Category || "").toLowerCase();
            const latVal = parseFloat(row.Latitude);
            const lngVal = parseFloat(row.Longitude);
            
            const marker = L.marker(
                [latVal, lngVal],
                { icon: markerIcon(getColor(category)) }
            ).addTo(map);

            marker.bindPopup(`
                <b>${row.Name || ""}</b><br>
                <b>Category:</b> ${row.Category || ""}<br>
                <b>Address:</b> ${row.Address || ""}<br>
                <b>Phone:</b> ${row.Phone || ""}<br>
                <b>Website:</b>
                ${row.Website ? `<a href="${row.Website}" target="_blank">${row.Website}</a>` : 'N/A'}<br>
                <button class="popup-route-btn" onclick="getRouteTo(${latVal}, ${lngVal}, '${row.Name.replace(/'/g, "\\'")}')">Directions to here</button>
            `);

            markers.push({
                name: (row.Name || "").toLowerCase(),
                address: (row.Address || "").toLowerCase(),
                category: category,
                lat: latVal,
                lng: lngVal,
                marker: marker
            });
        });

        // Set initial count and stats
        document.getElementById("locations-count").innerText = markers.length;
        updateStats(markers.length, "all");
    }
});

document.getElementById("search").addEventListener("keyup", filterMarkers);
document.getElementById("category-filter").addEventListener("change", filterMarkers);
document.getElementById("area-filter").addEventListener("change", filterMarkers);
