import { PrismaClient } from '@prisma/client';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const prisma = new PrismaClient();
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function main() {
  const email = 'admin@starwebflow.com';
  const password = 'admin123';
  
  // Create Tenant
  let tenant = await prisma.tenant.findUnique({ where: { slug: 'starwebflow-agency' } });
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: 'StarWebFlow Agency',
        slug: 'starwebflow-agency'
      }
    });
  }

  // Create User
  const adminPasswordHash = await hashPassword(password);
  let adminUser = await prisma.user.findUnique({ where: { email } });
  if (adminUser) {
    console.log(`User ${email} already exists! Updating password.`);
    adminUser = await prisma.user.update({
      where: { email },
      data: { passwordHash: adminPasswordHash }
    });
  } else {
    adminUser = await prisma.user.create({
      data: {
        email,
        name: 'StarWebFlow Admin',
        passwordHash: adminPasswordHash,
        role: 'SUPER_ADMIN',
        tenantId: tenant.id
      }
    });
    console.log(`Successfully created admin user: ${email} / ${password}`);
  }

  // 2. Create Client User
  const clientEmail = 'client@starwebflow.com';
  const clientPassword = 'client123';
  const clientPasswordHash = await hashPassword(clientPassword);
  let clientUser = await prisma.user.findUnique({ where: { email: clientEmail } });
  if (!clientUser) {
    clientUser = await prisma.user.create({
      data: {
        email: clientEmail,
        name: 'StarWebFlow Client',
        passwordHash: clientPasswordHash,
        role: 'CLIENT_MEMBER',
        tenantId: tenant.id
      }
    });
    console.log(`Successfully created client user: ${clientEmail} / ${clientPassword}`);
  } else {
    clientUser = await prisma.user.update({
      where: { email: clientEmail },
      data: { passwordHash: clientPasswordHash }
    });
    console.log(`Client user ${clientEmail} already exists. Password updated to client123.`);
  }

  // 3. Create a test project if none exists
  let project = await prisma.project.findFirst({
    where: { tenantId: tenant.id, clientId: clientUser.id }
  });

  if (!project) {
    project = await prisma.project.create({
      data: {
        tenantId: tenant.id,
        clientId: clientUser.id,
        managerId: adminUser.id,
        title: 'E-Ticaret Web Sitesi Tasarımı',
        type: 'BESPOKE',
        status: 'IN_PROGRESS',
        progress: 40,
        riskLevel: 'LOW',
        briefData: {
          description: 'Modern, Next.js tabanlı e-ticaret sitesi arayüz entegrasyonu.',
          deadline: '2026-07-01'
        }
      }
    });
    console.log('Successfully created test project.');
  }

  // 4. Create initial tasks if none exist
  const existingTasksCount = await prisma.task.count({
    where: { projectId: project.id }
  });

  if (existingTasksCount === 0) {
    await prisma.task.createMany({
      data: [
        {
          projectId: project.id,
          title: 'Veritabanı Şeması Tasarımı',
          description: 'Prisma şeması ve migration dosyalarının oluşturulması.',
          status: 'done',
          dueDate: new Date('2026-06-10')
        },
        {
          projectId: project.id,
          title: 'API Rotaları Geliştirme',
          description: 'Auth ve Projects API endpoints yazılması ve test edilmesi.',
          status: 'doing',
          dueDate: new Date('2026-06-20')
        },
        {
          projectId: project.id,
          title: 'Arayüz Entegrasyonu (Onay Bekliyor)',
          description: 'Müşteri paneli tasarımlarının API ile bağlanması ve onaya sunulması.',
          status: 'review',
          dueDate: new Date('2026-06-15')
        },
        {
          projectId: project.id,
          title: 'Birim Testlerinin Yazılması',
          description: 'Servis katmanları için Jest testlerinin yazılması.',
          status: 'todo',
          dueDate: new Date('2026-06-25')
        }
      ]
    });
    console.log('Successfully seeded initial project tasks.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
