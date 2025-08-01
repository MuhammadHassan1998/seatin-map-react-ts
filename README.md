# Interactive Event Seating Map

## Overview

This project is a **React + TypeScript** application that renders an interactive seating map for an event. The user can navigate the map, select seats, and see the details of each selected seat. The application allows the user to select up to **8 seats**, with a **live summary** of the selections, and it persists the selection after page reload via **localStorage**.

### Features:
- Displays an interactive map of available, reserved, sold, and held seats.
- Allows users to select seats by mouse click and keyboard navigation (arrow keys, Enter/Space).
- Updates the seat selection summary dynamically, showing the subtotal for selected seats.
- Persists seat selection in the browser across page reloads using **localStorage**.
- Provides **keyboard accessibility** (focus management) and **aria-labels** for screen readers.
- Fully responsive, working on both desktop and mobile devices.

## Architecture Choices & Trade-offs

- **React + TypeScript**: TypeScript was chosen to ensure type safety and better developer experience. The application uses modern React practices (like hooks) for managing state and side effects.
- **SVG for rendering seats**: Using an SVG element allows precise control over seat positions and provides an interactive, scalable solution for rendering thousands of seats, ensuring smooth rendering at 60 FPS for large arenas (up to 15,000 seats).
- **State Management**: React's built-in `useState` and `useEffect` hooks are used to manage seat selection and persist the state in `localStorage`.
- **Keyboard Navigation**: The app implements keyboard navigation for accessibility, allowing users to navigate between seats using arrow keys and select/deselect seats with Enter or Space.
- **Accessibility**: Seats have `aria-label` attributes for accessibility. The app uses `aria-pressed` for the selected seats and ensures that focus is managed correctly for keyboard navigation.
- **Responsiveness**: The UI is responsive and adjusts for mobile devices, allowing users to interact with the seating map using both mouse and touch gestures.

### Trade-offs:
- While this app handles basic features like seat selection and display, certain stretch goals (such as live seat-status updates over WebSocket) were not implemented in this initial version. However, the code is structured to easily incorporate such features if required.
- Performance optimizations like seat virtualization or lazy loading of seats were not implemented in this version, but they could be considered for future improvements, especially for large arenas with thousands of seats.

## How to Run the Project
- pnpm install
- pnpm dev