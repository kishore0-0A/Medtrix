const fs = require('fs');
const path = require('path');

// 1. checkout.tsx
const checkoutPath = path.join(__dirname, 'src/app/checkout.tsx');
let checkout = fs.readFileSync(checkoutPath, 'utf8');

// Add orderId state
if (!checkout.includes('const [orderId, setOrderId]')) {
  checkout = checkout.replace(
    /const \[checkoutState, setCheckoutState\] = useState<CheckoutState>\('browsing'\);/,
    "const [checkoutState, setCheckoutState] = useState<CheckoutState>('browsing');\n  const [orderId, setOrderId] = useState('ORD-123456');"
  );
  
  // Set orderId on transition
  checkout = checkout.replace(
    /onPress=\{\(\) => setCheckoutState\('payment_selection'\)\}/g,
    "onPress={() => {\n                setOrderId(`ORD-${Math.floor(100000 + Math.random() * 900000)}`);\n                setCheckoutState('payment_selection');\n              }}"
  );
  
  // Replace random in render
  checkout = checkout.replace(
    /const orderId = `ORD-\$\{Math\.floor\(100000 \+ Math\.random\(\) \* 900000\)\}`;/g,
    ""
  );

  fs.writeFileSync(checkoutPath, checkout);
}

// 2. scan.tsx
const scanPath = path.join(__dirname, 'src/app/(tabs)/scan.tsx');
let scan = fs.readFileSync(scanPath, 'utf8');

if (!scan.includes('const [orderId, setOrderId]')) {
  scan = scan.replace(
    /const \[scanState, setScanState\] = useState<ScanState>\('mode_selection'\);/,
    "const [scanState, setScanState] = useState<ScanState>('mode_selection');\n  const [orderId, setOrderId] = useState('ORD-123456');"
  );
  
  scan = scan.replace(
    /setScanState\('payment_selection'\)/g,
    "{ setOrderId(`ORD-${Math.floor(100000 + Math.random() * 900000)}`); setScanState('payment_selection'); }"
  );
  
  scan = scan.replace(
    /const orderId = `ORD-\$\{Math\.floor\(100000 \+ Math\.random\(\) \* 900000\)\}`;/g,
    ""
  );

  fs.writeFileSync(scanPath, scan);
}

console.log('Fixed impure Math.random during render');
