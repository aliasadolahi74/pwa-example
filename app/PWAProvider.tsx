"use client";
import React, {useEffect} from 'react';

const PWAProvider = ({children}: { children: React.ReactNode }) => {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(registration => {
                        console.log('Service Worker registered with scope:', registration.scope);

                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            console.log('Service Worker update found!');

                            newWorker!.addEventListener('statechange', () => {
                                if (newWorker!.state === 'installed') {
                                    if (navigator.serviceWorker.controller) {
                                        console.log('New content is available; please refresh.');
                                        // You can show a notification to the user here
                                    } else {
                                        console.log('Content is cached for offline use.');
                                    }
                                }
                            });
                        });
                    })
                    .catch(error => {
                        console.error('Service Worker registration failed:', error);
                    });
            });

            let refreshing = false;
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (!refreshing) {
                    window.location.reload();
                    refreshing = true;
                }
            });
        }
    }, []);

    return (
        <>
            {children}
        </>
    );
};

export default PWAProvider;