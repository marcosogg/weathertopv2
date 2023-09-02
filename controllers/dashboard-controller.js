// Import necessary modules for station and reading models
import { station } from "../models/station.js";
import { reading } from "../models/reading.js";

// Convert wind speed to Beaufort scale
function windSpeedToBeaufort(windSpeed) {
  // Define the scales with Beaufort and label information
  const scales = {
    1: { beaufort: 0, label: 'Calm' },
    5: { beaufort: 1, label: 'Light Air' },
    11: { beaufort: 2, label: 'Light Breeze' },
    19: { beaufort: 3, label: 'Gentle Breeze' },
    28: { beaufort: 4, label: 'Moderate Breeze' },
    38: { beaufort: 5, label: 'Fresh Breeze' },
    49: { beaufort: 6, label: 'Strong Breeze' },
    61: { beaufort: 7, label: 'Near Gale' },
    74: { beaufort: 8, label: 'Gale' },
    88: { beaufort: 9, label: 'Severe Gale' },
    102: { beaufort: 10, label: 'Strong Storm' },
    117: { beaufort: 11, label: 'Violent Storm' }
  }
  // Check if the wind speed exists in the scale
  if (Object.keys(scales).includes(windSpeed)) {
    return scales[windSpeed];
  }
  // Return 'N/A' if wind speed is out of scale
  return { beaufort: 'N/A', label: 'Out of scale' }
}
// Function to convert wind direction to compass direction
const getWindDirectionCompass = (windSpeed) => {
  const directions = [
    { min: 11.25, max: 33.75, label: 'North-Northeast' },
    { min: 33.75, max: 56.25, label: 'Northeast' },
    { min: 56.25, max: 78.75, label: 'East-Northeast' },
    { min: 78.75, max: 101.25, label: 'East' },
    { min: 101.25, max: 123.75, label: 'East-Southeast' },
    { min: 123.75, max: 146.25, label: 'Southeast' },
    { min: 146.25, max: 168.75, label: 'South-Southeast' },
    { min: 168.75, max: 191.25, label: 'South' },
    { min: 191.25, max: 213.75, label: 'South-Southwest' },
    { min: 213.75, max: 236.25, label: 'Southwest' },
    { min: 236.25, max: 258.75, label: 'West-Southwest' },
    { min: 258.75, max: 281.25, label: 'West' },
    { min: 281.25, max: 303.75, label: 'West-Northwest' },
    { min: 303.75, max: 326.25, label: 'Northwest' },
    { min: 326.25, max: 348.75, label: 'North-Northwest' }
  ];
// Loop through the defined directions to find the matching label
  for (const direction of directions) {
    if (windSpeed >= direction.min && windSpeed <= direction.max) {
      return direction.label;
    }
  }
// Return 'Invalid' if wind speed is not within defined directions
  return 'Invalid wind speed';
};

// Export dashboard controller with methods to handle various requests
export const dashboardController = {
  // Async function to display dashboard index
  async index(request, response) {
    const viewData = {
      title: "Station Dashboard",
      stations: await station.getAllStations(),
    };
    console.log("dashboard rendering");
    response.render("dashboard-view", viewData);
  },
  // Async function to add a new station
  async addStation(request, response) {
    const newStation = {
      title: request.body.title,
      latitude: request.body.latitude,
      longitude: request.body.longitude,
    }
    console.log(`adding station ${newStation.title}`);
    await station.addStation(newStation);
    response.redirect("/dashboard");
  },

  // Async function to render form for adding readings
  async addReadingForm(request, response) {
    const station_id = request.params.stationId
    let maxTemperature = null;
    let minTemperature = null;
    let maxWind = null;
    let minWind = null;
    let maxPressure = null;
    let minPressure = null;

    let readings = await reading.getAllReadings(station_id)
    readings = readings.map((item) => {
      // Transform readings according to conditions (code, temperature, etc.)
      switch (item.code) {
        case 100:
          item.codeText = 'Clear';
          item.icon = 'fas fa-sun';
          break;
        case 200:
          item.codeText = 'Partial Clouds';
          item.icon = 'fas fa-cloud-sun';
          break;
        case 300:
          item.codeText = 'Cloudy';
          item.icon = 'fas fa-cloud';
          break;
        case 400:
          item.codeText = 'Light Showers';
          item.icon = 'fas fa-cloud-rain';
          break;
        case 500:
          item.codeText = 'Heavy Showers';
          item.icon = 'fas fa-cloud-showers-heavy';
          break;
        case 600:
          item.codeText = 'Rain';
          item.icon = 'fas fa-cloud-showers-heavy';
          break;
        case 700:
          item.codeText = 'Snow';
          item.icon = 'fas fa-snowflake';
          break;
        case 800:
          item.codeText = 'Thunder';
          item.icon = 'fas fa-bolt';
          break;
        default:
          item.codeText = '';
          item.icon = 'fas fa-question';
          break;
      }

      item.temperatureFahrenheit = item.temperature * 9 / 5 + 32;
      const resultbft = windSpeedToBeaufort(item.windSpeed)
      item.beaufort = resultbft['beaufort']
      item.labelBeaufort = resultbft['label']
      item.fellsLike = 13.12 + 0.6215 * item.temperature - 11.37 * (item.windSpeed * 0.16) + 0.3965 * item.temperature * (item.windSpeed * 0.16)
      item.windDirectionCompass = getWindDirectionCompass(item.windDirection)
      if (item.temperature > maxTemperature || maxTemperature == null) {
        maxTemperature = item.temperature
      }
      if (item.temperature < minTemperature || minTemperature == null) {
        minTemperature = item.temperature
      }
      if (item.windSpeed > maxWind || maxWind == null) {
        maxWind = item.windSpeed
      }
      if (item.windSpeed < minWind || minWind == null) {
        minWind = item.windSpeed
      }
      if (item.pressure > maxPressure || maxPressure == null) {
        maxPressure = item.pressure;
      }
      if (item.pressure < minPressure || minPressure == null) {
        minPressure = item.pressure;
      }      
      return item;
    }); 

    readings.reverse()
    
    const viewData = {
      title: "Add Reading",
      readings: readings.slice(1),
      last_reading: {
        // spread operator
        ...readings[0],
        maxTemperature: maxTemperature,
        minTemperature: minTemperature,
        maxWind: maxWind,
        minWind: minWind,
        maxPressure: maxPressure,
        minPressure: minPressure
      },
      station: await station.getStationById(station_id),
      station_id
    };
    response.render("form-reading", viewData);
  },
  // Async function to add a new reading
  async addReading(request, response) {
    const station_id = request.body.station_id
    const newReading = {
      code: parseInt(request.body.code),
      temperature: parseFloat(request.body.temperature),
      windSpeed: parseFloat(request.body.windSpeed),
      windDirection: parseFloat(request.body.windDirection),
      pressure: parseFloat(request.body.pressure),
      station_id: station_id
    };
    await reading.addReading(newReading);
    const viewData = {
      title: "Station Dashboard",
      stations: await station.getAllStations(),
    };
    response.render("dashboard-view", viewData);
  }
};
