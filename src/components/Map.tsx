import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { Place } from "../types/place";

import "leaflet/dist/leaflet.css";

interface MapProps {
    latitude: number;
    longitude: number;
    place?: Place;
}

function Map({ latitude, longitude, place }: MapProps) {
    return (
        <MapContainer
            center={[latitude, longitude]}
            zoom={13}
            scrollWheelZoom={false}
            className="h-[400px] w-full rounded-3xl"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {place && (
                <Marker position={[place.latitude, place.longitude]}>
                    <Popup>
                        <strong>{place.name}</strong>
                        <br />
                        {place.type}
                    </Popup>
                </Marker>
            )}
        </MapContainer>
    );
}

export default Map;