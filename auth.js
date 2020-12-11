const oauth2Client = require("./oauth2Client");
const fs = require("fs");
module.exports = async (req, res, next) => {
  try {
    // const { tokens } = req.body;

    const tokensjson = fs.readFileSync("token.json");
    fs.readFile("token.json", (err, tokenjson) => {
      if (err) throw err;
      const tokens = JSON.parse(tokenjson);
      console.log(tokens);
      oauth2Client.setCredentials(tokens);
      req.oauth2Client = oauth2Client;
      next();
    });
  } catch (error) {
    console.log("error", error);
    return res
      .status(403)
      .send({ error: error.name, message: error.message });
  }
};
