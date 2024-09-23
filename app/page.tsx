"use client";
import dynamic from "next/dynamic";

import useGeoLocation from "@/src/core/Map/utils/useGeoLocation";
import {useEffect, useRef, useState} from "react";

const Map = dynamic(() => import("@/src/core/Map"), {ssr: false});
import measureDistance from "@/src/core/Map/utils/measureDistance";
import {toast} from "react-toastify";
import PolygonSvg from "@/src/features/PolygonSvg";
import {coordinates} from "@/src/core/Map/utils/mock";

type ISinglePoint = { latitude: number; longitude: number }
type IPoints = ISinglePoint[];

export default function Home() {
    const response = useGeoLocation(1000);
    const [started, setStarted] = useState(false);
    const [points, setPoints] = useState<IPoints>([]);
    const interval = useRef<NodeJS.Timeout>();
    const [distanceToStart, setDistanceToStart] = useState<number>(0);
    const [distanceToLast, setDistanceToLast] = useState<number>(0);


    const perpendicularDistance = (point: ISinglePoint, lineStart: ISinglePoint, lineEnd: ISinglePoint): number => {
        const dx = lineEnd.longitude - lineStart.longitude;
        const dy = lineEnd.latitude - lineStart.latitude;

        const mag = Math.sqrt(dx * dx + dy * dy);
        if (mag > 0) {
            return Math.abs((dy * point.longitude - dx * point.latitude + lineEnd.longitude * lineStart.latitude - lineEnd.latitude * lineStart.longitude) / mag);
        }
        return 0;
    }

    const calculateDynamicEpsilon = (points: IPoints, targetAccuracyMeters: number = 2): number => {
        // Find the average latitude of all points
        const avgLatitude = points.reduce((sum, point) => sum + point.latitude, 0) / points.length;

        // Calculate the length of one degree of latitude and longitude at this latitude
        const latDegreeLength = 111132.92 - 559.82 * Math.cos(2 * avgLatitude * Math.PI / 180) + 1.175 * Math.cos(4 * avgLatitude * Math.PI / 180);
        const lonDegreeLength = 111412.84 * Math.cos(avgLatitude * Math.PI / 180) - 93.5 * Math.cos(3 * avgLatitude * Math.PI / 180);

        // Calculate epsilon for both latitude and longitude
        const latEpsilon = targetAccuracyMeters / latDegreeLength;
        const lonEpsilon = targetAccuracyMeters / lonDegreeLength;

        // Use the smaller of the two to ensure we meet the accuracy requirement for both dimensions
        return Math.min(latEpsilon, lonEpsilon);
    }


    const simplifyPolygon = async (points: IPoints, epsilon: number): Promise<IPoints> => {
        return new Promise(async (resolve) => {
            // Find the point with the maximum distance
            let maxDistance = 0;
            let index = 0;
            const firstPoint = points[0];
            const lastPoint = points[points.length - 1];

            for (let i = 1; i < points.length - 1; i++) {
                const distance = perpendicularDistance(points[i], firstPoint, lastPoint);
                if (distance > maxDistance) {
                    maxDistance = distance;
                    index = i;
                }
            }
            if (maxDistance > epsilon) {
                const results1 = await simplifyPolygon(points.slice(0, index + 1), epsilon);
                const results2 = await simplifyPolygon(points.slice(index), epsilon);
                resolve([...results1.slice(0, -1), ...results2]);
            } else {
                resolve([firstPoint, lastPoint]);
            }
        })
    }


    const setData = (callback?: () => void) => {
        if (response.accuracy) {
            if (response.accuracy < 20) {
                callback ? callback() : undefined;
            } else {
                toast("Low Accuracy", {type: "error", theme: "colored"});
            }
        } else {
            toast("No Accuracy attribute found", {type: "error", theme: "colored"});
        }
    }

    const handleClickStart = () => {
        setData(() => {
            setPoints([{latitude: response.latitude, longitude: response.longitude}]);
            setStarted(true)
        })
    }

    useEffect(() => {
        interval.current = setInterval(() => {
            if (started) {
                const draft: IPoints = [...points];
                const currentPoint = {
                    latitude: response.latitude,
                    longitude: response.longitude,
                    altitude: response.altitude || null
                };
                if (points.length > 0) {
                    const startingPoint = points[0];
                    const lastPoint = points[points.length - 1];
                    const distanceToStartingPoint = measureDistance(startingPoint, currentPoint);
                    const distanceToLastPoint = measureDistance(lastPoint, currentPoint);
                    setDistanceToLast(distanceToLastPoint);
                    setDistanceToStart(distanceToStartingPoint);
                    if (distanceToStartingPoint < 1 && points.length > 2) {
                        toast("Do you want to finish it?", {type: "info", theme: "colored"});
                    }
                    if (distanceToLastPoint >= 1) {
                        setData(async () => {
                            draft.push(currentPoint);
                            const epsilon = calculateDynamicEpsilon(draft);
                            const result = await simplifyPolygon(draft, epsilon);
                            setPoints(result)
                        })
                    }
                } else {
                    setData(() => {
                        draft.push(currentPoint);
                        setPoints(draft)
                    })
                }

            }
        }, 500);
        return () => {
            if(interval.current) {
                clearInterval(interval.current)
            }
        };
    }, [started, points, response]);


    const handleEndBtnClick = async () => {
        setStarted(false);
        const draft = [...points];
        const epsilon = calculateDynamicEpsilon(draft)
        const result = await simplifyPolygon(draft, epsilon);
        result.push({latitude: points[0].latitude, longitude: points[0].longitude});
        setPoints(result)
        clearInterval(interval.current);
    }


    return (
        <div className="flex flex-col min-h-screen w-full">
            <div className="p-4 flex flex-grow w-full">
                <div className="flex flex-col items-center w-full bg-white">
                    <div className="h-full w-full flex flex-col">
                        <div className="border-b border-b-gray-500 h-[70%] w-full relative mb-4"><Map/></div>
                        <div className="w-full top-0 right-0 text-black">
                            <div><span>latitude:</span> <span>{response.latitude}</span></div>
                            <div><span>longitude:</span> <span>{response.longitude}</span></div>
                            <div><span>altitude:</span> <span>{response.altitude}</span></div>
                            <div><span>accuracy:</span> <span>{response.accuracy}</span></div>
                            <div><span>distance to start:</span> <span>{distanceToStart}</span></div>
                            <div><span>distance to last:</span> <span>{distanceToLast}</span></div>
                        </div>
                    </div>

                    <hr/>


                    {started ? <button onClick={handleEndBtnClick}
                                       className="bg-red-500 text-white px-4 rounded-lg py-2">Stop</button> :
                        <button onClick={handleClickStart}
                                className="bg-teal-500 text-white px-4 rounded-lg py-2">Start</button>}


                    <div className="flex flex-col items-center mt-4 w-full">
                        <table className="table-auto w-full">
                            <thead>
                            <tr>
                                <th>Latitude</th>
                                <th>Longitude</th>
                            </tr>
                            </thead>
                            <tbody>
                            {points.map((point, i) => (
                                <tr key={`${i}-${Math.random()}`}>
                                    <td>{point.latitude}</td>
                                    <td>{point.longitude}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        {!started && points.length > 0 ?
                            <PolygonSvg polygon={points.map(item => [item.latitude, item.longitude])}/> :
                            <span>Polygon not completed</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}
