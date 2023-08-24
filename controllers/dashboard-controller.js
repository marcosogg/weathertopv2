import { station } from "../models/station.js";

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
    };
    console.log(`adding station ${newStation.title}`);
    await station.addStation(newStation);
    response.redirect("/dashboard");
  },
};
