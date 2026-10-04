const fs = require('fs');
const path = require('path');

let content = fs.readFileSync(path.join(__dirname, 'src/app/checkout.tsx'), 'utf8');

content = content.replace(
  /<Text style=\{styles\.cartItemName\}>\{matchedBatch\.name\}<\/Text>/g,
  '<Text style={styles.cartItemName}>{matchedBatch.translations?.[i18n.language]?.name || matchedBatch.name}</Text>'
);

content = content.replace(
  /<Text style=\{styles\.sectionTitle\}>\{matchedBatch\.name\}<\/Text>/g,
  '<Text style={styles.sectionTitle}>{matchedBatch.translations?.[i18n.language]?.name || matchedBatch.name}</Text>'
);

fs.writeFileSync(path.join(__dirname, 'src/app/checkout.tsx'), content);
console.log('Done checkout');
