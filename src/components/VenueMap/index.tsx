import React, { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Seat, Section, Venue } from '@/types/venue.type';

interface VenueMapProps {
    venueData: Venue;
    selectedSeats: Seat[];
    handleSeatClick: (seat: Seat) => void;
    setSelectedSeatDetails: (seat: Seat) => void;
}

const VenueMap: React.FC<VenueMapProps> = ({
    venueData,
    selectedSeats,
    handleSeatClick,
    setSelectedSeatDetails
}) => {
    const [focusedSeatId, setFocusedSeatId] = useState<string | null>(null);
    const seatRefs = useRef<{ [key: string]: SVGCircleElement }>({});

    useEffect(() => {
        const firstAvailableSeat = Object.values(seatRefs.current).find(el => el?.ariaDisabled !== 'true');
        if (firstAvailableSeat) {
            firstAvailableSeat.focus();
            setFocusedSeatId(firstAvailableSeat.getAttribute('data-id') || null);
        }
    }, [venueData]);

    const handleKeyDown = (event: KeyboardEvent) => {
        if (!focusedSeatId) return;

        const directionMapping: { [key: string]: { x: number, y: number } } = {
            ArrowUp: { x: 0, y: -1 },
            ArrowDown: { x: 0, y: 1 },
            ArrowLeft: { x: -1, y: 0 },
            ArrowRight: { x: 1, y: 0 },
        };

        if (directionMapping[event.key]) {
            event.preventDefault();
            const direction = directionMapping[event.key];

            // Find current seat and section
            const flatSeats = venueData.sections
                .flatMap((section) => section.rows)
                .flatMap((row) => row.seats);

            const currentSeatIndex = flatSeats.findIndex((seat) => seat.id === focusedSeatId);

            let nextSeat = null;

            if (direction.y !== 0) {
                const rowIndex = Math.floor(currentSeatIndex / venueData.sections[0].rows[0].seats.length);
                const nextRowIndex = rowIndex + direction.y;

                if (nextRowIndex >= 0 && nextRowIndex < venueData.sections[0].rows.length) {
                    nextSeat = venueData.sections[0].rows[nextRowIndex].seats[currentSeatIndex % venueData.sections[0].rows[0].seats.length];
                }
            } else if (direction.x !== 0) {
                const nextSeatIndex = currentSeatIndex + direction.x;
                if (nextSeatIndex >= 0 && nextSeatIndex < flatSeats.length) {
                    nextSeat = flatSeats[nextSeatIndex];
                }
            }

            if (nextSeat) {
                setFocusedSeatId(nextSeat.id);
                seatRefs.current[nextSeat.id]?.focus();
            }
        }

        if (event.key === 'Enter' || event.key === ' ') {
            const seatToToggle = venueData.sections
                .flatMap((section) => section.rows)
                .flatMap((row) => row.seats)
                .find((seat) => seat.id === focusedSeatId);

            if (seatToToggle) {
                console.log(`Toggling seat: ${seatToToggle.id}`);
                handleSeatClick(seatToToggle);
            }
        }
    };

    const getSeatColor = (seat: Seat, isSelected: boolean) => {
        if (isSelected) return 'fill-blue-600 hover:fill-blue-700';

        switch (seat.status) {
            case 'available':
                return 'fill-green-500 hover:fill-green-600';
            case 'reserved':
                return 'fill-yellow-500 hover:fill-yellow-600';
            case 'sold':
                return 'fill-red-500 hover:fill-red-600';
            case 'held':
                return 'fill-orange-500 hover:fill-orange-600';
            default:
                return 'fill-gray-500 hover:fill-gray-600';
        }
    };

    return (
        <div className="relative overflow-auto border border-gray-300 rounded-lg bg-white">
            <svg
                width={venueData.map.width}
                height={venueData.map.height}
                viewBox={`0 0 ${venueData.map.width} ${venueData.map.height}`}
                className="w-full h-auto max-h-[70vh]"
                role="application"
                aria-label={`Interactive seating map for ${venueData.name}. Use Tab or arrow keys to navigate between seats, Enter or Space to select/deselect.`}
            >
                {venueData.sections.map((section: Section) =>
                    section.rows.map((row) =>
                        row.seats.map((seat: Seat) => {
                            const isSelected = selectedSeats.some(s => s.id === seat.id);
                            const transform = section.transform;
                            const seatX = transform.x + seat.x * transform.scale;
                            const seatY = transform.y + seat.y * transform.scale;

                            return (
                                <g key={seat.id}>
                                    <circle
                                        cx={seatX}
                                        cy={seatY}
                                        r="12"
                                        className={`cursor-pointer transition-colors  focus:ring-4 focus:ring-blue-800 ${getSeatColor(seat, isSelected)} ${focusedSeatId === seat.id ? 'ring-4 ring-blue-500' : ''}`}
                                        stroke={isSelected ? '#1e40af' : '#374151'}
                                        strokeWidth={isSelected ? '3' : '1'}
                                        onClick={() => handleSeatClick(seat)}
                                        onFocus={() => setSelectedSeatDetails(seat)}
                                        ref={(el) => {
                                            if (el) {
                                                seatRefs.current[seat.id] = el;
                                            }
                                        }}
                                        tabIndex={0}
                                        onKeyDown={handleKeyDown}
                                        data-id={seat.id}
                                        data-status={seat.status}
                                        aria-label={`Seat ${seat.col}, Row ${row.index}, Section ${section.label}. Status: ${seat.status}. Price tier ${seat.priceTier}. ${seat.status === 'available'
                                            ? (isSelected ? 'Currently selected. Press Enter or Space to deselect.' : 'Available for selection. Press Enter or Space to select.')
                                            : 'Not available for selection.'}`}
                                        aria-pressed={seat.status === 'available' ? isSelected : undefined}
                                        aria-disabled={seat.status !== 'available'}
                                        role="button"
                                    />
                                    <text
                                        x={seatX}
                                        y={seatY + 4}
                                        textAnchor="middle"
                                        className="text-xs fill-white pointer-events-none font-medium"
                                    >
                                        {seat.col}
                                    </text>
                                </g>
                            );
                        })
                    )
                )}
            </svg>
        </div>
    );
};

export default VenueMap;
