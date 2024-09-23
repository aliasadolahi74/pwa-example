import { useState, useEffect, useRef } from 'react';

interface GeoLocationState {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number | null;
    timestamp: number;
}

const useGeoLocation = (interval: number = 3000) => {
    const [state, setState] = useState<GeoLocationState>({
        latitude: 0,
        longitude: 0,
        altitude: null,
        accuracy: null,
        timestamp: 0,
    });

    const watchId = useRef<number | null>(null);
    const lastUpdate = useRef<number>(0);

    useEffect(() => {
        const watchCurrentLocation = () => {
            if ('geolocation' in navigator) {
                watchId.current = navigator.geolocation.watchPosition(
                    (position) => {
                        const now = Date.now();
                        if (now - lastUpdate.current >= interval) {
                            const { latitude, longitude, altitude, accuracy } = position.coords;
                            setState({
                                latitude,
                                longitude,
                                altitude,
                                accuracy,
                                timestamp: position.timestamp,
                            });
                            lastUpdate.current = now;
                        }
                    },
                    (error) => {
                        console.error('Geolocation error:', error);
                        if (error.code === 1) {
                            alert("You must allow using location manually");
                        }
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0,
                    }
                );
            } else {
                alert("Geolocation is not supported by this browser");
            }
        };

        watchCurrentLocation();

        return () => {
            if (watchId.current !== null) {
                navigator.geolocation.clearWatch(watchId.current);
            }
        };
    }, [interval]);

    return state;
};

export default useGeoLocation;