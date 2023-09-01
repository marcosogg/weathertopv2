import { station } from "../models/station.js";
import { reading } from "../models/reading.js";

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
    }
    console.log(`adding station ${newStation.title}`);
    const _station = await station.addStation(newStation);
    response.redirect("/dashboard");
  },
  async addReadingForm(request, response) {
    const station_id = request.params.stationId
    let readings = await reading.getAllReadings(station_id)
    readings = readings.map((item) => {
      switch (item.code) {
        case 100:
          item.codeText = 'Clear';
          break;
        case 200:
          item.codeText = 'Partial Clouds';
          break;
        case 300:
          item.codeText = 'Cloudy';
          break;
        case 400:
          item.codeText = 'Light Showers';
          break;
        case 500:
          item.codeText = 'Heavy Showers';
          break;
        case 600:
          item.codeText = 'Rain';
          break;
        case 700:
          item.codeText = 'Snow';
          break;
        case 800:
          item.codeText = 'Thunder';
          break;
        default:
        // Do nothing
      }
      return item;
    });
    readings.reverse()
    readings[0].temperatureFahrenheit = readings[0].temperature * 9 / 5 + 32;
    const viewData = {
      title: "Add Reading",
      readings: readings.slice(1),
      last_reading: readings[0],
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
