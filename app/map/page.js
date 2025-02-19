"use client"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { useSearchParams } from "next/navigation";
import "leaflet/dist/leaflet.css";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import L from "leaflet";

const redIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41], // Size of the icon
    iconAnchor: [12, 41], // Point where the icon is anchored
    popupAnchor: [1, -34], // Point where the popup should open
    shadowSize: [41, 41], // Size of the shadow
});

const center = {
    lat: 25.3176,
    lng: 82.9739,
}

const Map = () => {
    const searchParams = useSearchParams();
    const [reports, setReports] = useState([]);
    const [position, setPosition] = useState(center);
    const [title, setTitle] = useState(""); 
    const [description, setDescription] = useState("");  
    const markerRef = useRef(null);

        //  Get coordinates from URL (if any)
        const urlLat = searchParams.get("lat");
        const urlLng = searchParams.get("lng");
    
        const initialCenter = urlLat && urlLng ? { lat: parseFloat(urlLat), lng: parseFloat(urlLng) } : center;

    // Fetch reports on mount
    useEffect(() => {
        fetch("/api/reports")
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setReports(data)
            })
            .catch((err) => console.error("Error fetching reports:", err));
    }, []);

    // const eventHandlers = useMemo(
    //     () => ({
    //         dragend() {


    //             const marker = markerRef.current;
    //             if (marker != null) {
    //                 const newPosition = marker.getLatLng();
    //                 setPosition(newPosition);

    //                 // ✅ Send updated latitude & longitude to backend
    //                 fetch("/api/reports", {
    //                     method: "POST",
    //                     headers: { "Content-Type": "application/json" },

    //                     body: JSON.stringify({

    //                         title:"hbdk",
    //                         description:"jbsd",

    //                         latitude: newPosition.lat,
    //                         longitude: newPosition.lng,
    //                     })
    //                 ,
    //                 })
    //                 .then((res) => res.json())
    //                 .then((data) => console.log("Updated report:", data))
    //                 .catch((err) => console.error("Error updating marker:", err));
    //             }

    //         },
    //     }),
    //     []
    // );





    // Drag event handler
    const eventHandlers = useMemo(() => ({
        dragend() {
            const marker = markerRef.current;
            if (marker) {
                const newPosition = marker.getLatLng();
                                //  Prevent empty title/description submissions
                                if (!title.trim() || !description.trim()) {
                                    alert("Please enter a title and description before submitting.");
                                    return;
                                }

                setPosition(newPosition);

                //  Send the updated data to the backend
                fetch("/api/reports", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title,
                        description,
                        latitude: newPosition.lat,
                        longitude: newPosition.lng,
                    }),
                })
                .then((res) => res.json())
                .then((data) => {
                    setReports([...reports, data]); // Add new marker as static
                    setTitle(""); // Reset title
                    setDescription(""); // Reset description
                    setPosition(center); // Reset position for new draggable marker
                })
                .catch((err) => console.error("Error updating marker:", err));
            }
        },
    }), [title, description, reports]);

    return (
        <div className="p-5 m-auto">

            <MapContainer center={[center.lat, center.lng]} zoom={13} className="h-screen rounded-2xl w-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {reports.map((report) => (
                    <Marker icon={redIcon} key={report.id} position={[report.latitude, report.longitude]}>
                        <Popup>
                            <b>{report.title}</b> <br />
                            {report.description}
                        </Popup>
                    </Marker>
                ))}

              
            </MapContainer>
        </div>
    );
};

export default Map;
