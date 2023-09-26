const express = require("express");
const { Deta } = require('deta');
const webpush = require('web-push');


const deta = Deta();
const app = express();
const port = process.env.PORT || 8080;


// Handle a GET request to the root path
app.get("/", async (req, res) => {
  const base = deta.Base('setup');
  const response = await base.fetch()
  keyDict = response.items
  if (Object.keys(keyDict).length == 0){
    const vapidKeys = webpush.generateVAPIDKeys();
    await base.put({ value: vapidKeys.publicKey }, "public-key");
    await base.put({ value: vapidKeys.privateKey }, "private-key");
  }
  res.send("keys generated");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});
