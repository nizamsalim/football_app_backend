const DB_URI =
  "mongodb+srv://nizam:nizam@cluster0.udcg2qp.mongodb.net/FootballData?retryWrites=true&w=majority";
const { connect } = require("mongoose");

const connectDatabase = () => {
  connect(DB_URI).then((res) => {
    console.log("Database connected");
  });
};

module.exports = { connectDatabase };
