const fs = require('fs');
const path = require('path');
const actionsDir = path.join(process.cwd(), 'src/app/actions');
const files = fs.readdirSync(actionsDir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(actionsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace import
  content = content.replace(/import\s*\{\s*revalidatePath\s*\}\s*from\s*['"]next\/cache['"];?/g, "import { safeRevalidatePath } from '@/lib/utils/cache';");
  
  // Replace function calls
  content = content.replace(/revalidatePath\(/g, 'safeRevalidatePath(');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log('Updated: ' + file);
  }
});
