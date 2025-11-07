// Bay Area Kayak Trip Planner - Interactive Trip Planning
(function() {
    'use strict';

    // Trip location data with NOAA station IDs for tide predictions
    const tripLocations = {
        'china-camp': {
            name: 'China Camp to the Sisters',
            launchSite: 'China Camp State Park',
            destination: 'The Sister Islands',
            launchNoaaStation: '9415102', // Point San Pedro
            destNoaaStation: '9415102', // Point San Pedro (same area)
            launchLat: 38.0017,
            launchLon: -122.4869,
            destLat: 38.0350,
            destLon: -122.4450,
            distance: '3 miles round trip'
        },
        'point-richmond': {
            name: 'Point Richmond to Brooks Island',
            launchSite: 'Point Richmond',
            destination: 'Brooks Island',
            launchNoaaStation: '9414863', // Richmond
            destNoaaStation: '9414863', // Richmond (same area)
            launchLat: 37.9295,
            launchLon: -122.3814,
            destLat: 37.9608,
            destLon: -122.3975,
            distance: '5.5 miles round trip'
        },
        'crissy-field': {
            name: 'Crissy Field to The Ramp',
            launchSite: 'Crissy Field',
            destination: 'The Ramp (China Basin)',
            launchNoaaStation: '9414290', // San Francisco
            destNoaaStation: '9414290', // San Francisco (same station)
            launchLat: 37.8054,
            launchLon: -122.4658,
            destLat: 37.7697,
            destLon: -122.3892,
            distance: '7 miles one way'
        },
        'farallon': {
            name: 'The Farallon Islands',
            launchSite: 'San Francisco Coast',
            destination: 'Farallon Islands',
            launchNoaaStation: '9414290', // San Francisco
            destNoaaStation: '9414290', // San Francisco (closest)
            launchLat: 37.7749,
            launchLon: -122.4194,
            destLat: 37.6983,
            destLon: -123.0017,
            distance: '30 miles round trip'
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

            // Clear any previous error messages
            const existingErrors = document.querySelectorAll('.error-message');
            existingErrors.forEach(err => err.remove());

            if (!selectedTrip) {
                showError(tripSelect, 'Please select a trip route');
                return;
            }

            if (!selectedDate) {
                showError(dateInput, 'Please select a date');
                return;
            }

            getTideInfo(selectedTrip, selectedDate);
        });

        function showError(element, message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            errorDiv.style.color = 'var(--danger-color)';
            errorDiv.style.marginTop = '0.5rem';
            errorDiv.style.fontSize = '0.9rem';
            element.parentElement.appendChild(errorDiv);
        }

        function getTideInfo(tripId, date) {
            const trip = tripLocations[tripId];
            if (!trip) {
                console.error('Trip not found:', tripId);
                return;
            }

            // Validate date format (YYYY-MM-DD)
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(date)) {
                console.error('Invalid date format:', date);
                return;
            }

            // Show loading state
            tideData.innerHTML = '<p class="loading">Loading tide and current information...</p>';
            tideResults.style.display = 'block';

            // Format date for display (using simple parsing to avoid timezone issues)
            const [year, month, day] = date.split('-');
            const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
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
                    <p><strong>Route:</strong> ${trip.launchSite} → ${trip.destination}</p>
                    <p><strong>Distance:</strong> ${trip.distance}</p>
                    <p><strong>Date:</strong> ${dateFormatted}</p>
                </div>

                <div class="tide-links">
                    <h5>Route Conditions & Planning:</h5>
                    
                    <div class="resource-link highlight-link">
                        <strong>🗺️ BASK Trip Planner - View Full Route:</strong>
                        <p>Interactive map showing tides, currents along your route, and conditions at destination</p>
                        <a href="https://www.bask.org/trip_planner/6.64/#date=${encodeURIComponent(date)}&lat=${encodeURIComponent(trip.launchLat)}&lon=${encodeURIComponent(trip.launchLon)}&zoom=12" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           class="btn btn-primary btn-sm">
                            Open Interactive Route Planner →
                        </a>
                        <p class="small-hint">Shows currents along route and tides at both launch and destination points</p>
                    </div>

                    <div class="resource-link">
                        <strong>📊 Tides at Launch Site (${trip.launchSite}):</strong>
                        <p>View tide predictions for your launch location</p>
                        <a href="https://tidesandcurrents.noaa.gov/noaatidepredictions.html?id=${encodeURIComponent(trip.launchNoaaStation)}&date=${encodeURIComponent(date)}" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           class="btn btn-secondary btn-sm">
                            View Launch Tides →
                        </a>
                    </div>

                    <div class="resource-link">
                        <strong>📊 Tides at Destination (${trip.destination}):</strong>
                        <p>View tide predictions for your destination</p>
                        <a href="https://tidesandcurrents.noaa.gov/noaatidepredictions.html?id=${encodeURIComponent(trip.destNoaaStation)}&date=${encodeURIComponent(date)}" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           class="btn btn-secondary btn-sm">
                            View Destination Tides →
                        </a>
                    </div>

                    <div class="resource-link">
                        <strong>🌊 NOAA Current Predictions:</strong>
                        <p>Check current speeds and directions along your route</p>
                        <a href="https://tidesandcurrents.noaa.gov/map/index.html?type=CurrentPredictions&region=California" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           class="btn btn-secondary btn-sm">
                            View Current Map →
                        </a>
                    </div>

                    <div class="resource-link">
                        <strong>🌤️ Weather Forecast:</strong>
                        <p>Check weather conditions for launch and route</p>
                        <a href="https://forecast.weather.gov/MapClick.php?lat=${encodeURIComponent(trip.launchLat)}&lon=${encodeURIComponent(trip.launchLon)}" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           class="btn btn-secondary btn-sm">
                            View Weather Forecast →
                        </a>
                    </div>
                </div>

                <div class="safety-reminder">
                    <p><strong>⚠️ Planning Tips:</strong></p>
                    <ul>
                        <li>Use the <strong>BASK Trip Planner</strong> (link above) to see interactive current flows along your entire route</li>
                        <li>Check both launch and destination tides to plan optimal departure/arrival times</li>
                        <li>Watch for current predictions - strong currents can occur at constrictions and channels</li>
                        <li>Always verify conditions from multiple sources before launching</li>
                    </ul>
                </div>
            `;

            tideData.innerHTML = html;
        }
    });
})();
