import React from 'react';
import { Seat, Venue } from '@/types/venue.type';

interface SeatDetailsProps {
    selectedSeatDetails: Seat | null;
    venueData: Venue;
}

const SeatDetails: React.FC<SeatDetailsProps> = ({ selectedSeatDetails, venueData }) => {
    if (!selectedSeatDetails) return null;

    const section = venueData.sections.find(s =>
        s.rows.some(r => r.seats.some(seat => seat.id === selectedSeatDetails.id))
    );

    const row = venueData.sections
        .flatMap(s => s.rows)
        .find(r => r.seats.some(seat => seat.id === selectedSeatDetails.id));

    return (
        <div className="bg-white p-4 rounded-lg shadow-md border">
            <h3 className="text-lg font-semibold mb-3">Seat Details</h3>
            <div className="space-y-2 text-sm">
                <p><span className="font-medium">Seat ID:</span> {selectedSeatDetails.id}</p>
                <p><span className="font-medium">Section:</span> {section?.label}</p>
                <p><span className="font-medium">Row:</span> {row?.index}</p>
                <p><span className="font-medium">Seat:</span> {selectedSeatDetails.col}</p>
                <p><span className="font-medium">Price Tier:</span> {selectedSeatDetails.priceTier}</p>
                <p><span className="font-medium">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${selectedSeatDetails.status === 'available' ? 'bg-green-100 text-green-800' :
                        selectedSeatDetails.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                            selectedSeatDetails.status === 'sold' ? 'bg-red-100 text-red-800' :
                                'bg-orange-100 text-orange-800'
                        }`}>
                        {selectedSeatDetails.status}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default SeatDetails;
