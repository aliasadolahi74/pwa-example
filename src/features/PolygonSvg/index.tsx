import React from "react";

const PolygonSvg = ({
    polygon,
    size = 64,
    strokeWidth = 2,
}: {
    polygon: Array<[number, number]>;
    size?: number;
    strokeWidth?: number;
}) => {
    const padding = strokeWidth;
    const minX = Math.min(...polygon.map((p) => p[0]));
    const maxX = Math.max(...polygon.map((p) => p[0]));
    const minY = Math.min(...polygon.map((p) => p[1]));
    const maxY = Math.max(...polygon.map((p) => p[1]));

    // Calculate scale factors
    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    const scale = Math.min((size - 2 * padding) / rangeX, (size - 2 * padding) / rangeY);

    // Calculate the center of the polygon
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Calculate translation to center the polygon
    const translateX = size / 2 - (centerX - minX) * scale;
    const translateY = size / 2 - (centerY - minY) * scale;

    // Scale and translate points
    const scaledPoints = polygon.map(([x, y]) => [
        (x - minX) * scale + translateX,
        size - ((y - minY) * scale + translateY), // Invert Y-axis and translate
    ]);

    // Create SVG
    const pointsString = scaledPoints.map((p) => p.join(",")).join(" ");
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${size} ${size}`}
        >
            <polygon
                points={pointsString}
                fill="#789BD080"
                stroke="#81A4D8"
                strokeWidth={strokeWidth}
            />
        </svg>
    );
};

export default PolygonSvg;
