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
  async addReading(request, response) {
    const station_id = request.body.station_id
      const newReading = {
        code:parseInt(request.body.code),
        temperature:parseFloat(request.body.temperature),
        windSpeed:parseFloat(request.body.windSpeed),
        pressure:parseFloat (request.body.pressure),
        station_id: station_id
      };
      await reading.addReading(newReading);
      response.render("dashboard-view", viewData);
  }
};
