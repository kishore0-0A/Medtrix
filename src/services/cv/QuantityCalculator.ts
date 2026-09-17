import { DetectedItem, QuantityInfo } from './models';

export class QuantityCalculator {
  static calculate(
    items: DetectedItem[],
    packInfo: { unitsPerStrip: number | null; stripsPerPackage: number | null }
  ): QuantityInfo {
    const packages = items.filter((i) => i.type === 'box');
    const strips = items.filter((i) => i.type === 'strip');
    const units = items.filter((i) => i.type === 'tablet');

    let totalCalculated: number | null = null;
    let isUnknown = false;

    // Case A - Multiple Boxes
    if (packages.length > 0) {
      if (packInfo.unitsPerStrip && packInfo.stripsPerPackage) {
        totalCalculated =
          packages.length * packInfo.stripsPerPackage * packInfo.unitsPerStrip;
      } else {
        isUnknown = true;
      }
    }
    // Case B - Multiple Strips
    else if (strips.length > 0) {
      if (packInfo.unitsPerStrip) {
        totalCalculated = strips.length * packInfo.unitsPerStrip;
      } else {
        isUnknown = true;
      }
    }
    // Case C - Individual Tablets/Capsules
    else if (units.length > 0) {
      totalCalculated = units.length;
    }
    // Case D - Sealed Box (Assume 1 box if no visible objects but we have pack info)
    else if (packInfo.unitsPerStrip && packInfo.stripsPerPackage) {
      totalCalculated = packInfo.stripsPerPackage * packInfo.unitsPerStrip;
    } 
    // Case E - Unknown Pack Size
    else {
      isUnknown = true;
    }

    return {
      packagesDetected: packages.length,
      stripsDetected: strips.length,
      unitsDetected: units.length,
      unitsPerStrip: packInfo.unitsPerStrip,
      stripsPerPackage: packInfo.stripsPerPackage,
      totalCalculated,
      isUnknown,
    };
  }
}
