import { v4 } from "uuid";
import { initStore } from "../utils/store-utils.js";

const db = initStore("readings");

export const reading = {
  async getAllreadings() {
    await db.read();
    return db.data.readings;
  },

  async addReading(reading) {
    await db.read();
    reading._id = v4();
    db.data.readings.push(reading);
    await db.write();
    return reading;
  },

  async getReadingById(id) {
    await db.read();
    const list = db.data.readings.find((reading) => reading._id === id);
    return list;
  },

  async deleteReadingById(id) {
    await db.read();
    const index = db.data.readings.findIndex((reading) => reading._id === id);
    db.data.readings.splice(index, 1);
    await db.write();
  },

  async deleteAllReadings() {
    db.data.readings = [];
    await db.write();
  },
};
