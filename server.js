const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

process.chdir(__dirname);

const dev = false;
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3005', 10);

// Set the directory explicitly to the current folder to prevent any resolution issues
const app = next({ dev, dir: __dirname, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
}).catch((err) => {
  console.error('Next.js app preparation failed:', err);
  process.exit(1);
});
