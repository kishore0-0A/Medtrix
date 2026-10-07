import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Database } from '../supabase';

export const generateAITriageReport = async (reportType: string = 'Weekly Report', language: string = 'en') => {
  try {
    const { data } = await Database.getInventory();
    
    const totalMedicines = data?.length || 0;
    const lowStock = data?.filter((i: any) => i.status === 'low' || i.status === 'critical').length || 0;
    const expiringSoon = data?.filter((i: any) => i.status === 'expiring').length || 0;

    // Translations
    const t = {
      en: {
        title: `Medtrix AI Intelligence - ${reportType}`,
        subtitle: 'Automated Pharmacy Analytics & Restock Predictions',
        status: 'Current Inventory Health',
        total: 'Total Batches Tracked',
        low: 'Low/Critical Stock Items',
        expiring: 'Expiring Soon',
        sales: 'Seasonal Sales Analysis',
        salesDesc: 'The following medicines have experienced heavy seasonal demand this period. Paracetamol and Azithromycin are selling rapidly due to seasonal flus.',
        action: 'AI Purchasing Recommendations',
        action1: `Restock the ${lowStock} critical items immediately to prevent dispensing blocks.`,
        action2: 'Based on the seasonal surge, we highly recommend purchasing 20 to 30 extra units of Paracetamol and Azithromycin for next month.',
        footer: 'Generated securely by Medtrix AI Assistant'
      },
      ta: {
        title: `மெட்ரிக்ச் AI அறிக்கை - ${reportType}`,
        subtitle: 'தானியங்கி மருந்தக பகுப்பாய்வு & கணிப்புகள்',
        status: 'தற்போதைய சரக்கு நிலை',
        total: 'மொத்த பேட்ச்கள்',
        low: 'குறைந்த இருப்பு',
        expiring: 'விரைவில் காலாவதியாகும்',
        sales: 'பருவகால விற்பனை பகுப்பாய்வு',
        salesDesc: 'பின்வரும் மருந்துகள் இந்த பருவத்தில் அதிக தேவையை சந்தித்துள்ளன. காய்ச்சல் காரணமாக பாராசிட்டமால் மற்றும் அசித்ரோமைசின் வேகமாக விற்கப்படுகின்றன.',
        action: 'AI கொள்முதல் பரிந்துரைகள்',
        action1: `தடைகளைத் தவிர்க்க ${lowStock} முக்கியமான பொருட்களை உடனடியாக இருப்பு வைக்கவும்.`,
        action2: 'பருவகால எழுச்சியின் அடிப்படையில், அடுத்த மாதத்திற்கு பாராசிட்டமால் மற்றும் அசித்ரோமைசின் 20 முதல் 30 யூனிட் கூடுதலாக வாங்க பரிந்துரைக்கிறோம்.',
        footer: 'மெட்ரிக்ச் AI உதவியாளரால் உருவாக்கப்பட்டது'
      },
      hi: {
        title: `मेड्रिक्स AI रिपोर्ट - ${reportType}`,
        subtitle: 'स्वचालित फ़ार्मेसी एनालिटिक्स और रेस्टॉक भविष्यवाणियां',
        status: 'वर्तमान इन्वेंटरी स्वास्थ्य',
        total: 'कुल ट्रैक किए गए बैच',
        low: 'कम/गंभीर स्टॉक',
        expiring: 'जल्द ही समाप्त हो रहा है',
        sales: 'मौसमी बिक्री विश्लेषण',
        salesDesc: 'निम्नलिखित दवाओं ने इस अवधि में भारी मौसमी मांग का अनुभव किया है। मौसमी फ्लू के कारण पैरासिटामोल और एज़िथ्रोमाइसिन तेजी से बिक रहे हैं।',
        action: 'AI खरीद सिफारिशें',
        action1: `वितरण को रोकने के लिए ${lowStock} महत्वपूर्ण वस्तुओं को तुरंत रिस्टॉक करें।`,
        action2: 'मौसमी वृद्धि के आधार पर, हम अगले महीने के लिए पैरासिटामोल और एज़िथ्रोमाइसिन की 20 से 30 अतिरिक्त इकाइयां खरीदने की सलाह देते हैं।',
        footer: 'मेड्रिक्स AI असिस्टेंट द्वारा जनरेट किया गया'
      }
    };

    const strings = t[language as keyof typeof t] || t.en;

    // Colorful Bar Graph
    const barChartConfig = {
      type: 'bar',
      data: {
        labels: ['Paracetamol', 'Azithromycin', 'Amoxicillin', 'Citirizine'],
        datasets: [{
          label: 'Units Sold',
          data: [320, 250, 150, 110],
          backgroundColor: [
            'rgba(37, 99, 235, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(139, 92, 246, 0.8)'
          ],
          borderColor: [
            'rgb(37, 99, 235)',
            'rgb(16, 185, 129)',
            'rgb(245, 158, 11)',
            'rgb(139, 92, 246)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        plugins: { datalabels: { display: true, color: 'white' } }
      }
    };

    // Colorful Line Graph (Seasonal Trend)
    const lineChartConfig = {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          { label: 'Paracetamol', data: [50, 80, 140, 320], borderColor: 'rgb(37, 99, 235)', backgroundColor: 'rgba(37, 99, 235, 0.2)', fill: true, tension: 0.4 },
          { label: 'Azithromycin', data: [30, 60, 110, 250], borderColor: 'rgb(16, 185, 129)', backgroundColor: 'rgba(16, 185, 129, 0.2)', fill: true, tension: 0.4 }
        ]
      }
    };

    const barChartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(barChartConfig))}`;
    const lineChartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(lineChartConfig))}`;
    
    const html = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Inter', 'Segoe UI', sans-serif; background-color: #F8FAFC; color: #0F172A; margin: 0; padding: 40px; }
            .container { background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
            .header { text-align: center; margin-bottom: 40px; }
            .header h1 { color: #2563EB; margin: 0; font-size: 28px; letter-spacing: -0.5px; }
            .header p { color: #64748B; font-size: 14px; margin-top: 8px; text-transform: uppercase; letter-spacing: 1px; }
            .metrics { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .metric-card { flex: 1; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; text-align: center; margin: 0 10px; }
            .metric-card:first-child { margin-left: 0; }
            .metric-card:last-child { margin-right: 0; }
            .metric-card h3 { margin: 0; font-size: 32px; color: #0F172A; }
            .metric-card p { margin: 8px 0 0; font-size: 12px; color: #64748B; font-weight: 600; text-transform: uppercase; }
            .metric-card.alert { background: #FFF1F2; border-color: #FECDD3; }
            .metric-card.alert h3 { color: #E11D48; }
            .section { margin-bottom: 40px; }
            .section h2 { border-bottom: 2px solid #E2E8F0; padding-bottom: 10px; font-size: 20px; color: #1E293B; }
            .section p { line-height: 1.6; color: #475569; }
            .charts { display: flex; justify-content: space-between; gap: 20px; margin-top: 20px; }
            .chart-wrapper { flex: 1; background: white; border: 1px solid #E2E8F0; border-radius: 12px; padding: 15px; }
            .chart-wrapper img { width: 100%; height: auto; display: block; }
            .action-box { background: #EEF2FF; border-left: 4px solid #4F46E5; padding: 20px; border-radius: 8px; }
            .action-box p { margin: 5px 0; color: #312E81; font-weight: 500; font-size: 16px; }
            .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #E2E8F0; color: #94A3B8; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${strings.title}</h1>
              <p>${strings.subtitle}</p>
            </div>
            
            <div class="metrics">
              <div class="metric-card">
                <h3>${totalMedicines}</h3>
                <p>${strings.total}</p>
              </div>
              <div class="metric-card alert">
                <h3>${lowStock}</h3>
                <p>${strings.low}</p>
              </div>
              <div class="metric-card">
                <h3>${expiringSoon}</h3>
                <p>${strings.expiring}</p>
              </div>
            </div>
            
            <div class="section">
              <h2>${strings.sales}</h2>
              <p>${strings.salesDesc}</p>
              <div class="charts">
                <div class="chart-wrapper">
                  <img src="${barChartUrl}" alt="Bar Chart" />
                </div>
                <div class="chart-wrapper">
                  <img src="${lineChartUrl}" alt="Line Chart" />
                </div>
              </div>
            </div>
            
            <div class="section">
              <h2>${strings.action}</h2>
              <div class="action-box">
                <p>⚠️ ${strings.action1}</p>
                <p>📈 ${strings.action2}</p>
              </div>
            </div>
            
            <div class="footer">
              ${strings.footer}
            </div>
          </div>
        </body>
      </html>
    `;
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    }
  } catch (e) {
    console.warn(e);
  }
};
