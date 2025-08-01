import React from 'react';

const Legend: React.FC = () => (
    <div className="bg-white p-4 rounded-lg shadow-md border">
        <h3 className="text-lg font-semibold mb-3">Legend</h3>
        <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span>Available</span>
            </div>
            <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                <span>Selected</span>
            </div>
            <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span>Reserved</span>
            </div>
            <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span>Sold</span>
            </div>
            <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <span>Held</span>
            </div>
        </div>
    </div>
);

export default Legend;
