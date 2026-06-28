const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('c:/Users/sinan/Desktop/projeler/starwebflow/src/app/api/v1/monitoring/**/*.ts');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;

  if (content.includes('default-tenant') && !content.includes('findFirst()')) {
    content = content.replace(/const tenantId = [\'\"]default-tenant(-id)?[\'\"];(\s*\/\/[^\n]*)?/g, 'const tenant = await prisma.tenant.findFirst();\n    const tenantId = tenant?.id || \"default-tenant\";');
    changed = true;
  }
  
  if (changed) {
    if (!content.includes('import { prisma } from')) {
      content = 'import { prisma } from "@/lib/prisma";\n' + content;
    }
    fs.writeFileSync(f, content);
    console.log('Fixed', f);
  }
});
