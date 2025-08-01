'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Venue, Seat } from '@/types/venue.type';
import VenueMap from '@/components/VenueMap';
import SeatDetails from '@/components/SeatDetails';
import SelectionSummary from '@/components/Summary';
import Legend from '@/components/Legneds';

export default function Home() {
  const [venueData, setVenueData] = useState<Venue | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [selectedSeatDetails, setSelectedSeatDetails] = useState<Seat | null>(null);

  useEffect(() => {
    const loadVenueData = async () => {
      try {
        const response = await fetch('/venue.json');
        if (!response.ok) {
          throw new Error('Failed to fetch venue data');
        }
        const data: Venue = await response.json();
        setVenueData(data);
      } catch (error) {
        console.error('Error loading venue data:', error);
      }
    };

    loadVenueData();

    const savedSelection = localStorage.getItem('selectedSeats');
    if (savedSelection) {
      try {
        setSelectedSeats(JSON.parse(savedSelection));
      } catch (error) {
        console.error('Error parsing saved selection:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
  }, [selectedSeats]);

  const handleSeatClick = (seat: Seat) => {
    console.log('Seat clicked:', seat);

    if (seat.status !== 'available') {
      setSelectedSeatDetails(seat);
      return;
    }

    const isSelected = selectedSeats.some(s => s.id === seat.id);

    if (isSelected) {
      console.log(`Deselecting seat: ${seat.id}`);
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
    } else {
      if (selectedSeats.length < 8) {
        console.log(`Selecting seat: ${seat.id}`);
        setSelectedSeats(prev => [...prev, seat]);
      }
    }

    setSelectedSeatDetails(seat);
  };


  const calculateSubtotal = () => {
    return selectedSeats.reduce((total, seat) => {
      const priceMap: Record<number, number> = {
        1: 50,
        2: 75,
        3: 100,
        4: 150
      };
      return total + (priceMap[seat.priceTier] || 0);
    }, 0);
  };

  if (!venueData) {
    return (
      <section className="flex flex-col items-center justify-center min-h-screen space-y-6 bg-gray-100">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-96 w-full max-w-4xl rounded-lg" />
        <div className="flex space-x-4">
          <Skeleton className="h-32 w-64 rounded-lg" />
          <Skeleton className="h-32 w-64 rounded-lg" />
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto w-full">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">
          {venueData.name}
        </h1>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <VenueMap
              venueData={venueData}
              selectedSeats={selectedSeats}
              handleSeatClick={handleSeatClick}
              setSelectedSeatDetails={setSelectedSeatDetails}
            />
          </div>

          <div className="lg:w-80 space-y-6">
            <SeatDetails selectedSeatDetails={selectedSeatDetails} venueData={venueData} />
            <SelectionSummary
              selectedSeats={selectedSeats}
              calculateSubtotal={calculateSubtotal}
              setSelectedSeats={setSelectedSeats}
            />
            <Legend />
          </div>
        </div>
      </div>
    </section>
  );
}
