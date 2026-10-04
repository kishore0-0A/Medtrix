const fs = require('fs');
const path = require('path');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add i18next import if missing
  if (!content.includes("import { useTranslation } from 'react-i18next'")) {
    content = content.replace(
      "import { Ionicons }",
      "import { useTranslation } from 'react-i18next';\nimport { Ionicons }"
    );
  }

  // Add i18n hook
  if (content.includes("export default function InventoryScreen() {") && !content.includes("const { t, i18n } = useTranslation();")) {
    content = content.replace(
      "export default function InventoryScreen() {",
      "export default function InventoryScreen() {\n  const { t, i18n } = useTranslation();"
    );
  }

  if (content.includes("export default function CheckoutScreen() {") && !content.includes("const { i18n }")) {
    content = content.replace(
      "const { t } = useTranslation();",
      "const { t, i18n } = useTranslation();"
    );
  }

  // Replace item.name with translation fallback
  content = content.replace(
    /<Text style=\{styles\.medicineName\}>\{item\.name\}<\/Text>/g,
    '<Text style={styles.medicineName}>{item.translations?.[i18n.language]?.name || item.name}</Text>'
  );
  
  // Replace cart item name
  content = content.replace(
    /<Text style=\{styles\.cartItemName\}>\{item\.batch\.name\}<\/Text>/g,
    '<Text style={styles.cartItemName}>{item.batch.translations?.[i18n.language]?.name || item.batch.name}</Text>'
  );

  // Replace item.strength and item.form
  content = content.replace(
    /\{\[item\.strength, item\.form\]/g,
    '{[item.translations?.[i18n.language]?.strength || item.strength, item.translations?.[i18n.language]?.form || item.form]'
  );

  fs.writeFileSync(filePath, content);
}

['src/app/(tabs)/inventory.tsx', 'src/app/checkout.tsx'].forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    updateFile(fullPath);
    console.log(`Updated ${file}`);
  }
});
