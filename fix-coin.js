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

const files = walk('./client/src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Replace import
  if (content.includes("import { CoinIcon } from")) {
    content = content.replace(/import \{ CoinIcon \} from ['"].*?['"];/g, "import coinIcon from 'src/components/icons/assets/coin.svg';");
    changed = true;
  }

  // Replace CoinIcon usage
  if (content.includes("<CoinIcon")) {
    content = content.replace(/<CoinIcon size=\{([0-9]+)\} \/>/g, "<img src={coinIcon} alt=\"coin\" style={{ width: $1, height: $1 }} />");
    content = content.replace(/<CoinIcon \/>/g, "<img src={coinIcon} alt=\"coin\" style={{ width: 22, height: 22 }} />");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log("Updated", file);
  }
});
