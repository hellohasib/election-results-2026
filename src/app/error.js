
'use client'; // Error components must be Client Components

import { useEffect } from 'react';

export default function Error({ error, reset }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
            <h2 className="text-2xl font-bold mb-4 text-red-500">Something went wrong!</h2>
            <p className="mb-4 text-gray-400 max-w-md text-center">
                We encountered an error while loading the election data. This might be due to a temporary issue with the Google Sheet connection.
            </p>
            <button
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
                className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
                Try again
            </button>
        </div>
    );
}
