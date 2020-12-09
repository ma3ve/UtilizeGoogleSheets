const oauth2Client = require("./oauth2Client");

module.exports = async (req, res, next) => {
  try {
    const { tokens } = req.body;
    if (!tokens) throw new Error("authentication token not provided");

    oauth2Client.setCredentials(tokens);
    req.oauth2Client = oauth2Client;
    next();
  } catch (error) {
    return res.send({ error: error.name, message: error.message });
  }
};
