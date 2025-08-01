import { Row, Seat, Venue } from "@/types/venue.type";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const generateLargeVenueData = (totalRows: number, seatsPerRow: number): Venue => {
  const venue: Venue = {
    venueId: "arena-01",
    name: "Metropolis Arena",
    map: { width: 1024, height: 768 },
    sections: [
      {
        id: "A",
        label: "Lower Bowl A",
        transform: { x: 0, y: 0, scale: 1 },
        rows: []
      }
    ]
  };

  for (let i = 0; i < totalRows; i++) {
    const row: Row = {
      index: i + 1,
      seats: []
    };
    for (let j = 0; j < seatsPerRow; j++) {
      const seat: Seat = {
        id: `A-${i + 1}-${j + 1}`,
        col: j + 1,
        x: 50 + j * 80,
        y: 40 + i * 40,
        priceTier: 1,
        status: i % 2 === 0 ? "available" : "reserved"
      };
      row.seats.push(seat);
    }
    venue.sections[0].rows.push(row);
  }

  return venue;
};



console.log(generateLargeVenueData(150, 100));