export const displayMap = (locations) => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiLXZpbmF5a3VtYXIiLCJhIjoiY2xzaXJyOXExMjdvMjJpbzVha3BwczgzNyJ9.d0TnTuv30YVQ9mtYQIfkNA';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/-vinaykumar/clsis5jkr008q01quhecu0q1f',
        scrollZoom: false
    });

    const bounds = new mapboxgl.LngLatBounds();
    locations.forEach(loc => {
        const el = document.createElement('div');
        el.className = 'marker';
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        }).setLngLat(loc.coordinates)
            .addTo(map);
        new mapboxgl.Popup({
            offset: 30
        }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    })
};