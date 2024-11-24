require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const app = express();
const urlparser = require("url");
const dns = require("dns");
const { parse } = require("path");
const client = new MongoClient(process.env.DB_URL);
const db = client.db("urlshortener");
const urls = db.collection("urls");
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.post("/api/shorturl", function (req, res) {
  console.log(req.body);
  const url = req.body.url;
  const parsedUrl = new URL(url);
  dns.lookup(parsedUrl.hostname, async (err, address) => {
    if (!address) {
      console.log(parsedUrl)
      res.json({ error: "Invalid Url" });
    } else {
      const urlCount = await urls.countDocuments({});
      const urlDoc = {
        url,
        short_url: urlCount,
      };
      const result = await urls.insertOne(urlDoc);
      console.log(result);
      res.json({
        original_url: parsedUrl,
        short_url: urlCount,
      });
    }
  });
});

app.get("/api/shorturl/:short_url", async(req,res) => {
const shorturl = req.params.short_url;
const urlDoc = await urls.findOne({short_url: +shorturl})
res.redirect(urlDoc.url)
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
