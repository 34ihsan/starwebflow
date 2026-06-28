const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.tenantSettings.findMany().then(res => { console.log(JSON.stringify(res, null, 2)); prisma['$disconnect'](); }).catch(e => console.error(e));
