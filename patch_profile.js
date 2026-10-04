const fs = require('fs');
const path = require('path');

let content = fs.readFileSync(path.join(__dirname, 'src/app/(tabs)/profile.tsx'), 'utf8');

const cardsBlock = `
        {/* NEW AI TRIAGE & BARCODE CARDS */}
        <View style={styles.groupContainer}>
          <Pressable 
            style={[styles.glassGroup, GLASS.standard, { padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center' }]}
            onPress={() => router.push('/scan' as any)} // Route to existing scan tab or a specialized scan UI
          >
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.brand.soft, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
              <Ionicons name="barcode-outline" size={24} color={COLORS.brand.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ ...TYPOGRAPHY.heading, fontSize: 16, color: COLORS.text.primary, marginBottom: 4 }}>{t('profile.barcode_stock_check')}</Text>
              <Text style={{ ...TYPOGRAPHY.body, fontSize: 13, color: COLORS.text.secondary }}>{t('profile.barcode_stock_desc')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.text.muted} />
          </Pressable>

          <Pressable 
            style={[styles.glassGroup, GLASS.standard, { padding: 16, flexDirection: 'row', alignItems: 'center' }]}
            onPress={() => router.push('/profile/ai-triage' as any)}
          >
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.status.infoSoft, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
              <Ionicons name="flash-outline" size={24} color={COLORS.status.info} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ ...TYPOGRAPHY.heading, fontSize: 16, color: COLORS.text.primary, marginBottom: 4 }}>{t('profile.ai_triage')}</Text>
              <Text style={{ ...TYPOGRAPHY.body, fontSize: 13, color: COLORS.text.secondary }}>{t('profile.ai_triage_desc')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.text.muted} />
          </Pressable>
        </View>
`;

if (!content.includes('AI TRIAGE & BARCODE CARDS')) {
  content = content.replace(
    '{/* SETTINGS GROUPS (LEVEL 2 GLASS) */}',
    cardsBlock + '\n        {/* SETTINGS GROUPS (LEVEL 2 GLASS) */}'
  );
  fs.writeFileSync(path.join(__dirname, 'src/app/(tabs)/profile.tsx'), content);
  console.log('Patched profile.tsx');
}
