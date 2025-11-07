// Bay Area Kayak Trip Planner - Interactive Trip Planning
(function() {
    'use strict';

    // Trip location data with NOAA station IDs for tide predictions
    const tripLocations = {
        'china-camp': {
            name: 'China Camp to the Sisters',
            location: 'China Camp, San Pablo Bay',
            noaaStation: '9415102', // Point San Pedro
            lat: 38.0017,
            lon: -122.4869
        },
        'point-richmond': {
            name: 'Point Richmond to Brooks Island',
            location: 'Point Richmond',
            noaaStation: '9414863', // Richmond
            lat: 37.9295,
            lon: -122.3814
        },
        'crissy-field': {
            name: 'Crissy Field to The Ramp',
            location: 'Crissy Field, San Francisco',
            noaaStation: '9414290', // San Francisco
            lat: 37.8054,
            lon: -122.4658
        },
        'farallon': {
            name: 'The Farallon Islands',
            location: 'San Francisco Coast',
            noaaStation: '9414290', // San Francisco (closest)
            lat: 37.7749,
            lon: -122.4194
        }
    };

    // Initialize the trip planner when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        const tripSelect = document.getElementById('trip-select');
        const dateInput = document.getElementById('trip-date');
        const getTidesBtn = document.getElementById('get-tides-btn');
        const tideResults = document.getElementById('tide-results');
        const tideData = document.getElementById('tide-data');

        // Set minimum date to today
        const today = new Date();
        dateInput.min = today.toISOString().split('T')[0];
        
        // Set default date to today
        dateInput.value = today.toISOString().split('T')[0];

        // Handle get tides button click
        getTidesBtn.addEventListener('click', function() {
            const selectedTrip = tripSelect.value;
            const selectedDate = dateInput.value;

            if (!selectedTrip) {
                alert('Please select a trip route');
                return;
            }

            if (!selectedDate) {
                alert('Please select a date');
                return;
            }

            getTideInfo(selectedTrip, selectedDate);
        });

        function getTideInfo(tripId, date) {
            const trip = tripLocations[tripId];
            if (!trip) {
                console.error('Trip not found:', tripId);
                return;
            }

            // Show loading state
            tideData.innerHTML = '<p class="loading">Loading tide and current information...</p>';
            tideResults.style.display = 'block';

            // Format date for display
            const dateObj = new Date(date + 'T00:00:00');
            const dateFormatted = dateObj.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });

            // Create the display with links to external resources
            const html = `
                <div class="trip-info-header">
                    <h5>${trip.name}</h5>
                    <p><strong>Launch Site:</strong> ${trip.location}</p>
                    <p><strong>Date:</strong> ${dateFormatted}</p>
                </div>

                <div class="tide-links">
                    <h5>Tide & Current Resources:</h5>
                    
                    <div class="resource-link">
                        <strong>📊 NOAA Tide Predictions:</strong>
                        <p>View detailed tide predictions for this location</p>
                        <a href="https://tidesandcurrents.noaa.gov/noaatidepredictions.html?id=${trip.noaaStation}&date=${date}" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           class="btn btn-secondary btn-sm">
                            View NOAA Tides →
                        </a>
                    </div>

                    <div class="resource-link">
                        <strong>🌊 NOAA Current Predictions:</strong>
                        <p>Check current speeds and directions for the area</p>
                        <a href="https://tidesandcurrents.noaa.gov/map/index.html?type=CurrentPredictions&region=California" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           class="btn btn-secondary btn-sm">
                            View Current Predictions →
                        </a>
                    </div>

                    <div class="resource-link">
                        <strong>🗺️ BASK Trip Planner:</strong>
                        <p>Use BASK's comprehensive trip planning tool</p>
                        <a href="https://www.bask.org/trip_planner/" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           class="btn btn-secondary btn-sm">
                            Open BASK Planner →
                        </a>
                    </div>

                    <div class="resource-link">
                        <strong>🌤️ NOAA Weather Forecast:</strong>
                        <p>Check weather conditions for your paddle date</p>
                        <a href="https://forecast.weather.gov/MapClick.php?lat=${trip.lat}&lon=${trip.lon}" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           class="btn btn-secondary btn-sm">
                            View Weather Forecast →
                        </a>
                    </div>
                </div>

                <div class="safety-reminder">
                    <p><strong>⚠️ Remember:</strong> Always verify conditions before launching. Tide and current information should be confirmed from multiple sources, and weather can change rapidly on the bay.</p>
                </div>
            `;

            tideData.innerHTML = html;
        }
    });
})();
