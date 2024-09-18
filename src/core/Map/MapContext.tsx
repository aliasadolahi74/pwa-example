"use client";
import {LatLng} from "leaflet";
import useGeoLocation from "@/src/core/Map/utils/useGeoLocation";
import {useMap} from "react-leaflet";
import {useEffect} from "react";

const MapContext = () => {

    const map = useMap()
    const response = useGeoLocation();

    useEffect(() => {
        map.setView(new LatLng(response.latitude, response.longitude), 10);
        // const marker = new L.Marker([response.longitude, response.latitude], {
        //     icon: L.icon({
        //         iconSize: [20, 20],
        //         iconUrl: "/assets/images/marker.png",
        //     })
        // });
        // map.addLayer(marker)
    }, []);



    return <></>;
};

export default MapContext;