/* main.js */
const map = L.map('map').setView([12.9716, 77.5946], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

const markers = [];

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

function filterMarkers() {
    const searchText = document.getElementById("search").value.toLowerCase();
    const selectedCategory = document.getElementById("category-filter").value.toLowerCase();
    const selectedArea = document.getElementById("area-filter").value.toLowerCase();

    let visibleLatLngs = [];

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
            const aliases = areaAliases[selectedArea] || [selectedArea];
            matchesArea = aliases.some(alias => m.address.includes(alias) || m.name.includes(alias));
        }

        if (matchesSearch && matchesCategory && matchesArea) {
            if (!map.hasLayer(m.marker)) {
                map.addLayer(m.marker);
            }
            visibleLatLngs.push(m.marker.getLatLng());
        } else {
            if (map.hasLayer(m.marker)) {
                map.removeLayer(m.marker);
            }
        }
    });

    if (selectedArea !== "all" && visibleLatLngs.length > 0) {
        const bounds = L.latLngBounds(visibleLatLngs);
        map.fitBounds(bounds, { padding: [50, 50] });
    }
}

Papa.parse("bangalore_medical_database.csv?v=" + new Date().getTime(), {
    download: true,
    header: true,
    complete: function (results) {
        results.data.forEach(row => {
            if (!row.Latitude || !row.Longitude) return;

            const category = (row.Category || "").toLowerCase();
            const marker = L.marker(
                [parseFloat(row.Latitude), parseFloat(row.Longitude)],
                { icon: markerIcon(getColor(category)) }
            ).addTo(map);

            marker.bindPopup(`
                <b>${row.Name || ""}</b><br>
                <b>Category:</b> ${row.Category || ""}<br>
                <b>Address:</b> ${row.Address || ""}<br>
                <b>Phone:</b> ${row.Phone || ""}<br>
                <b>Website:</b>
                <a href="${row.Website || '#'}" target="_blank">
                  ${row.Website || ""}
                </a>
            `);

            markers.push({
                name: (row.Name || "").toLowerCase(),
                address: (row.Address || "").toLowerCase(),
                category: category,
                marker: marker
            });
        });
    }
});

document.getElementById("search").addEventListener("keyup", filterMarkers);
document.getElementById("category-filter").addEventListener("change", filterMarkers);
document.getElementById("area-filter").addEventListener("change", filterMarkers);
