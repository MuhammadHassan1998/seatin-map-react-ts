// types.ts
export type SeatStatus = 'available' | 'reserved' | 'sold' | 'held';

export interface Seat {
    id: string;
    col: number;
    x: number;
    y: number;
    priceTier: number;
    status: SeatStatus;
}

export interface Row {
    index: number;
    seats: Seat[];
}

export interface Transform {
    x: number;
    y: number;
    scale: number;
}

export interface Section {
    id: string;
    label: string;
    transform: Transform;
    rows: Row[];
}

export interface Map {
    width: number;
    height: number;
}

export interface Venue {
    venueId: string;
    name: string;
    map: Map;
    sections: Section[];
}

