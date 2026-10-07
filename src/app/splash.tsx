import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const COLORS = {
  background: '#EAF6FD',
  backgroundDeep: '#DCEFFC',
  white: '#FFFFFF',

  navy: '#0B2348',
  navySoft: '#173B6D',

  blue: '#2374F5',
  blueBright: '#3B8BFF',
  blueSoft: '#82C4FF',

  cyan: '#54C9FF',
  cyanSoft: '#BFEAFF',

  green: '#10C99A',
  greenSoft: '#8DEFD4',

  text: '#102B57',
  textSoft: '#5C78A1',
  muted: '#829AB8',

  glass: 'rgba(255,255,255,0.58)',
  glassStrong: 'rgba(255,255,255,0.76)',
  glassSoft: 'rgba(255,255,255,0.34)',

  border: 'rgba(255,255,255,0.88)',
  blueBorder: 'rgba(35,116,245,0.28)',
};

/* ============================================================
   CAPSULE
============================================================ */

function Capsule({
  small = false,
  rotate = '-25deg',
}: {
  small?: boolean;
  rotate?: string;
}) {
  const capsuleWidth = small ? 44 : 86;
  const capsuleHeight = small ? 18 : 30;

  return (
    <View
      style={[
        styles.capsule,
        {
          width: capsuleWidth,
          height: capsuleHeight,
          borderRadius: capsuleHeight / 2,
          transform: [{ rotate }],
        },
      ]}
    >
      <View
        style={[
          styles.capsuleBlue,
          {
            width: capsuleWidth / 2,
            height: capsuleHeight,
          },
        ]}
      />

      <View
        style={[
          styles.capsuleWhite,
          {
            width: capsuleWidth / 2,
            height: capsuleHeight,
          },
        ]}
      />

      <View style={styles.capsuleReflection} />
    </View>
  );
}

/* ============================================================
   LOGO
============================================================ */

function MedtrixLogo() {
  return (
    <View style={styles.logoWrapper}>
      <View style={styles.logoGlow} />

      <View style={styles.logoOuter}>
        <View style={styles.logoInner}>
          <MaterialCommunityIcons
            name="medical-bag"
            size={42}
            color="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.logoCheck}>
        <Ionicons
          name="checkmark"
          size={17}
          color="#FFFFFF"
        />
      </View>
    </View>
  );
}

/* ============================================================
   MEDICINE VIAL
============================================================ */

function MedicineVial() {
  return (
    <View style={styles.vialScene}>

      {/* Ground glow */}
      <View style={styles.vialGroundGlow} />

      {/* Glass orbital base */}
      <View style={styles.vialPlatformOuter}>
        <View style={styles.vialPlatformMiddle}>
          <View style={styles.vialPlatformInner} />
        </View>
      </View>

      {/* Vial */}
      <View style={styles.vial}>

        {/* Neck */}
        <View style={styles.vialNeck}>
          <View style={styles.neckHighlight} />
        </View>

        {/* Cap */}
        <View style={styles.vialCap}>
          <View style={styles.capTopReflection} />
          <View style={styles.capLine} />
        </View>

        {/* Main body */}
        <View style={styles.vialBody}>

          {/* Medicine label */}
          <View style={styles.vialLabel}>
            <MaterialCommunityIcons
              name="plus"
              size={54}
              color={COLORS.blue}
            />

            <View style={styles.labelMiniLine} />
            <View style={styles.labelMiniLineShort} />
          </View>

          {/* Liquid */}
          <View style={styles.vialLiquid} />

          {/* Glass reflections */}
          <View style={styles.vialReflectionLarge} />
          <View style={styles.vialReflectionSmall} />

          {/* Side shine */}
          <View style={styles.vialEdgeLight} />
        </View>

        {/* Bottom glass */}
        <View style={styles.vialBottom} />
      </View>

      {/* Floating medicine */}
      <View style={styles.vialPillRight}>
        <Capsule small rotate="-42deg" />
      </View>

      <View style={styles.vialPillLeft}>
        <Capsule small rotate="24deg" />
      </View>
    </View>
  );
}

/* ============================================================
   SCANNER HUD
============================================================ */

function ScannerHUD() {
  return (
    <View style={styles.scannerHUD}>

      <View style={[styles.scannerCorner, styles.cornerTL]} />
      <View style={[styles.scannerCorner, styles.cornerTR]} />
      <View style={[styles.scannerCorner, styles.cornerBL]} />
      <View style={[styles.scannerCorner, styles.cornerBR]} />

      <View style={styles.scannerCenter}>
        <Ionicons
          name="scan-outline"
          size={30}
          color={COLORS.blue}
        />
      </View>

      <View style={styles.scannerDot} />
    </View>
  );
}

/* ============================================================
   DATA NODE
============================================================ */

function DataNode({
  icon,
  label,
  style,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  style?: any;
}) {
  return (
    <View style={[styles.dataNode, style]}>
      <View style={styles.dataNodeIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={14}
          color={COLORS.blue}
        />
      </View>

      <Text style={styles.dataNodeText}>{label}</Text>
    </View>
  );
}

/* ============================================================
   SPLASH SCREEN
============================================================ */

export default function SplashScreen() {

  /* ----------------------------------------------------------
     SCREEN
  ---------------------------------------------------------- */

  const screenOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const screenScale = useRef(
    new Animated.Value(1.035)
  ).current;

  /* ----------------------------------------------------------
     LOGO
  ---------------------------------------------------------- */

  const logoOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const logoScale = useRef(
    new Animated.Value(0.55)
  ).current;

  const logoY = useRef(
    new Animated.Value(28)
  ).current;

  /* ----------------------------------------------------------
     BRAND
  ---------------------------------------------------------- */

  const brandOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const brandY = useRef(
    new Animated.Value(18)
  ).current;

  const brandWidth = useRef(
    new Animated.Value(0)
  ).current;

  /* ----------------------------------------------------------
     TAGLINE
  ---------------------------------------------------------- */

  const taglineOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const taglineY = useRef(
    new Animated.Value(18)
  ).current;

  /* ----------------------------------------------------------
     HERO
  ---------------------------------------------------------- */

  const heroOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const heroScale = useRef(
    new Animated.Value(0.82)
  ).current;

  const heroY = useRef(
    new Animated.Value(35)
  ).current;

  const heroFloat = useRef(
    new Animated.Value(0)
  ).current;

  /* ----------------------------------------------------------
     ORBIT
  ---------------------------------------------------------- */

  const orbitRotation = useRef(
    new Animated.Value(0)
  ).current;

  const orbitPulse = useRef(
    new Animated.Value(0)
  ).current;

  /* ----------------------------------------------------------
     SCANNER
  ---------------------------------------------------------- */

  const scannerOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const scannerScale = useRef(
    new Animated.Value(0.72)
  ).current;

  const scannerPulse = useRef(
    new Animated.Value(0)
  ).current;

  const scanBeam = useRef(
    new Animated.Value(0)
  ).current;

  /* ----------------------------------------------------------
     DATA NODES
  ---------------------------------------------------------- */

  const nodeOne = useRef(
    new Animated.Value(0)
  ).current;

  const nodeTwo = useRef(
    new Animated.Value(0)
  ).current;

  const nodeThree = useRef(
    new Animated.Value(0)
  ).current;

  /* ----------------------------------------------------------
     PARTICLES
  ---------------------------------------------------------- */

  const particleOne = useRef(
    new Animated.Value(0)
  ).current;

  const particleTwo = useRef(
    new Animated.Value(0)
  ).current;

  const particleThree = useRef(
    new Animated.Value(0)
  ).current;

  /* ----------------------------------------------------------
     STATUS
  ---------------------------------------------------------- */

  const statusOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const statusScale = useRef(
    new Animated.Value(0.85)
  ).current;

  /* ----------------------------------------------------------
     PROGRESS
  ---------------------------------------------------------- */

  const progress = useRef(
    new Animated.Value(0)
  ).current;

  const progressOpacity = useRef(
    new Animated.Value(0)
  ).current;

  /* ----------------------------------------------------------
     EXIT
  ---------------------------------------------------------- */

  const exitOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const exitScale = useRef(
    new Animated.Value(1)
  ).current;

  /* ----------------------------------------------------------
     LOGIN
  ---------------------------------------------------------- */

  const goToLogin = () => {
    router.replace('/auth/login');
  };

  /* ==========================================================
     ANIMATION
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    /* --------------------------------------------------------
       MAIN SCREEN
    -------------------------------------------------------- */

    Animated.parallel([
      Animated.timing(screenOpacity, {
        toValue: 1,
        duration: 850,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(screenScale, {
        toValue: 1,
        duration: 1400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    /* --------------------------------------------------------
       LOGO
    -------------------------------------------------------- */

    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        delay: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.spring(logoScale, {
        toValue: 1,
        delay: 250,
        friction: 6,
        tension: 65,
        useNativeDriver: true,
      }),

      Animated.timing(logoY, {
        toValue: 0,
        duration: 650,
        delay: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    /* --------------------------------------------------------
       BRAND
    -------------------------------------------------------- */

    Animated.parallel([
      Animated.timing(brandOpacity, {
        toValue: 1,
        duration: 500,
        delay: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(brandY, {
        toValue: 0,
        duration: 550,
        delay: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(brandWidth, {
        toValue: 1,
        duration: 650,
        delay: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    /* --------------------------------------------------------
       TAGLINE
    -------------------------------------------------------- */

    Animated.parallel([
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 550,
        delay: 1050,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(taglineY, {
        toValue: 0,
        duration: 600,
        delay: 1050,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    /* --------------------------------------------------------
       HERO MEDICINE
    -------------------------------------------------------- */

    Animated.parallel([
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 700,
        delay: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.spring(heroScale, {
        toValue: 1,
        delay: 1200,
        friction: 7,
        tension: 48,
        useNativeDriver: true,
      }),

      Animated.timing(heroY, {
        toValue: 0,
        duration: 800,
        delay: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    /* --------------------------------------------------------
       HERO FLOAT
    -------------------------------------------------------- */

    Animated.loop(
      Animated.sequence([
        Animated.timing(heroFloat, {
          toValue: 1,
          duration: 2300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(heroFloat, {
          toValue: 0,
          duration: 2300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    /* --------------------------------------------------------
       ORBIT ROTATION
    -------------------------------------------------------- */

    Animated.loop(
      Animated.timing(orbitRotation, {
        toValue: 1,
        duration: 11500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    /* --------------------------------------------------------
       ORBIT PULSE
    -------------------------------------------------------- */

    Animated.loop(
      Animated.sequence([
        Animated.timing(orbitPulse, {
          toValue: 1,
          duration: 1700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(orbitPulse, {
          toValue: 0,
          duration: 1700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    /* --------------------------------------------------------
       SCANNER
    -------------------------------------------------------- */

    Animated.parallel([
      Animated.timing(scannerOpacity, {
        toValue: 1,
        duration: 500,
        delay: 1650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.spring(scannerScale, {
        toValue: 1,
        delay: 1650,
        friction: 6,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();

    /* --------------------------------------------------------
       SCANNER PULSE
    -------------------------------------------------------- */

    Animated.loop(
      Animated.sequence([
        Animated.timing(scannerPulse, {
          toValue: 1,
          duration: 850,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(scannerPulse, {
          toValue: 0,
          duration: 850,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    /* --------------------------------------------------------
       SCAN BEAM
    -------------------------------------------------------- */

    Animated.loop(
      Animated.sequence([
        Animated.timing(scanBeam, {
          toValue: 1,
          duration: 1700,
          delay: 1700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.delay(250),

        Animated.timing(scanBeam, {
          toValue: 0,
          duration: 1700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    /* --------------------------------------------------------
       DATA NODE 1
    -------------------------------------------------------- */

    Animated.loop(
      Animated.sequence([
        Animated.delay(1800),

        Animated.spring(nodeOne, {
          toValue: 1,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        }),

        Animated.delay(900),

        Animated.timing(nodeOne, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),

        Animated.delay(600),
      ])
    ).start();

    /* --------------------------------------------------------
       DATA NODE 2
    -------------------------------------------------------- */

    Animated.loop(
      Animated.sequence([
        Animated.delay(2300),

        Animated.spring(nodeTwo, {
          toValue: 1,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        }),

        Animated.delay(1000),

        Animated.timing(nodeTwo, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),

        Animated.delay(450),
      ])
    ).start();

    /* --------------------------------------------------------
       DATA NODE 3
    -------------------------------------------------------- */

    Animated.loop(
      Animated.sequence([
        Animated.delay(2800),

        Animated.spring(nodeThree, {
          toValue: 1,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        }),

        Animated.delay(850),

        Animated.timing(nodeThree, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),

        Animated.delay(500),
      ])
    ).start();

    /* --------------------------------------------------------
       PARTICLE 1
    -------------------------------------------------------- */

    Animated.loop(
      Animated.sequence([
        Animated.timing(particleOne, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(particleOne, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    /* --------------------------------------------------------
       PARTICLE 2
    -------------------------------------------------------- */

    Animated.loop(
      Animated.sequence([
        Animated.timing(particleTwo, {
          toValue: 1,
          duration: 3200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(particleTwo, {
          toValue: 0,
          duration: 3200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    /* --------------------------------------------------------
       PARTICLE 3
    -------------------------------------------------------- */

    Animated.loop(
      Animated.sequence([
        Animated.timing(particleThree, {
          toValue: 1,
          duration: 3900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(particleThree, {
          toValue: 0,
          duration: 3900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    /* --------------------------------------------------------
       SYSTEM STATUS
    -------------------------------------------------------- */

    Animated.parallel([
      Animated.timing(statusOpacity, {
        toValue: 1,
        duration: 400,
        delay: 3200,
        useNativeDriver: true,
      }),

      Animated.spring(statusScale, {
        toValue: 1,
        delay: 3200,
        friction: 7,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    /* --------------------------------------------------------
       PROGRESS
    -------------------------------------------------------- */

    Animated.sequence([
      Animated.delay(3150),

      Animated.timing(progressOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),

      Animated.timing(progress, {
        toValue: 1,
        duration: 1800,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    /* --------------------------------------------------------
       AUTOMATIC LOGIN
    -------------------------------------------------------- */

    const timer = setTimeout(() => {
      if (!mounted) {
        return;
      }

      Animated.parallel([
        Animated.timing(exitOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.timing(exitScale, {
          toValue: 1.12,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (mounted) {
          goToLogin();
        }
      });
    }, 1200);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  /* ==========================================================
     INTERPOLATIONS
  ========================================================== */

  const heroFloatY = heroFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -11],
  });

  const orbitRotationValue = orbitRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const orbitScale = orbitPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.045],
  });

  const scannerScaleValue = scannerPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const scannerOpacityValue = scannerPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const scanBeamY = scanBeam.interpolate({
    inputRange: [0, 1],
    outputRange: [-90, 90],
  });

  const scanBeamOpacity = scanBeam.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.95, 0],
  });

  const particleOneY = particleOne.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -24],
  });

  const particleOneX = particleOne.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 14],
  });

  const particleTwoY = particleTwo.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  const particleThreeY = particleThree.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });

  const nodeOneScale = nodeOne.interpolate({
    inputRange: [0, 1],
    outputRange: [0.65, 1],
  });

  const nodeTwoScale = nodeTwo.interpolate({
    inputRange: [0, 1],
    outputRange: [0.65, 1],
  });

  const nodeThreeScale = nodeThree.interpolate({
    inputRange: [0, 1],
    outputRange: [0.65, 1],
  });

  const progressScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <View style={styles.container}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
        translucent
      />

      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <Animated.View
        style={[
          styles.backgroundLayer,
          {
            opacity: screenOpacity,
            transform: [{ scale: screenScale }],
          },
        ]}
      />

      {/* Ambient lights */}

      <View style={styles.ambientTop} />
      <View style={styles.ambientRight} />
      <View style={styles.ambientBottom} />
      <View style={styles.ambientLeft} />

      {/* ======================================================
          FLOATING CAPSULES
      ====================================================== */}

      <Animated.View
        style={[
          styles.floatingCapsuleTop,
          {
            transform: [
              { translateY: particleOneY },
              { translateX: particleOneX },
              { rotate: '-25deg' },
            ],
          },
        ]}
      >
        <Capsule />
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingCapsuleLeft,
          {
            transform: [
              { translateY: particleTwoY },
              { rotate: '42deg' },
            ],
          },
        ]}
      >
        <Capsule small />
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingCapsuleBottom,
          {
            transform: [
              { translateY: particleThreeY },
              { rotate: '-30deg' },
            ],
          },
        ]}
      >
        <Capsule small />
      </Animated.View>

      {/* ======================================================
          SMALL PARTICLES
      ====================================================== */}

      <Animated.View
        style={[
          styles.particle,
          styles.particleOne,
          {
            transform: [{ translateY: particleOneY }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.particle,
          styles.particleTwo,
          {
            transform: [{ translateY: particleTwoY }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.particle,
          styles.particleThree,
          {
            transform: [{ translateY: particleThreeY }],
          },
        ]}
      />

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <View style={styles.content}>

        {/* ====================================================
            LOGO
        ==================================================== */}

        <Animated.View
          style={[
            styles.logoAnimated,
            {
              opacity: logoOpacity,
              transform: [
                { translateY: logoY },
                { scale: logoScale },
              ],
            },
          ]}
        >
          <MedtrixLogo />
        </Animated.View>

        {/* ====================================================
            BRAND
        ==================================================== */}

        <Animated.View
          style={[
            styles.brandAnimated,
            {
              opacity: brandOpacity,
              transform: [
                { translateY: brandY },
                { scaleX: brandWidth },
              ],
            },
          ]}
        >
          <Text style={styles.brandText}>
            MEDTRIX
          </Text>
        </Animated.View>

        {/* ====================================================
            CLINICAL STATUS
        ==================================================== */}

        <Animated.View
          style={[
            styles.statusBadge,
            {
              opacity: statusOpacity,
              transform: [{ scale: statusScale }],
            },
          ]}
        >
          <View style={styles.statusDot} />

          <Text style={styles.statusText}>
            CLINICAL INVENTORY SYSTEM
          </Text>
        </Animated.View>

        {/* ====================================================
            TAGLINE
        ==================================================== */}

        <Animated.View
          style={[
            styles.taglineAnimated,
            {
              opacity: taglineOpacity,
              transform: [{ translateY: taglineY }],
            },
          ]}
        >
          <Text style={styles.tagline}>
            Smarter Inventory.
          </Text>

          <Text style={styles.taglineAccent}>
            Better Care.
          </Text>
        </Animated.View>

        {/* ====================================================
            HERO
        ==================================================== */}

        <Animated.View
          style={[
            styles.heroAnimated,
            {
              opacity: heroOpacity,
              transform: [
                { translateY: heroY },
                { translateY: heroFloatY },
                { scale: heroScale },
              ],
            },
          ]}
        >

          {/* Outer orbit */}

          <Animated.View
            style={[
              styles.orbitOuter,
              {
                transform: [
                  { rotate: orbitRotationValue },
                  { scale: orbitScale },
                ],
              },
            ]}
          >
            <View style={styles.orbitMarkerTop} />
            <View style={styles.orbitMarkerRight} />
            <View style={styles.orbitMarkerBottom} />
            <View style={styles.orbitMarkerLeft} />
          </Animated.View>

          {/* Inner orbit */}

          <Animated.View
            style={[
              styles.orbitInner,
              {
                transform: [{ scale: orbitScale }],
              },
            ]}
          />

          {/* Medicine */}

          <MedicineVial />

          {/* Scanner */}

          <Animated.View
            style={[
              styles.scannerAnimated,
              {
                opacity: scannerOpacity,
                transform: [
                  { scale: scannerScale },
                  { scale: scannerScaleValue },
                ],
              },
            ]}
          >
            <ScannerHUD />

            {/* Scanner beam */}

            <Animated.View
              style={[
                styles.scanBeam,
                {
                  opacity: scanBeamOpacity,
                  transform: [{ translateY: scanBeamY }],
                },
              ]}
            />
          </Animated.View>

          {/* ==================================================
              DATA NODES
          ================================================== */}

          <Animated.View
            style={[
              styles.nodeOneAnimated,
              {
                opacity: nodeOne,
                transform: [{ scale: nodeOneScale }],
              },
            ]}
          >
            <DataNode
              icon="barcode-scan"
              label="BARCODE"
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.nodeTwoAnimated,
              {
                opacity: nodeTwo,
                transform: [{ scale: nodeTwoScale }],
              },
            ]}
          >
            <DataNode
              icon="text-box-search-outline"
              label="OCR"
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.nodeThreeAnimated,
              {
                opacity: nodeThree,
                transform: [{ scale: nodeThreeScale }],
              },
            ]}
          >
            <DataNode
              icon="shield-check-outline"
              label="VERIFY"
            />
          </Animated.View>

          {/* ==================================================
              CONNECTOR LINES
          ================================================== */}

          <View style={styles.connectorOne} />
          <View style={styles.connectorTwo} />
          <View style={styles.connectorThree} />

        </Animated.View>

        {/* ====================================================
            SYSTEM INITIALIZATION
        ==================================================== */}

        <Animated.View
          style={[
            styles.initialization,
            {
              opacity: progressOpacity,
            },
          ]}
        >

          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>
              SYSTEM INITIALIZATION
            </Text>

            <Text style={styles.progressPercent}>
              100%
            </Text>
          </View>

          <View style={styles.progressTrack}>

            <Animated.View
              style={[
                styles.progressBar,
                {
                  transform: [
                    {
                      scaleX: progressScale,
                    },
                  ],
                },
              ]}
            />

          </View>

        </Animated.View>

      </View>

      {/* ======================================================
          EXIT TRANSITION
      ====================================================== */}

      <Animated.View
        style={[
          styles.exitOverlay,
          {
            opacity: exitOpacity,
            transform: [{ scale: exitScale }],
          },
          { pointerEvents: 'none' }
        ]}
      />
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
  },

  backgroundLayer: {
    ...(StyleSheet.absoluteFill as any),
    backgroundColor: COLORS.background,
  },

  /* ==========================================================
     AMBIENT BACKGROUND
  ========================================================== */

  ambientTop: {
    position: 'absolute',
    width: width * 1.25,
    height: width * 1.25,
    borderRadius: width,
    top: -width * 0.68,
    left: -width * 0.28,
    backgroundColor: '#D4EDFC',
    opacity: 0.82,
  },

  ambientRight: {
    position: 'absolute',
    width: width * 0.78,
    height: width * 0.78,
    borderRadius: width,
    right: -width * 0.34,
    top: height * 0.20,
    backgroundColor: '#FFFFFF',
    opacity: 0.62,
  },

  ambientBottom: {
    position: 'absolute',
    width: width * 1.05,
    height: width * 1.05,
    borderRadius: width,
    bottom: -width * 0.42,
    left: -width * 0.05,
    backgroundColor: '#F9FDFF',
    opacity: 0.94,
  },

  ambientLeft: {
    position: 'absolute',
    width: width * 0.52,
    height: width * 0.52,
    borderRadius: width,
    left: -width * 0.34,
    top: height * 0.47,
    backgroundColor: '#C9E8FC',
    opacity: 0.42,
  },

  /* ==========================================================
     CAPSULES
  ========================================================== */

  capsule: {
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.40)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.92)',
    shadowColor: '#6CAFE7',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 15,
    elevation: 5,
  },

  capsuleBlue: {
    backgroundColor: 'rgba(63,143,238,0.30)',
  },

  capsuleWhite: {
    backgroundColor: 'rgba(255,255,255,0.76)',
  },

  capsuleReflection: {
    position: 'absolute',
    left: '12%',
    top: 3,
    width: '58%',
    height: 3,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },

  floatingCapsuleTop: {
    position: 'absolute',
    top: height * 0.12,
    left: -30,
    opacity: 0.56,
  },

  floatingCapsuleLeft: {
    position: 'absolute',
    top: height * 0.45,
    left: 17,
    opacity: 0.40,
  },

  floatingCapsuleBottom: {
    position: 'absolute',
    bottom: height * 0.16,
    right: 22,
    opacity: 0.30,
  },

  particle: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: COLORS.blue,
    opacity: 0.35,
  },

  particleOne: {
    top: height * 0.24,
    right: 35,
  },

  particleTwo: {
    top: height * 0.58,
    right: 48,
    width: 4,
    height: 4,
  },

  particleThree: {
    top: height * 0.35,
    left: 42,
    width: 3,
    height: 3,
  },

  /* ==========================================================
     CONTENT
  ========================================================== */

  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingTop: Math.max(height * 0.075, 46),
  },

  /* ==========================================================
     LOGO
  ========================================================== */

  logoAnimated: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoWrapper: {
    width: 94,
    height: 94,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(65,153,245,0.12)',
  },

  logoOuter: {
    width: 84,
    height: 84,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5CA7E5',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.22,
    shadowRadius: 19,
    elevation: 7,
  },

  logoInner: {
    width: 68,
    height: 68,
    borderRadius: 21,
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.blue,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },

  logoCheck: {
    position: 'absolute',
    right: 0,
    bottom: 1,
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: COLORS.green,
    borderWidth: 2,
    borderColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ==========================================================
     BRAND
  ========================================================== */

  brandAnimated: {
    marginTop: 9,
    alignItems: 'center',
  },

  brandText: {
    fontSize: 39,
    lineHeight: 45,
    fontWeight: '800',
    letterSpacing: 4,
    color: COLORS.navy,
  },

  /* ==========================================================
     STATUS
  ========================================================== */

  statusBadge: {
    marginTop: 7,
    minHeight: 28,
    paddingHorizontal: 13,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.43)',
    borderWidth: 1,
    borderColor: 'rgba(35,116,245,0.28)',
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: COLORS.green,
    marginRight: 7,
    shadowColor: COLORS.green,
    shadowOpacity: 0.45,
    shadowRadius: 5,
  },

  statusText: {
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: COLORS.blue,
  },

  /* ==========================================================
     TAGLINE
  ========================================================== */

  taglineAnimated: {
    marginTop: 20,
    alignItems: 'center',
  },

  tagline: {
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '400',
    letterSpacing: 0.1,
    color: COLORS.navySoft,
  },

  taglineAccent: {
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '700',
    letterSpacing: 0.1,
    color: COLORS.blue,
  },

  /* ==========================================================
     HERO
  ========================================================== */

  heroAnimated: {
    width: width * 0.83,
    height: height * 0.39,
    maxHeight: 350,
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ==========================================================
     ORBITS
  ========================================================== */

  orbitOuter: {
    position: 'absolute',
    width: Math.min(width * 0.67, 275),
    height: Math.min(width * 0.67, 275),
    borderRadius: 200,
    borderWidth: 1,
    borderColor: 'rgba(44,137,237,0.23)',
  },

  orbitInner: {
    position: 'absolute',
    width: Math.min(width * 0.53, 218),
    height: Math.min(width * 0.53, 218),
    borderRadius: 150,
    borderWidth: 1,
    borderColor: 'rgba(44,137,237,0.18)',
  },

  orbitMarkerTop: {
    position: 'absolute',
    top: -2,
    left: '44%',
    width: 34,
    height: 3,
    borderRadius: 3,
    backgroundColor: COLORS.blue,
    opacity: 0.58,
  },

  orbitMarkerRight: {
    position: 'absolute',
    right: -2,
    top: '44%',
    width: 3,
    height: 30,
    borderRadius: 3,
    backgroundColor: COLORS.cyan,
    opacity: 0.50,
  },

  orbitMarkerBottom: {
    position: 'absolute',
    bottom: -2,
    left: '21%',
    width: 27,
    height: 3,
    borderRadius: 3,
    backgroundColor: COLORS.blueSoft,
    opacity: 0.52,
  },

  orbitMarkerLeft: {
    position: 'absolute',
    left: -2,
    top: '29%',
    width: 3,
    height: 25,
    borderRadius: 3,
    backgroundColor: COLORS.blueSoft,
    opacity: 0.42,
  },

  /* ==========================================================
     VIAL
  ========================================================== */

  vialScene: {
    width: 235,
    height: 270,
    alignItems: 'center',
    justifyContent: 'center',
  },

  vialGroundGlow: {
    position: 'absolute',
    width: 180,
    height: 70,
    bottom: 18,
    borderRadius: 100,
    backgroundColor: 'rgba(70,161,232,0.12)',
  },

  vialPlatformOuter: {
    position: 'absolute',
    width: 218,
    height: 116,
    bottom: 14,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: 'rgba(99,180,237,0.24)',
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  vialPlatformMiddle: {
    width: 183,
    height: 94,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(99,180,237,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  vialPlatformInner: {
    width: 142,
    height: 67,
    borderRadius: 80,
    backgroundColor: 'rgba(90,177,235,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.60)',
  },

  vial: {
    position: 'absolute',
    width: 140,
    height: 235,
    top: 16,
    alignItems: 'center',
  },

  vialNeck: {
    position: 'absolute',
    top: 37,
    width: 74,
    height: 55,
    backgroundColor: 'rgba(228,247,255,0.45)',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.86)',
    overflow: 'hidden',
  },

  neckHighlight: {
    position: 'absolute',
    left: 8,
    top: 5,
    width: 8,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },

  vialCap: {
    position: 'absolute',
    top: 13,
    width: 90,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#438FEF',
    borderWidth: 1,
    borderColor: '#78B8F7',
    overflow: 'hidden',
    shadowColor: COLORS.blue,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.25,
    shadowRadius: 11,
    elevation: 5,
  },

  capTopReflection: {
    position: 'absolute',
    top: -3,
    left: 9,
    width: 70,
    height: 13,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  capLine: {
    position: 'absolute',
    left: 13,
    right: 13,
    top: 18,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  vialBody: {
    position: 'absolute',
    top: 68,
    width: 124,
    height: 151,
    borderRadius: 23,
    backgroundColor: 'rgba(239,250,255,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.90)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#73B6E8',
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 4,
  },

  vialLabel: {
    width: 97,
    height: 82,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.48)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  labelMiniLine: {
    width: 38,
    height: 3,
    borderRadius: 3,
    backgroundColor: 'rgba(35,116,245,0.22)',
    marginTop: 2,
  },

  labelMiniLineShort: {
    width: 24,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(35,116,245,0.14)',
    marginTop: 5,
  },

  vialLiquid: {
    position: 'absolute',
    bottom: -17,
    width: 120,
    height: 49,
    borderRadius: 60,
    backgroundColor: 'rgba(70,159,233,0.15)',
  },

  vialReflectionLarge: {
    position: 'absolute',
    width: 15,
    height: 126,
    left: 11,
    top: 7,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.40)',
    transform: [{ rotate: '7deg' }],
  },

  vialReflectionSmall: {
    position: 'absolute',
    width: 6,
    height: 79,
    right: 12,
    top: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.24)',
  },

  vialEdgeLight: {
    position: 'absolute',
    right: 2,
    top: 10,
    width: 2,
    height: 126,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.68)',
  },

  vialBottom: {
    position: 'absolute',
    bottom: 0,
    width: 126,
    height: 34,
    borderRadius: 70,
    backgroundColor: 'rgba(198,229,247,0.39)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.80)',
  },

  vialPillRight: {
    position: 'absolute',
    right: -8,
    top: 92,
    opacity: 0.82,
  },

  vialPillLeft: {
    position: 'absolute',
    left: -2,
    bottom: 35,
    opacity: 0.68,
  },

  /* ==========================================================
     SCANNER
  ========================================================== */

  scannerAnimated: {
    position: 'absolute',
    right: Math.max(width * 0.04, 7),
    top: 34,
    zIndex: 10,
  },

  scannerHUD: {
    width: 78,
    height: 78,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.48)',
    borderWidth: 1.5,
    borderColor: 'rgba(35,116,245,0.44)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.blue,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.15,
    shadowRadius: 13,
    elevation: 5,
  },

  scannerCenter: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(235,247,255,0.42)',
  },

  scannerCorner: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderColor: COLORS.blue,
  },

  cornerTL: {
    left: 8,
    top: 8,
    borderLeftWidth: 2.5,
    borderTopWidth: 2.5,
    borderTopLeftRadius: 4,
  },

  cornerTR: {
    right: 8,
    top: 8,
    borderRightWidth: 2.5,
    borderTopWidth: 2.5,
    borderTopRightRadius: 4,
  },

  cornerBL: {
    left: 8,
    bottom: 8,
    borderLeftWidth: 2.5,
    borderBottomWidth: 2.5,
    borderBottomLeftRadius: 4,
  },

  cornerBR: {
    right: 8,
    bottom: 8,
    borderRightWidth: 2.5,
    borderBottomWidth: 2.5,
    borderBottomRightRadius: 4,
  },

  scannerDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: COLORS.green,
    top: 13,
    right: 13,
  },

  scanBeam: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: 36,
    height: 2,
    borderRadius: 2,
    backgroundColor: COLORS.blue,
    shadowColor: COLORS.blue,
    shadowOpacity: 0.75,
    shadowRadius: 8,
    elevation: 5,
  },

  /* ==========================================================
     DATA NODES
  ========================================================== */

  dataNode: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.53)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
  },

  dataNodeIcon: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: 'rgba(35,116,245,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },

  dataNodeText: {
    fontFamily: 'monospace',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: COLORS.textSoft,
  },

  nodeOneAnimated: {
    position: 'absolute',
    left: 0,
    top: 77,
  },

  nodeTwoAnimated: {
    position: 'absolute',
    right: -3,
    bottom: 64,
  },

  nodeThreeAnimated: {
    position: 'absolute',
    left: 10,
    bottom: 34,
  },

  connectorOne: {
    position: 'absolute',
    width: 43,
    height: 1,
    backgroundColor: 'rgba(35,116,245,0.20)',
    left: 54,
    top: 92,
    transform: [{ rotate: '-18deg' }],
  },

  connectorTwo: {
    position: 'absolute',
    width: 45,
    height: 1,
    backgroundColor: 'rgba(35,116,245,0.20)',
    right: 54,
    bottom: 80,
    transform: [{ rotate: '-18deg' }],
  },

  connectorThree: {
    position: 'absolute',
    width: 40,
    height: 1,
    backgroundColor: 'rgba(35,116,245,0.16)',
    left: 57,
    bottom: 48,
    transform: [{ rotate: '18deg' }],
  },

  /* ==========================================================
     INITIALIZATION
  ========================================================== */

  initialization: {
    width: Math.min(width * 0.68, 285),
    marginTop: -1,
  },

  progressHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },

  progressLabel: {
    fontFamily: 'monospace',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.3,
    color: COLORS.muted,
  },

  progressPercent: {
    fontFamily: 'monospace',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: COLORS.blue,
  },

  progressTrack: {
    width: '100%',
    height: 4,
    borderRadius: 5,
    backgroundColor: 'rgba(35,116,245,0.13)',
    overflow: 'hidden',
  },

  progressBar: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
    backgroundColor: COLORS.blue,
    transformOrigin: 'left',
    shadowColor: COLORS.blue,
    shadowOpacity: 0.40,
    shadowRadius: 7,
    elevation: 3,
  },

  progressFooter: {
    marginTop: 8,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  readyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  readyDot: {
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: COLORS.green,
    marginRight: 5,
  },

  readyText: {
    fontFamily: 'monospace',
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: COLORS.textSoft,
  },

  versionText: {
    fontFamily: 'monospace',
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: COLORS.muted,
  },

  /* ==========================================================
     EXIT
  ========================================================== */

  exitOverlay: {
    position: 'absolute',
    width: width * 1.8,
    height: width * 1.8,
    borderRadius: width,
    backgroundColor: COLORS.white,
    top: '50%',
    left: '50%',
    marginLeft: -(width * 0.9),
    marginTop: -(width * 0.9),
    zIndex: 30,
  },

  /* ==========================================================
     SKIP
  ========================================================== */

  skipButton: {
    position: 'absolute',
    right: 17,
    bottom: 17,
    minWidth: 62,
    height: 31,
    paddingHorizontal: 10,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.46)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.75)',
    zIndex: 50,
  },

  skipButtonPressed: {
    opacity: 0.55,
    transform: [{ scale: 0.96 }],
  },

  skipText: {
    fontFamily: 'monospace',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
    color: COLORS.textSoft,
    marginRight: 3,
  },
});