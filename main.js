/* main.js */
const map = L.map('map').setView([12.9716, 77.5946], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

const markers = [];

function getColor(category) {
    category = (category || "").toLowerCase();
    if (category.includes("restaurant")) return "red";
    if (category.includes("cafe")) return "orange";
    if (category.includes("hotel")) return "blue";
    if (category.includes("pub") || category.includes("bar")) return "violet";
    if (category.includes("school") || category.includes("college") || category.includes("university")) return "green";
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

Papa.parse("bangalore_locations.csv", {
    download: true,
    header: true,
    complete: function (results) {
        results.data.forEach(row => {
            if (!row.Latitude || !row.Longitude) return;

            const marker = L.marker(
                [parseFloat(row.Latitude), parseFloat(row.Longitude)],
                { icon: markerIcon(getColor(row.Category)) }
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
                marker: marker
            });
        });
    }
});

document.getElementById("search").addEventListener("keyup", function () {
    const text = this.value.toLowerCase();
    markers.forEach(m => {
        if (m.name.includes(text)) {
            m.marker.setOpacity(1);
        } else {
            m.marker.setOpacity(0.2);
        }
    });
});
