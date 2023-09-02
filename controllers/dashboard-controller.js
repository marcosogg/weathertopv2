import { station } from "../models/station.js";
import { reading } from "../models/reading.js";

function windSpeedToBeaufort(windSpeed) {
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

  if (Object.keys(scales).includes(windSpeed)) {
    return scales[windSpeed];
  }
  return { beaufort: 'N/A', label: 'Out of scale' }
}

const getWindDirectionCompass = (windSpeed) => {
  if(windSpeed >= 11.25 && windSpeed <= 33.75){
    return 'NNE'
  }else if(windSpeed >= 33.75 && windSpeed <= 56.25){
    return 'NE'
  }else if(windSpeed  >= 56.25 && windSpeed <= 78.75){
    return 'ENE'
  }else if(windSpeed  >= 78.75 && windSpeed <= 101.25){
    return 'E'
  }else if(windSpeed  >= 101.25 && windSpeed <= 123.75){
    return 'ESE'
  }else if(windSpeed  >= 123.75 && windSpeed <= 146.25){
    return 'SE'
  }else if(windSpeed  >= 146.25 && windSpeed <= 168.75){
    return 'SSE'
  }else if(windSpeed  >= 168.75 && windSpeed <= 191.25){
    return 'S'
  }else if(windSpeed  >= 191.25 && windSpeed <= 213.75){
    return 'SSW'
  }else if(windSpeed  >= 213.75 && windSpeed <= 236.25){
    return 'SW'
  }else if(windSpeed  >= 236.25 && windSpeed <= 258.75){
    return 'WSW'
  }else if(windSpeed  >= 258.75 && windSpeed <= 281.25){
    return 'W'
  }else if(windSpeed  >= 281.25 && windSpeed <= 303.75){
    return 'WNW'
  }else if(windSpeed  >= 303.75 && windSpeed <= 326.25){
    return 'NW'
  }else if(windSpeed  >= 326.25 && windSpeed <= 348.75){
    return 'NNW'
  }else if(windSpeed <= 348.75 && windSpeed >= 11.25){
    return 'N'
  }
}

export const dashboardController = {
  async index(request, response) {
    const viewData = {
      title: "Station Dashboard",
      stations: await station.getAllStations(),
    };
    console.log("dashboard rendering");
    response.render("dashboard-view", viewData);
  },

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
  async addReadingForm(request, response) {
    const station_id = request.params.stationId
    let maxTemperature = null;
    let minTemperature = null;
    let maxWind = null;
    let minwind = null;

    let readings = await reading.getAllReadings(station_id)
    readings = readings.map((item) => {
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
      if (item.windSpeed < minwind || minwind == null) {
        minwind = item.windSpeed
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
        minwind: minwind
      },
      station: await station.getStationById(station_id),
      station_id
    };
    response.render("form-reading", viewData);
  },
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
