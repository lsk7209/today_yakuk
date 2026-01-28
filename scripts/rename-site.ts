import fs from 'fs';
import path from 'path';

const targetDir = path.join(process.cwd(), 'src');
const search = '오늘약국';
const replace = '약국오늘';

function processDirectory(directory: string) {
    const files = fs.readdirSync(directory);

    for (const file of files) {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (/\.(ts|tsx)$/.test(file)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes(search)) {
                const newContent = content.split(search).join(replace);
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

console.log(`Starting replacement of "${search}" with "${replace}" in ${targetDir}...`);
processDirectory(targetDir);
console.log('Replacement complete.');
