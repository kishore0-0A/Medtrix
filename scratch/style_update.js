const fs = require('fs');
const file = 'd:/Medtrix/mobile/src/app/(tabs)/index.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/fontWeight:\s*'bold'/g, "fontFamily: 'Jakarta-Bold'");
content = content.replace(/fontWeight:\s*'700'/g, "fontFamily: 'Jakarta-Bold'");
content = content.replace(/fontWeight:\s*'600'/g, "fontFamily: 'Jakarta-SemiBold'");
content = content.replace(/fontWeight:\s*'500'/g, "fontFamily: 'Jakarta-Medium'");

const textStyles = [
  'greeting', 'subtitle', 'scanDesc', 'statLabel', 'legendText', 'expirySub', 'activityMedicine', 'activityDesc', 'activityTime', 'scanLabel', 'scanAction'
];

textStyles.forEach(style => {
  const regex = new RegExp(style + ':\\s*\\{([^^}]+)\\}', 'g');
  content = content.replace(regex, (match, inner) => {
    if (!inner.includes('fontFamily')) {
      return style + ': {' + inner + '    fontFamily: \'Jakarta-Regular\',\n  }';
    }
    return match;
  });
});

// Any font sizes that don't have font weights should default to Regular if not caught.
// A simpler way is to let textStyles cover the important ones, and that's it.
fs.writeFileSync(file, content);
