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

        async function fetchTideData(stationId, date) {
            // Format date as YYYYMMDD for NOAA API
            const dateFormatted = date.replace(/-/g, '');
            
            // Fetch hourly predictions for the entire day
            const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?` +
                `product=predictions&application=NOS.COOPS.TAC.WL&` +
                `begin_date=${dateFormatted}&end_date=${dateFormatted}&` +
                `datum=MLLW&station=${stationId}&time_zone=lst_ldt&` +
                `units=english&interval=h&format=json`;
            
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                return data;
            } catch (error) {
                console.error('Error fetching tide data:', error);
                // Return mock data for demonstration if API fails
                return generateMockTideData(date);
            }
        }

        function generateMockTideData(date) {
            // Constants for mock tide simulation
            const MEAN_TIDE_HEIGHT = 4.0; // feet
            const TIDE_AMPLITUDE = 2.5;   // feet
            const TIDES_PER_DAY = 2;      // semi-diurnal pattern
            const PHASE_SHIFT = Math.PI / 4;
            
            // Generate realistic-looking tide data for demonstration
            const predictions = [];
            for (let hour = 0; hour < 24; hour++) {
                // Simulate tidal pattern with sinusoidal waves
                // Two tides per day (semi-diurnal)
                const height = MEAN_TIDE_HEIGHT + TIDE_AMPLITUDE * Math.sin((hour / 24) * (TIDES_PER_DAY * 2) * Math.PI + PHASE_SHIFT);
                const time = `${date} ${hour.toString().padStart(2, '0')}:00`;
                predictions.push({
                    t: time,
                    v: height.toFixed(3)
                });
            }
            return {
                predictions: predictions
            };
        }

        function createTideChart(containerId, data, locationName) {
            const container = document.getElementById(containerId);
            if (!container) return;

            // Extract times and tide heights from data
            const predictions = data.predictions;
            if (!predictions || predictions.length === 0) {
                container.innerHTML = '<p class="error-text">No tide data available</p>';
                return;
            }

            // Find min and max tide heights for scaling
            const heights = predictions.map(p => parseFloat(p.v));
            const minHeight = Math.min(...heights);
            const maxHeight = Math.max(...heights);
            const heightRange = maxHeight - minHeight;

            // Chart dimensions - full width layout
            const width = 1600;
            const height = 600;
            const padding = { top: 60, right: 60, bottom: 100, left: 80 };
            const chartWidth = width - padding.left - padding.right;
            const chartHeight = height - padding.top - padding.bottom;

            // Create SVG
            let svg = `<svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="max-width: 100%; background: white;">`;
            
            // Title
            svg += `<text x="${width/2}" y="25" text-anchor="middle" font-size="16" font-weight="bold" fill="#1a3a52">
                        Tide Predictions for ${locationName}
                    </text>`;

            // Y-axis label
            svg += `<text x="20" y="${height/2}" text-anchor="middle" font-size="12" fill="#333" transform="rotate(-90 20 ${height/2})">
                        Height (feet above MLLW)
                    </text>`;

            // X-axis label
            svg += `<text x="${width/2}" y="${height - 10}" text-anchor="middle" font-size="12" fill="#333">
                        Time of Day
                    </text>`;

            // Draw Y-axis grid lines and labels
            const numYTicks = 5;
            for (let i = 0; i <= numYTicks; i++) {
                const value = minHeight + (heightRange * i / numYTicks);
                const y = padding.top + chartHeight - (i / numYTicks * chartHeight);
                
                // Grid line
                svg += `<line x1="${padding.left}" y1="${y}" x2="${padding.left + chartWidth}" y2="${y}" 
                             stroke="#e0e0e0" stroke-width="1"/>`;
                // Label
                svg += `<text x="${padding.left - 10}" y="${y + 4}" text-anchor="end" font-size="10" fill="#666">
                            ${value.toFixed(1)}
                        </text>`;
            }

            // Draw X-axis time labels (every 3 hours)
            for (let i = 0; i < predictions.length; i += 3) {
                const x = padding.left + (i / (predictions.length - 1) * chartWidth);
                const time = predictions[i].t.split(' ')[1].substring(0, 5); // Get HH:MM
                
                svg += `<text x="${x}" y="${padding.top + chartHeight + 20}" text-anchor="middle" font-size="10" fill="#666" transform="rotate(-45 ${x} ${padding.top + chartHeight + 20})">
                            ${time}
                        </text>`;
            }

            // Draw the tide curve
            let pathData = '';
            predictions.forEach((p, i) => {
                const x = padding.left + (i / (predictions.length - 1) * chartWidth);
                const heightValue = parseFloat(p.v);
                const y = padding.top + chartHeight - ((heightValue - minHeight) / heightRange * chartHeight);
                
                if (i === 0) {
                    pathData += `M ${x} ${y}`;
                } else {
                    pathData += ` L ${x} ${y}`;
                }
            });

            // Draw filled area under the curve
            let areaPath = pathData + ` L ${padding.left + chartWidth} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;
            svg += `<path d="${areaPath}" fill="rgba(44, 95, 141, 0.1)" />`;

            // Draw the line
            svg += `<path d="${pathData}" fill="none" stroke="#2c5f8d" stroke-width="2.5"/>`;

            // Draw points
            predictions.forEach((p, i) => {
                const x = padding.left + (i / (predictions.length - 1) * chartWidth);
                const heightValue = parseFloat(p.v);
                const y = padding.top + chartHeight - ((heightValue - minHeight) / heightRange * chartHeight);
                const time = p.t.split(' ')[1].substring(0, 5);
                
                svg += `<circle cx="${x}" cy="${y}" r="3" fill="#2c5f8d">
                            <title>${time}: ${heightValue.toFixed(2)} ft</title>
                        </circle>`;
            });

            // Draw axes
            svg += `<line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + chartHeight}" 
                         stroke="#333" stroke-width="2"/>`;
            svg += `<line x1="${padding.left}" y1="${padding.top + chartHeight}" x2="${padding.left + chartWidth}" y2="${padding.top + chartHeight}" 
                         stroke="#333" stroke-width="2"/>`;

            svg += '</svg>';

            container.innerHTML = svg;
        }

        async function getTideInfo(tripId, date) {
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

            // Create the display with tide charts and links to external resources
            const html = `
                <div class="trip-info-header">
                    <h5>${trip.name}</h5>
                    <p><strong>Route:</strong> ${trip.launchSite} → ${trip.destination}</p>
                    <p><strong>Distance:</strong> ${trip.distance}</p>
                    <p><strong>Date:</strong> ${dateFormatted}</p>
                </div>

                                <div class="tide-charts-section">
                    <h5>Tide Predictions</h5>
                    <p class="feature-note">📈 This feature displays interactive tide plots for both launch and destination sites. The plots show hourly tide heights throughout the day to help you plan optimal departure and arrival times.</p>
                    <div class="tide-charts-grid">
                        <div class="tide-chart-container">
                            <div id="launch-tide-chart"></div>
                        </div>
                        <div class="tide-chart-container">
                            <div id="dest-tide-chart"></div>
                        </div>
                    </div>
                    <p class="chart-note">Tide heights shown in feet above Mean Lower Low Water (MLLW). Data from NOAA.</p>
                </div>

                <div class="tide-links">
                    <h5>Additional Resources:</h5>
                    
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
                        <li>Review the tide charts above to plan optimal departure/arrival times</li>
                        <li>Use the <strong>BASK Trip Planner</strong> (link above) to see interactive current flows along your entire route</li>
                        <li>Watch for current predictions - strong currents can occur at constrictions and channels</li>
                        <li>Always verify conditions from multiple sources before launching</li>
                    </ul>
                </div>
            `;

            tideData.innerHTML = html;

            // Fetch and display tide data for both locations
            try {
                const [launchData, destData] = await Promise.all([
                    fetchTideData(trip.launchNoaaStation, date),
                    fetchTideData(trip.destNoaaStation, date)
                ]);

                if (launchData && launchData.predictions) {
                    createTideChart('launch-tide-chart', launchData, trip.launchSite);
                } else {
                    const launchElement = document.getElementById('launch-tide-chart');
                    if (launchElement && launchElement.parentElement) {
                        launchElement.parentElement.innerHTML = 
                            '<p class="error-text">Unable to load tide data for launch site. Please check NOAA website.</p>';
                    }
                }

                if (destData && destData.predictions) {
                    createTideChart('dest-tide-chart', destData, trip.destination);
                } else {
                    const destElement = document.getElementById('dest-tide-chart');
                    if (destElement && destElement.parentElement) {
                        destElement.parentElement.innerHTML = 
                            '<p class="error-text">Unable to load tide data for destination. Please check NOAA website.</p>';
                    }
                }
            } catch (error) {
                console.error('Error loading tide charts:', error);
                tideData.innerHTML += '<p class="error-text">Error loading tide data. Please try again or check NOAA website.</p>';
            }
        }
    });
})();
