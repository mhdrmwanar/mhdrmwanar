// Fix all return statements in admin controller
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/controllers/adminController.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all "return res.status" with "res.status" and add return; after
content = content.replace(/return res\.status/g, 'res.status');

// Add proper return type annotations
content = content.replace(/async (\w+)\(req: Request, res: Response\) {/g, 'async $1(req: Request, res: Response): Promise<void> {');

// Add return statements after res.json() calls to ensure proper control flow
content = content.replace(/res\.status\(\d+\)\.json\([^}]+}\);/g, (match) => {
    return match + '\n            return;';
});

fs.writeFileSync(filePath, content);
console.log('Fixed admin controller return statements');
