/* main.js */
const map = L.map('map').setView([12.9716, 77.5946], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

const markers = [];

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

        if (matchesSearch && matchesCategory) {
            if (!map.hasLayer(m.marker)) {
                map.addLayer(m.marker);
            }
        } else {
            if (map.hasLayer(m.marker)) {
                map.removeLayer(m.marker);
            }
        }
    });
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
