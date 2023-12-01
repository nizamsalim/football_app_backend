const { Schema, model } = require("mongoose");

const footballSchema = new Schema({
  team: String,
  gamesPlayed: Number,
  win: Number,
  draw: Number,
  loss: Number,
  goalsFor: Number,
  goalsAgainst: Number,
  points: Number,
  year: Number,
});

const Football = model("teams", footballSchema);

exports.Football = Football;
