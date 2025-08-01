const fs = require('fs');

// Function to generate large venue data
const generateLargeVenueData = (totalRows, seatsPerRow) => {
    const venue = {
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
        const row = {
            index: i + 1,
            seats: []
        };
        for (let j = 0; j < seatsPerRow; j++) {
            const seat = {
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

// Example usage
const largeData = generateLargeVenueData(15, 10);  // 150 rows, 100 seats per row

// Save the generated data to a JSON file
fs.writeFile('venueData.json', JSON.stringify(largeData, null, 2), (err) => {
    if (err) {
        console.error('Error writing to file', err);
    } else {
        console.log('Venue data saved successfully!');
    }
});
