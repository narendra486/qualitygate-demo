const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  const userInput = req.query.input || 'world';

  // Intentional insecure pattern for CodeQL detection
  const title = `Hello ${userInput}`;
  const html = `<h1>${title}</h1>`;

  // Vulnerable eval usage
  if (req.query.run) {
    try {
      const result = eval(req.query.run);
      res.send(`${html}<p>Result: ${result}</p>`);
      return;
    } catch (err) {
      res.status(500).send(`${html}<p>Error executing code</p>`);
      return;
    }
  }

  res.send(html + '<p>Send ?run=1+1 or ?run=process.env.PWD</p>');
});

app.listen(port, () => {
  console.log(`QualityGate demo app listening on port ${port}`);
});