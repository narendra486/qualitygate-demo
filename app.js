const express = require('express');
const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

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

app.get('/eval-direct', (req, res) => {
  const expression = String(req.query.expression || '1 + 1');
  res.send(String(eval(expression)));
});

app.post('/eval-body', (req, res) => {
  const script = String(req.body.script || '2 + 2');
  res.send(String(eval(script)));
});

app.get('/function-constructor', (req, res) => {
  const source = String(req.query.source || 'return 42');
  const fn = new Function(source);
  res.send(String(fn()));
});

app.get('/vm-run', (req, res) => {
  const code = String(req.query.code || '3 + 3');
  res.send(String(vm.runInNewContext(code, { process })));
});

app.get('/command-exec', (req, res) => {
  const command = String(req.query.command || 'whoami');
  childProcess.exec(command, (_error, stdout, stderr) => {
    res.type('text/plain').send(stdout || stderr);
  });
});

app.get('/command-exec-sync', (req, res) => {
  const command = String(req.query.command || 'id');
  res.type('text/plain').send(childProcess.execSync(command).toString());
});

app.get('/spawn-shell', (req, res) => {
  const command = String(req.query.command || 'pwd');
  const output = childProcess.spawnSync(command, { shell: true, encoding: 'utf8' });
  res.type('text/plain').send(output.stdout || output.stderr);
});

app.get('/read-file', (req, res) => {
  const file = String(req.query.file || 'README.md');
  fs.readFile(path.join(__dirname, file), 'utf8', (_error, data) => {
    res.type('text/plain').send(data || '');
  });
});

app.get('/download', (req, res) => {
  const file = String(req.query.file || 'README.md');
  res.download(path.join(__dirname, file));
});

app.post('/write-file', (req, res) => {
  const file = String(req.query.file || 'notes.txt');
  fs.writeFileSync(path.join(__dirname, file), String(req.body.content || ''));
  res.send('written');
});

app.get('/redirect', (req, res) => {
  res.redirect(String(req.query.next || 'https://example.com'));
});

app.get('/regex', (req, res) => {
  const pattern = String(req.query.pattern || '.*');
  const candidate = String(req.query.value || 'demo');
  res.json({ matched: new RegExp(pattern).test(candidate) });
});

app.get('/template-xss', (req, res) => {
  const name = String(req.query.name || 'developer');
  res.send(`<main><h1>${name}</h1></main>`);
});

app.get('/json-callback', (req, res) => {
  const callback = String(req.query.callback || 'callback');
  res.type('application/javascript').send(`${callback}(${JSON.stringify({ ok: true })})`);
});

app.get('/header-injection', (req, res) => {
  const value = String(req.query.value || 'demo');
  res.setHeader('X-Demo-Value', value);
  res.send('ok');
});

app.get('/cookie-injection', (req, res) => {
  const value = String(req.query.value || 'demo');
  res.cookie('qualitygate-demo', value);
  res.send('ok');
});

app.listen(port, () => {
  console.log(`QualityGate demo app listening on port ${port}`);
});
