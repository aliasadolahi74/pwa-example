import React from 'react';
import Link from "next/link";

const OfflinePage = () => {
    return (
        <h1>
            You are offline --- 1!
            <Link href="/offline2">Link</Link>
        </h1>
    );
};

export default OfflinePage;