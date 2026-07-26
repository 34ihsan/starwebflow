import dns from 'dns';
import net from 'net';

/**
 * Resolves the MX records for a given domain, sorted by priority.
 */
function resolveMx(domain: string): Promise<dns.MxRecord[]> {
  return new Promise((resolve) => {
    dns.resolveMx(domain, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        return resolve([]);
      }
      // Sort by priority (lowest first)
      const sorted = addresses.sort((a, b) => a.priority - b.priority);
      resolve(sorted);
    });
  });
}

/**
 * Pings an email address via its MX server to see if it exists (0 Cost SMTP Ping).
 * Note: Many modern servers use catch-all or block port 25 connections from dynamic IPs, 
 * so this is a "best effort" check.
 */
export async function verifyEmailLive(email: string): Promise<boolean> {
  const [localPart, domain] = email.split('@');
  if (!domain) return false;

  const mxRecords = await resolveMx(domain);
  if (mxRecords.length === 0) return false;

  const mxServer = mxRecords[0].exchange;

  return new Promise((resolve) => {
    const socket = net.createConnection(25, mxServer);
    let step = 0;
    
    socket.setTimeout(3000); // 3 saniye zaman aşımı (çok bekletmemek için)

    socket.on('data', (data) => {
      const response = data.toString();
      
      if (step === 0 && response.includes('220')) {
        socket.write(`HELO starwebflow.com\r\n`);
        step++;
      } else if (step === 1 && response.includes('250')) {
        socket.write(`MAIL FROM:<hello@starwebflow.com>\r\n`);
        step++;
      } else if (step === 2 && response.includes('250')) {
        socket.write(`RCPT TO:<${email}>\r\n`);
        step++;
      } else if (step === 3) {
        if (response.includes('250') || response.includes('251')) {
          // Email exists!
          socket.write(`QUIT\r\n`);
          socket.end();
          resolve(true);
        } else {
          // Email does not exist or blocked (550, 553, etc.)
          socket.write(`QUIT\r\n`);
          socket.end();
          resolve(false);
        }
      } else if (response.startsWith('4') || response.startsWith('5')) {
        socket.write(`QUIT\r\n`);
        socket.end();
        resolve(false);
      }
    });

    socket.on('error', () => {
      socket.end();
      resolve(false);
    });

    socket.on('timeout', () => {
      socket.end();
      resolve(false);
    });
  });
}
