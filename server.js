const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const PROJECT_DIR = process.env.PROJECT_DIR || __dirname;
process.chdir(PROJECT_DIR);

const dev = false;
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3005', 10);

// Set the directory explicitly to the current folder to prevent any resolution issues
const app = next({ dev, dir: PROJECT_DIR, hostname, port });
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
      // Asynchronous non-blocking auto-seed check for Sinan Günay Super Admin
      try {
        const { PrismaClient } = require('@prisma/client');
        const crypto = require('crypto');
        const util = require('util');
        const scryptAsync = util.promisify(crypto.scrypt);
        const prisma = new PrismaClient();
        (async () => {
          const email = 'sinan.guenay@starwebflow.com';
          const existing = await prisma.user.findFirst({
            where: { email: { equals: email, mode: 'insensitive' } }
          });
          if (!existing) {
            console.log('[Bootstrap] Initializing super admin account for Sinan Günay...');
            const salt = crypto.randomBytes(16).toString('hex');
            const buf = await scryptAsync('StarWebflow2026!', salt, 64);
            const passwordHash = `${buf.toString('hex')}.${salt}`;
            let tenant = await prisma.tenant.findFirst();
            if (!tenant) {
              tenant = await prisma.tenant.create({
                data: { id: 'starwebflow-agency', name: 'StarWebFlow Agency', slug: 'starwebflow-agency' }
              });
            }
            await prisma.user.create({
              data: {
                tenantId: tenant.id,
                email,
                name: 'Sinan Günay',
                passwordHash,
                role: 'SUPER_ADMIN',
                emailVerified: true
              }
            });
            console.log('[Bootstrap] Super admin account initialized successfully.');
          }
          await prisma.$disconnect();
        })().catch((e) => console.warn('[Bootstrap] Auto-seed non-critical error:', e.message));
      } catch (e) {
        // Non-critical background task
      }
    });
}).catch((err) => {
  console.error('Next.js app preparation failed:', err);
  process.exit(1);
});
