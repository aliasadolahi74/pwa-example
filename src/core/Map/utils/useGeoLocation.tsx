import React, {useEffect} from 'react';

const UseGeoLocation = () => {

    const [latitude, setLatitude] = React.useState<number>(0);
    const [longitude, setLongitude] = React.useState<number>(0);
    const [altitude, setAltitude] = React.useState<number | null>(0);
    const [accuracy, setAccuracy] = React.useState<number | null>(0);

    const watchCurrentLocation = async () => {
        if (navigator.geolocation) {
            return await new Promise((resolve) => {
                navigator.geolocation.watchPosition(
                    (position) => {
                        const {accuracy, latitude, longitude, altitude} = position.coords;
                        setLatitude(latitude);
                        setLongitude(longitude);
                        setAltitude(altitude);
                        setAccuracy(accuracy);
                        resolve({latitude, longitude, altitude, accuracy});
                    },
                    (e) => {
                        if (e.code === 1) {
                            alert("You must allow using location manually")
                        }
                        console.log(e);
                    },
                    {timeout: 500, enableHighAccuracy: true}
                );
            });
        } else {
            alert("You must access to location")
        }
    };

    useEffect(() => {
        watchCurrentLocation();
    }, []);


    return {latitude, longitude, altitude, accuracy};
};

export default UseGeoLocation;