import React from 'react';
import { Seat } from '@/types/venue.type';

interface SelectionSummaryProps {
    selectedSeats: Seat[];
    calculateSubtotal: () => number;
    setSelectedSeats: React.Dispatch<React.SetStateAction<Seat[]>>;
}

const SelectionSummary: React.FC<SelectionSummaryProps> = ({ selectedSeats, calculateSubtotal, setSelectedSeats }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md border">
            <h3 className="text-lg font-semibold mb-3">
                Selected Seats ({selectedSeats.length}/8)
            </h3>

            {selectedSeats.length === 0 ? (
                <p className="text-gray-500 text-sm">No seats selected</p>
            ) : (
                <div className="space-y-3">
                    <div className="max-h-32 overflow-y-auto space-y-1">
                        {selectedSeats.map((seat) => (
                            <div key={seat.id} className="text-sm bg-gray-50 p-2 rounded flex justify-between items-center">
                                <span>{seat.id}</span>
                                <button
                                    onClick={() => setSelectedSeats(prev => prev.filter(s => s.id !== seat.id))}
                                    className="text-red-500 hover:text-red-700"
                                    aria-label={`Remove seat ${seat.id}`}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-3">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">Subtotal:</span>
                            <span className="font-bold text-lg">${calculateSubtotal()}</span>
                        </div>
                    </div>

                    <button
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                        disabled={selectedSeats.length === 0}
                    >
                        Proceed to Checkout
                    </button>
                </div>
            )}
        </div>
    );
};

export default SelectionSummary;
