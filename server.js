const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs");
const csvParser = require("csv-parser");

const { Football } = require("./footballData");
const { connectDatabase } = require("./connectDB");

connectDatabase();

app.use(cors());
app.use(express.json());

const addTeam = async (a) => {
  await Football.create({
    team: a["Team"],
    gamesPlayed: a["Games Played"],
    win: a["Win"],
    draw: a["Draw"],
    loss: a["Loss"],
    goalsFor: a["Goals For"],
    goalsAgainst: a["Goals Against"],
    points: a["Points"],
    year: a["Year"],
  });
};

// add csv data to mongodb
app.post("/init", (req, res) => {
  result = [];
  fs.createReadStream("./football_data.csv")
    .pipe(csvParser())
    .on("data", (data) => {
      result.push(data);
    })
    .on("end", () => {
      result.forEach((team) => {
        addTeam(team);
      });
      res.end();
    });
});

// add team
app.post("/football/add", async (req, res) => {
  try {
    const {
      team,
      gamesPlayed,
      win,
      draw,
      loss,
      goalsFor,
      goalsAgainst,
      points,
      year,
    } = req.body;
    await Football.create({
      team,
      gamesPlayed,
      win,
      draw,
      loss,
      goalsFor,
      goalsAgainst,
      points,
      year,
    });
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        field: "server",
        message: "Internal server error.",
        statusCode: 500,
      },
    });
  }
});

// get all
app.post("/football/team/get", async (req, res) => {
  try {
    const { year } = req.body;
    const team = await Football.find({ year });

    const sum = await Football.aggregate([
      {
        $match: {
          year,
        },
      },
      {
        $group: {
          _id: null,
          averageGoalsFor: { $avg: "$goalsFor" },
        },
      },
    ]);
    if (sum.length == 0) {
      return res.json({
        success: true,
        result: team,
        averageGoalsFor: 0,
      });
    }

    return res.json({
      success: true,
      result: team,
      averageGoalsFor: sum[0].averageGoalsFor.toFixed(2),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        field: "server",
        message: "Internal server error.",
        statusCode: 500,
      },
    });
  }
});

// get single team details by name
app.get("/football/team/get/:name", async (req, res) => {
  try {
    const teamName = req.params.name;
    const team = await Football.find({ team: teamName });
    if (!team) {
      return res.status(200).json({
        success: false,
        error: "Record not found",
      });
    }
    return res.json({
      success: true,
      result: team,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        field: "server",
        message: "Internal server error.",
        statusCode: 500,
      },
    });
  }
});

app.post("/football/team/update/:id", async (req, res) => {
  try {
    const {
      team,
      gamesPlayed,
      win,
      draw,
      loss,
      goalsFor,
      goalsAgainst,
      points,
      year,
    } = req.body;
    await Football.findByIdAndUpdate(req.params.id, {
      $set: {
        team,
        gamesPlayed,
        win,
        draw,
        loss,
        goalsFor,
        goalsAgainst,
        points,
        year,
      },
    });
    res.json({
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        field: "server",
        message: "Internal server error.",
        statusCode: 500,
      },
    });
  }
});

// delete by id
app.post("/football/team/delete/:id", async (req, res) => {
  try {
    await Football.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        field: "server",
        message: "Internal server error.",
        statusCode: 500,
      },
    });
  }
});

// stats by team & year
app.get("/football/stats/:team/:year", async (req, res) => {
  try {
    const { team, year } = req.params;
    const result = await Football.find({ year, team }).select(
      "team gamesPlayed win draw"
    );
    if (result.length == 0) {
      return res.status(200).json({
        success: false,
        error: "Record not found",
      });
    }
    res.json({
      success: true,
      result: result[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        field: "server",
        message: "Internal server error.",
        statusCode: 500,
      },
    });
  }
});

app.post("/football/team/get/thresholdwin", async (req, res) => {
  try {
    const { threshold } = req.body;
    const result = await Football.find({ win: { $gte: threshold } }).limit(10);
    // if (result.length == 0) {
    //   return res.status(200).json({
    //     success: false,
    //     error: "Record not found",
    //   });
    // }
    return res.json({
      success: true,
      result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        field: "server",
        message: "Internal server error.",
        statusCode: 500,
      },
    });
  }
});

app.listen(5000, () => {
  console.log("Server listening at 5000");
});
