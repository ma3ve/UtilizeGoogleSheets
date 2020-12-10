const express = require("express");
const morgan = require("morgan");

const auth = require("./auth");
const oauth2Client = require("./oauth2Client");
const { google } = require("googleapis");

const app = express();

//middlewares
app.use(morgan("dev"));
app.use(require("express").json());

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

app.get("/", (req, res) => {
  try {
    var url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });
    res.redirect(url);
  } catch (error) {
    res.status(400).json({ name: error.name, message: error.message });
  }
});

app.get("/getData", auth, async (req, res) => {
  try {
    const sheets = google.sheets({
      version: "v4",
      auth: req.oauth2Client,
    });
    const { spreadsheetId } = req.body;
    const result = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    const ranges = result.data.sheets.map(
      (sheet) => sheet.properties.title
    );
    const reqdata = (
      await sheets.spreadsheets.values.batchGet({
        spreadsheetId,
        ranges,
      })
    ).data;
    const resData = {};
    reqdata.valueRanges.forEach((valueRange) => {
      const sheetName = valueRange.range.split("!")[0];
      if (valueRange.values) {
        resData[sheetName] = valueRange.values.map((value) =>
          Object.assign({}, value)
        );
      } else resData[sheetName] = [];
    });

    res.send(resData);
  } catch (error) {
    res.status(400).json({ name: error.name, message: error.message });
  }
});

app.patch("/update", auth, async (req, res) => {
  try {
    const sheets = google.sheets({
      version: "v4",
      auth: req.oauth2Client,
    });
    const { spreadsheetId, sheetName, row, col, newData } = req.body;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: sheetName + "!" + col + row,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [newData] },
    });
    res.send({ success: true });
  } catch (error) {
    res.status(400).json({ name: error.name, message: error.message });
  }
});

app.get("/google/callback", async (req, res) => {
  const code = req.query.code;
  const { tokens } = await oauth2Client.getToken(code);
  res.send({ success: true, tokens });
});

app.listen(5000, () => {
  console.log("server is up and running at port 5000");
});
