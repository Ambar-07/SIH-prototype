
## SIH Public Transport Tracking System

### Setup Instructions

1. Install dependencies:
	 ```
	 npm install
	 ```
2. Start the development server:
	 ```
	 npm run dev
	 ```
3. Open the app in your browser (usually http://localhost:5173).

### Demo Data

- **Vehicle IDs:**
	- UPES-25 (default demo vehicle)
	- UPES-26, UPES-27, UPES-28
- **Routes:**
	- DDN-RSK: Dehradun to Rishikesh
	- RSK-DDN: Rishikesh to Dehradun
	- UPES-CLK: UPES Dehradun to Clock Tower

#### Default Demo Route (UPES Dehradun → Clock Tower)

Stops:
1. UPES Dehradun (30.4180, 77.9685)
2. Bidholi Chowk (30.4065, 77.9668)
3. Premnagar (30.3849, 77.9582)
4. Ballupur Chowk (30.3365, 77.9886)
5. Clock Tower (30.3244, 78.0419)

### Notes
- All references to old demo IDs (NYC-2001, 1001, 1002) and routes have been removed.
- UI elements, dropdowns, and dashboard tables now use the updated IDs and names.

