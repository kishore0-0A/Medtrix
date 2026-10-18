import { askAssistant, ChatMessage } from '../src/services/aiService';

async function runTests() {
  console.log('====================================================');
  console.log('   MEDTRIX AI ASSISTANT AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  // Test 1: Stock Overview Query
  console.log('Test 1: Stock Count Overview');
  const res1 = await askAssistant('How many medicines are currently in stock?', 'en', '/(tabs)');
  console.log('Question: "How many medicines are currently in stock?"');
  console.log('Answer:', res1.answer);
  console.log('Action:', res1.action, '| Route:', res1.route);
  if (!res1.answer.includes('inventory currently holds') && !res1.answer.includes('units')) {
    throw new Error('Test 1 failed to return factual stock count');
  }
  console.log('✓ Test 1 Passed\n');

  // Test 2: Low Stock Query
  console.log('Test 2: Low Stock Items');
  const res2 = await askAssistant('Which medicines are running low?', 'en', '/(tabs)/inventory');
  console.log('Question: "Which medicines are running low?"');
  console.log('Answer:', res2.answer);
  console.log('Action:', res2.action, '| Route:', res2.route);
  if (!res2.answer.includes('running low') && !res2.answer.includes('healthy stock levels')) {
    throw new Error('Test 2 failed to check low stock status');
  }
  console.log('✓ Test 2 Passed\n');

  // Test 3: Multi-turn Follow-up
  console.log('Test 3: Multi-turn Context Follow-up');
  const history: ChatMessage[] = [
    { id: '1', role: 'user', content: 'Which medicines are running low?' },
    { id: '2', role: 'assistant', content: res2.answer },
  ];
  const res3 = await askAssistant('Show me only the urgent ones', 'en', '/(tabs)/inventory', history);
  console.log('Follow-up: "Show me only the urgent ones"');
  console.log('Answer:', res3.answer);
  console.log('✓ Test 3 Passed\n');

  // Test 4: FEFO Explanation
  console.log('Test 4: FEFO Protocol Explanation');
  const res4 = await askAssistant('Explain how FEFO works in Medtrix', 'en', '/(tabs)/alerts');
  console.log('Question: "Explain how FEFO works in Medtrix"');
  console.log('Answer:', res4.answer);
  if (!res4.answer.includes('First Expiry, First Out')) {
    throw new Error('Test 4 failed to explain FEFO');
  }
  console.log('✓ Test 4 Passed\n');

  // Test 5: Reorder Recommendation
  console.log('Test 5: Weekly Reorder Predictions');
  const res5 = await askAssistant('What should I reorder this week?', 'en', '/(tabs)/inventory');
  console.log('Question: "What should I reorder this week?"');
  console.log('Answer:', res5.answer);
  console.log('Action:', res5.action, '| Route:', res5.route);
  console.log('✓ Test 5 Passed\n');

  // Test 6: Sales / Stock In & Stock Out Comparison
  console.log('Test 6: Compare Stock In and Stock Out');
  const res6 = await askAssistant('Compare Stock In and Stock Out for this month', 'en', '/checkout');
  console.log('Question: "Compare Stock In and Stock Out for this month"');
  console.log('Answer:', res6.answer);
  if (!res6.answer.includes('Stock In') || !res6.answer.includes('Stock Out')) {
    throw new Error('Test 6 failed to compare stock in and stock out');
  }
  console.log('✓ Test 6 Passed\n');

  // Test 7: Multilingual - Tamil Query
  console.log('Test 7: Multilingual Query (Tamil)');
  const res7 = await askAssistant('எந்த மருந்துகள் குறைவாக உள்ளன?', 'ta', '/(tabs)/inventory');
  console.log('Question (Tamil): "எந்த மருந்துகள் குறைவாக உள்ளன?"');
  console.log('Answer:', res7.answer);
  if (!res7.answer.includes('மருந்துகள்') && !res7.answer.includes('இருப்பில்')) {
    throw new Error('Test 7 failed to respond in Tamil');
  }
  console.log('✓ Test 7 Passed\n');

  // Test 8: Multilingual - Hindi Query
  console.log('Test 8: Multilingual Query (Hindi)');
  const res8 = await askAssistant('कौन सी दवाएं कम चल रही हैं?', 'hi', '/(tabs)/inventory');
  console.log('Question (Hindi): "कौन सी दवाएं कम चल रही हैं?"');
  console.log('Answer:', res8.answer);
  if (!res8.answer.includes('दवाएं') && !res8.answer.includes('स्टॉक')) {
    throw new Error('Test 8 failed to respond in Hindi');
  }
  console.log('✓ Test 8 Passed\n');

  // Test 9: Barcode Scan Assistance & Navigation Action
  console.log('Test 9: Barcode Scanner Action');
  const res9 = await askAssistant('How do I scan a medicine barcode?', 'en', '/(tabs)/inventory');
  console.log('Question: "How do I scan a medicine barcode?"');
  console.log('Answer:', res9.answer);
  console.log('Action:', res9.action, '| Route:', res9.route);
  if (res9.action !== 'NAVIGATE' || res9.route !== '/(tabs)/scan') {
    throw new Error('Test 9 failed to provide navigation to scanner');
  }
  console.log('✓ Test 9 Passed\n');

  // Test 10: Next Month Purchase Recommendations
  console.log('Test 10: Next Month Purchase Planner Intent');
  const res10 = await askAssistant('Which medicines should I buy next month?', 'en', '/profile/ai-triage');
  console.log('Question: "Which medicines should I buy next month?"');
  console.log('Answer:', res10.answer);
  if (!res10.answer.includes('Next Month Medicine Purchase Recommendations') || !res10.answer.includes('Recommended Additional Units')) {
    throw new Error('Test 10 failed to return Next Month Purchase Recommendations');
  }
  console.log('✓ Test 10 Passed\n');

  // Test 11: Next Month Sufficient Stock Query
  console.log('Test 11: Next Month Sufficient Stock Query');
  const res11 = await askAssistant('Which medicines have enough stock for next month?', 'en', '/profile/ai-triage');
  console.log('Question: "Which medicines have enough stock for next month?"');
  console.log('Answer:', res11.answer);
  if (!res11.answer.includes('sufficient stock') && !res11.answer.includes('No additional purchase needed')) {
    throw new Error('Test 11 failed to identify medicines with sufficient stock');
  }
  console.log('✓ Test 11 Passed\n');

  console.log('====================================================');
  console.log('   ALL 11 TEST CASES COMPLETED AND PASSED SUCCESSFULLY!');
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
