const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./client/src/components/pages');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Use [\s\S]*? for multiline matches
  content = content.replace(/import\s+([\s\S]*?)\s+from\s+'\.\.\/\.\.\/models\/(.*?)';/g, "import $1 from 'src/models/$2';");
  content = content.replace(/import\s+([\s\S]*?)\s+from\s+'\.\.\/ui';/g, "import $1 from 'src/views/ui';");
  content = content.replace(/import\s+([\s\S]*?)\s+from\s+'\.\.\/components\/(.*?)';/g, "import $1 from 'src/views/components/$2';");
  content = content.replace(/import\s+([\s\S]*?)\s+from\s+'\.\.\/race\/(.*?)';/g, "import $1 from 'src/views/race/$2';");
  content = content.replace(/import\s+([\s\S]*?)\s+from\s+'\.\.\/\.\.\/components\/(.*?)';/g, "import $1 from 'src/components/$2';");
  content = content.replace(/import\s+([\s\S]*?)\s+from\s+'\.\.\/\.\.\/viewmodels\/(.*?)';/g, "import $1 from 'src/viewmodels/$2';");
  
  fs.writeFileSync(file, content);
});
