const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

async function fixReactImports() {
  const files = await glob('src/**/*.{ts,tsx}', {
    ignore: ['**/node_modules/**', '**/.next/**'],
    absolute: true
  });

  let fixedCount = 0;

  for (const file of files) {
    let content = fs.readFileSync(file, 'utf-8');
    const originalContent = content;

    // Pattern 1: import React, { ... } from 'react' → import { ... } from 'react'
    content = content.replace(/^import React, \{ ([^}]+) \} from ['"]react['"];?$/gm, (match, imports) => {
      return `import { ${imports} } from 'react';`;
    });

    // Pattern 2: import * as React from 'react' (when React.* is used)
    // Check if React. is used in the file
    const hasReactDot = content.includes('React.');
    if (!hasReactDot) {
      content = content.replace(/^import \* as React from ['"]react['"];?$/gm, '');
    }

    // Clean up double empty lines
    content = content.replace(/\n\n\n+/g, '\n\n');

    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf-8');
      fixedCount++;
      console.log(`✅ Fixed: ${path.relative(process.cwd(), file)}`);
    }
  }

  console.log(`\n✨ Fixed ${fixedCount} files`);
}

fixReactImports().catch(console.error);
