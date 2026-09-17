import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const COLORS = {
  bg: '#EAF6FD',
  bgLight: '#F7FCFF',

  navy: '#102B57',
  navyDark: '#0B2348',

  blue: '#2374F5',
  blueBright: '#2F82FF',
  blueSoft: '#8EC8FF',

  green: '#10C99A',

  textSoft: '#5C78A1',
  textMuted: '#8BA2BF',

  white: '#FFFFFF',
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
  const capsuleWidth = small ? 43 : 92;
  const capsuleHeight = small ? 17 : 31;

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
          styles.capsuleHalfBlue,
          {
            width: capsuleWidth / 2,
            height: capsuleHeight,
          },
        ]}
      />

      <View
        style={[
          styles.capsuleHalfWhite,
          {
            width: capsuleWidth / 2,
            height: capsuleHeight,
          },
        ]}
      />

      <View style={styles.capsuleHighlight} />
    </View>
  );
}

/* ============================================================
   MEDTRIX LOGO
============================================================ */

function MedtrixLogo() {
  return (
    <View style={styles.logoWrapper}>
      <View style={styles.logoOuterGlass}>
        <View style={styles.logoBlueBox}>
          <MaterialCommunityIcons
            name="medical-bag"
            size={43}
            color="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.logoCheck}>
        <Ionicons
          name="checkmark"
          size={18}
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
    <View style={styles.vialContainer}>

      {/* Large transparent glass base */}
      <View style={styles.glassBaseOuter}>
        <View style={styles.glassBaseMiddle}>
          <View style={styles.glassBaseInner} />
        </View>
      </View>

      {/* Vial */}
      <View style={styles.vial}>

        {/* Vial neck */}
        <View style={styles.vialNeck}>
          <View style={styles.neckHighlight} />
        </View>

        {/* Blue cap */}
        <View style={styles.vialCap}>
          <View style={styles.capTop} />
          <View style={styles.capHighlight} />
        </View>

        {/* Glass body */}
        <View style={styles.vialBody}>

          {/* Medicine label */}
          <View style={styles.vialLabel}>
            <MaterialCommunityIcons
              name="plus"
              size={55}
              color={COLORS.blue}
            />
          </View>

          {/* Glass reflection */}
          <View style={styles.vialReflection} />
          <View style={styles.vialReflectionSmall} />

          {/* Liquid */}
          <View style={styles.vialLiquid} />
        </View>

        {/* Bottom glass */}
        <View style={styles.vialBottom} />
      </View>

      {/* Pill floating around vial */}
      <View style={styles.vialPillRight}>
        <Capsule
          small
          rotate="-45deg"
        />
      </View>

      <View style={styles.vialPillLeft}>
        <Capsule
          small
          rotate="25deg"
        />
      </View>
    </View>
  );
}

/* ============================================================
   SCANNER FRAME
============================================================ */

function ScannerFrame() {
  return (
    <View style={styles.scannerBox}>

      <View style={[styles.scanCorner, styles.scanTL]} />
      <View style={[styles.scanCorner, styles.scanTR]} />
      <View style={[styles.scanCorner, styles.scanBL]} />
      <View style={[styles.scanCorner, styles.scanBR]} />

      <Ionicons
        name="scan-outline"
        size={32}
        color={COLORS.blue}
      />
    </View>
  );
}

/* ============================================================
   SPLASH SCREEN
============================================================ */

export default function SplashScreen() {

  /* ==========================================================
     MAIN ENTRANCE
  ========================================================== */

  const screenOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const screenScale = useRef(
    new Animated.Value(1.03)
  ).current;

  /* ==========================================================
     LOGO
  ========================================================== */

  const logoOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const logoScale = useRef(
    new Animated.Value(0.72)
  ).current;

  const logoY = useRef(
    new Animated.Value(22)
  ).current;

  /* ==========================================================
     BRAND
  ========================================================== */

  const brandOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const brandY = useRef(
    new Animated.Value(20)
  ).current;

  const badgeOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const badgeScale = useRef(
    new Animated.Value(0.7)
  ).current;

  /* ==========================================================
     TEXT
  ========================================================== */

  const taglineOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const taglineY = useRef(
    new Animated.Value(22)
  ).current;

  const subtitleOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const subtitleY = useRef(
    new Animated.Value(16)
  ).current;

  /* ==========================================================
     VIAL
  ========================================================== */

  const vialOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const vialScale = useRef(
    new Animated.Value(0.72)
  ).current;

  const vialY = useRef(
    new Animated.Value(45)
  ).current;

  const vialFloat = useRef(
    new Animated.Value(0)
  ).current;

  /* ==========================================================
     SCANNER
  ========================================================== */

  const scannerOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const scannerScale = useRef(
    new Animated.Value(0.72)
  ).current;

  const scannerPulse = useRef(
    new Animated.Value(0)
  ).current;

  /* ==========================================================
     FLOATING OBJECTS
  ========================================================== */

  const floatingOne = useRef(
    new Animated.Value(0)
  ).current;

  const floatingTwo = useRef(
    new Animated.Value(0)
  ).current;

  const floatingThree = useRef(
    new Animated.Value(0)
  ).current;

  /* ==========================================================
     RINGS
  ========================================================== */

  const ringRotation = useRef(
    new Animated.Value(0)
  ).current;

  const ringPulse = useRef(
    new Animated.Value(0)
  ).current;

  /* ==========================================================
     PROGRESS
  ========================================================== */

  const progress = useRef(
    new Animated.Value(0)
  ).current;

  const progressOpacity = useRef(
    new Animated.Value(0)
  ).current;

  /* ==========================================================
     EXIT
  ========================================================== */

  const exitOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const exitScale = useRef(
    new Animated.Value(1)
  ).current;

  /* ==========================================================
     LOGIN NAVIGATION
  ========================================================== */

  const goToLogin = () => {
    router.replace('/auth/login');
  };

  /* ==========================================================
     ANIMATION
  ========================================================== */

  useEffect(() => {

    /* --------------------------------------------------------
       SCREEN
    -------------------------------------------------------- */

    Animated.parallel([
      Animated.timing(screenOpacity, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(screenScale, {
        toValue: 1,
        duration: 1200,
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
        duration: 650,
        delay: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.spring(logoScale, {
        toValue: 1,
        delay: 250,
        friction: 6,
        tension: 75,
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
        duration: 550,
        delay: 750,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(brandY, {
        toValue: 0,
        duration: 550,
        delay: 750,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    /* --------------------------------------------------------
       BADGE
    -------------------------------------------------------- */

    Animated.parallel([
      Animated.timing(badgeOpacity, {
        toValue: 1,
        duration: 350,
        delay: 1050,
        useNativeDriver: true,
      }),

      Animated.spring(badgeScale, {
        toValue: 1,
        delay: 1050,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    /* --------------------------------------------------------
       TAGLINE
    -------------------------------------------------------- */

    Animated.parallel([
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 600,
        delay: 1150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(taglineY, {
        toValue: 0,
        duration: 600,
        delay: 1150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    /* --------------------------------------------------------
       SUBTITLE
    -------------------------------------------------------- */

    Animated.parallel([
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 500,
        delay: 1450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(subtitleY, {
        toValue: 0,
        duration: 500,
        delay: 1450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    /* --------------------------------------------------------
       VIAL
    -------------------------------------------------------- */

    Animated.parallel([
      Animated.timing(vialOpacity, {
        toValue: 1,
        duration: 850,
        delay: 1550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.spring(vialScale, {
        toValue: 1,
        delay: 1550,
        friction: 7,
        tension: 48,
        useNativeDriver: true,
      }),

      Animated.timing(vialY, {
        toValue: 0,
        duration: 900,
        delay: 1550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    /* --------------------------------------------------------
       VIAL FLOAT
    -------------------------------------------------------- */

    Animated.loop(
      Animated.sequence([
        Animated.timing(vialFloat, {
          toValue: 1,
          duration: 2100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(vialFloat, {
          toValue: 0,
          duration: 2100,
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
        delay: 1950,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.spring(scannerScale, {
        toValue: 1,
        delay: 1950,
        friction: 6,
        tension: 75,
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
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(scannerPulse, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    /* --------------------------------------------------------
       FLOATING CAPSULE 1
    -------------------------------------------------------- */

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingOne, {
          toValue: 1,
          duration: 2800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(floatingOne, {
          toValue: 0,
          duration: 2800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    /* --------------------------------------------------------
       FLOATING CAPSULE 2
    -------------------------------------------------------- */

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingTwo, {
          toValue: 1,
          duration: 3400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(floatingTwo, {
          toValue: 0,
          duration: 3400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    /* --------------------------------------------------------
       FLOATING CAPSULE 3
    -------------------------------------------------------- */

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingThree, {
          toValue: 1,
          duration: 3900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(floatingThree, {
          toValue: 0,
          duration: 3900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    /* --------------------------------------------------------
       RING ROTATION
    -------------------------------------------------------- */

    Animated.loop(
      Animated.timing(ringRotation, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    /* --------------------------------------------------------
       RING PULSE
    -------------------------------------------------------- */

    Animated.loop(
      Animated.sequence([
        Animated.timing(ringPulse, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(ringPulse, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    /* --------------------------------------------------------
       PROGRESS
    -------------------------------------------------------- */

    Animated.sequence([
      Animated.delay(1900),

      Animated.timing(progressOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),

      Animated.timing(progress, {
        toValue: 1,
        duration: 2200,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    /* --------------------------------------------------------
       AUTOMATIC LOGIN
    -------------------------------------------------------- */

    const timer = setTimeout(() => {

      Animated.parallel([
        Animated.timing(exitOpacity, {
          toValue: 1,
          duration: 550,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.timing(exitScale, {
          toValue: 1.08,
          duration: 650,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        router.replace('/auth/login');
      });

    }, 5400);

    return () => {
      clearTimeout(timer);
    };

  }, []);

  /* ==========================================================
     INTERPOLATIONS
  ========================================================== */

  const vialFloatY = vialFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const scannerScaleValue = scannerPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.09],
  });

  const scannerOpacityValue = scannerPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0.85],
  });

  const ringScale = ringPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.045],
  });

  const capsuleOneY = floatingOne.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const capsuleOneX = floatingOne.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 12],
  });

  const capsuleTwoY = floatingTwo.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 18],
  });

  const capsuleThreeY = floatingThree.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const rotation = ringRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <View style={styles.container}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.bg}
        translucent
      />

      {/* ======================================================
          SOFT BACKGROUND
      ====================================================== */}

      <Animated.View
        style={[
          styles.mainBackground,
          {
            opacity: screenOpacity,
            transform: [
              { scale: screenScale },
            ],
          },
        ]}
      />

      {/* Large ambient lights */}
      <View style={styles.lightOne} />
      <View style={styles.lightTwo} />
      <View style={styles.lightThree} />
      <View style={styles.lightFour} />

      {/* ======================================================
          BACKGROUND CAPSULES
      ====================================================== */}

      <Animated.View
        style={[
          styles.capsuleTopLeft,
          {
            transform: [
              { translateY: capsuleOneY },
              { translateX: capsuleOneX },
            ],
          },
        ]}
      >
        <Capsule rotate="-25deg" />
      </Animated.View>

      <Animated.View
        style={[
          styles.capsuleLeftMiddle,
          {
            transform: [
              { translateY: capsuleTwoY },
            ],
          },
        ]}
      >
        <Capsule
          rotate="48deg"
          small
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.capsuleBottomRight,
          {
            transform: [
              { translateY: capsuleThreeY },
            ],
          },
        ]}
      >
        <Capsule
          rotate="-25deg"
          small
        />
      </Animated.View>

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <View style={styles.content}>

        {/* ==================================================
            LOGO
        ================================================== */}

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

        {/* ==================================================
            BRAND
        ================================================== */}

        <Animated.View
          style={[
            styles.brandAnimated,
            {
              opacity: brandOpacity,
              transform: [
                { translateY: brandY },
              ],
            },
          ]}
        >
          <Text style={styles.brand}>
            MEDTRIX
          </Text>
        </Animated.View>

        {/* ==================================================
            TAGLINE
        ================================================== */}

        <Animated.View
          style={[
            styles.taglineAnimated,
            {
              opacity: taglineOpacity,
              transform: [
                { translateY: taglineY },
              ],
            },
          ]}
        >
          <Text style={styles.tagline}>
            Smarter Inventory.
          </Text>

          <Text style={styles.tagline}>
            Better Care.
          </Text>
        </Animated.View>

        {/* ==================================================
            MEDICINE VISUAL
        ================================================== */}

        <Animated.View
          style={[
            styles.visualAnimated,
            {
              opacity: vialOpacity,
              transform: [
                { translateY: vialY },
                { translateY: vialFloatY },
                { scale: vialScale },
              ],
            },
          ]}
        >

          {/* Rotating glass rings */}
          <Animated.View
            style={[
              styles.ringOuter,
              {
                transform: [
                  { rotate: rotation },
                  { scale: ringScale },
                ],
              },
            ]}
          >
            <View style={styles.ringSegmentTop} />
            <View style={styles.ringSegmentRight} />
            <View style={styles.ringSegmentBottom} />
            <View style={styles.ringSegmentLeft} />
          </Animated.View>

          {/* Inner scanning ring */}
          <Animated.View
            style={[
              styles.ringInner,
              {
                transform: [
                  { scale: ringScale },
                ],
              },
            ]}
          />

          {/* Vial */}
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
            <ScannerFrame />
          </Animated.View>

        </Animated.View>

        {/* ==================================================
            PROGRESS
        ================================================== */}

        <Animated.View
          style={[
            styles.progressContainer,
            {
              opacity: progressOpacity,
            },
          ]}
        >

          <View style={styles.progressTrack}>

            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />

          </View>

          <Text style={styles.progressText}>
            <Text style={styles.progressBlue}>
              Initializing
            </Text>

            {' Medtrix...'}
          </Text>

        </Animated.View>

      </View>

      {/* ======================================================
          EXIT TRANSITION
      ====================================================== */}

      <Animated.View
        pointerEvents="none"
        style={[
          styles.exitOverlay,
          {
            opacity: exitOpacity,
            transform: [
              { scale: exitScale },
            ],
          },
        ]}
      />



    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    overflow: 'hidden',
  },

  mainBackground: {
    ...(StyleSheet.absoluteFill as any),
    backgroundColor: COLORS.bg,
  },

  /* ============================================================
     AMBIENT LIGHT
  ============================================================ */

  lightOne: {
    position: 'absolute',
    width: width * 1.15,
    height: width * 1.15,
    borderRadius: width,
    backgroundColor: '#D7EDFC',
    top: -width * 0.62,
    left: -width * 0.28,
    opacity: 0.75,
  },

  lightTwo: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width,
    backgroundColor: '#FFFFFF',
    top: height * 0.20,
    right: -width * 0.35,
    opacity: 0.5,
  },

  lightThree: {
    position: 'absolute',
    width: width * 1.1,
    height: width * 1.1,
    borderRadius: width,
    backgroundColor: '#F9FDFF',
    bottom: -width * 0.3,
    left: -width * 0.1,
    opacity: 0.9,
  },

  lightFour: {
    position: 'absolute',
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width,
    backgroundColor: '#CFE8FC',
    top: height * 0.45,
    left: -width * 0.35,
    opacity: 0.35,
  },

  /* ============================================================
     CAPSULES
  ============================================================ */

  capsule: {
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.42)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.85)',

    shadowColor: '#8DBDE9',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 5,
  },

  capsuleHalfBlue: {
    backgroundColor: 'rgba(100,177,247,0.26)',
  },

  capsuleHalfWhite: {
    backgroundColor: 'rgba(255,255,255,0.72)',
  },

  capsuleHighlight: {
    position: 'absolute',
    left: '12%',
    top: 4,
    width: '60%',
    height: 3,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.68)',
  },

  capsuleTopLeft: {
    position: 'absolute',
    top: height * 0.13,
    left: -35,
    opacity: 0.62,
  },

  capsuleLeftMiddle: {
    position: 'absolute',
    top: height * 0.46,
    left: 18,
    opacity: 0.48,
  },

  capsuleBottomRight: {
    position: 'absolute',
    right: 28,
    bottom: height * 0.17,
    opacity: 0.32,
  },

  /* ============================================================
     MAIN CONTENT
  ============================================================ */

  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingTop: height * 0.095,
  },

  /* ============================================================
     LOGO
  ============================================================ */

  logoAnimated: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoWrapper: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoOuterGlass: {
    width: 86,
    height: 86,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.58)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#72B0E9',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 7,
  },

  logoBlueBox: {
    width: 70,
    height: 70,
    borderRadius: 21,
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: COLORS.blue,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.27,
    shadowRadius: 13,
    elevation: 7,
  },

  logoCheck: {
    position: 'absolute',
    right: 1,
    bottom: 2,

    width: 28,
    height: 28,
    borderRadius: 14,

    backgroundColor: COLORS.green,

    borderWidth: 2,
    borderColor: COLORS.bg,

    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ============================================================
     BRAND
  ============================================================ */

  brandAnimated: {
    marginTop: 10,
  },

  brand: {
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '800',
    letterSpacing: 1.8,
    color: COLORS.navyDark,
  },

  /* ============================================================
     CLINICAL BADGE
  ============================================================ */

  badgeAnimated: {
    marginTop: 7,
  },

  clinicalBadge: {
    paddingHorizontal: 17,
    paddingVertical: 5,

    borderRadius: 20,

    backgroundColor: 'rgba(255,255,255,0.38)',

    borderWidth: 1.5,
    borderColor: '#55A8FF',

    shadowColor: '#76B9F5',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },

  clinicalBadgeText: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.4,
    color: COLORS.blue,
  },

  /* ============================================================
     TAGLINE
  ============================================================ */

  taglineAnimated: {
    marginTop: 32,
    alignItems: 'center',
  },

  tagline: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '400',
    letterSpacing: 0.15,
    color: '#173765',
  },

  /* ============================================================
     SUBTITLE
  ============================================================ */

  subtitleAnimated: {
    marginTop: 18,
    alignItems: 'center',
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '400',
    textAlign: 'center',
    color: COLORS.textSoft,
  },

  /* ============================================================
     VISUAL
  ============================================================ */

  visualAnimated: {
    width: width * 0.83,
    height: height * 0.39,
    maxHeight: 350,

    marginTop: 5,

    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ============================================================
     OUTER RING
  ============================================================ */

  ringOuter: {
    position: 'absolute',

    width: width * 0.64,
    height: width * 0.64,

    maxWidth: 300,
    maxHeight: 300,

    borderRadius: 200,

    borderWidth: 1,
    borderColor: 'rgba(71,163,247,0.27)',
  },

  ringSegmentTop: {
    position: 'absolute',
    width: 70,
    height: 3,
    borderRadius: 3,
    backgroundColor: 'rgba(71,163,247,0.42)',
    top: -2,
    left: '38%',
  },

  ringSegmentRight: {
    position: 'absolute',
    width: 3,
    height: 65,
    borderRadius: 3,
    backgroundColor: 'rgba(71,163,247,0.25)',
    right: -2,
    top: '35%',
  },

  ringSegmentBottom: {
    position: 'absolute',
    width: 60,
    height: 3,
    borderRadius: 3,
    backgroundColor: 'rgba(71,163,247,0.30)',
    bottom: -2,
    left: '18%',
  },

  ringSegmentLeft: {
    position: 'absolute',
    width: 3,
    height: 45,
    borderRadius: 3,
    backgroundColor: 'rgba(71,163,247,0.22)',
    left: -2,
    top: '25%',
  },

  ringInner: {
    position: 'absolute',

    width: width * 0.51,
    height: width * 0.51,

    maxWidth: 235,
    maxHeight: 235,

    borderRadius: 150,

    borderWidth: 1,
    borderColor: 'rgba(71,163,247,0.20)',
  },

  /* ============================================================
     VIAL
  ============================================================ */

  vialContainer: {
    width: 235,
    height: 275,

    alignItems: 'center',
    justifyContent: 'center',
  },

  glassBaseOuter: {
    position: 'absolute',

    width: 225,
    height: 125,

    bottom: 17,

    borderRadius: 120,

    borderWidth: 1,
    borderColor: 'rgba(119,190,244,0.24)',

    backgroundColor: 'rgba(255,255,255,0.10)',

    alignItems: 'center',
    justifyContent: 'center',
  },

  glassBaseMiddle: {
    width: 190,
    height: 100,

    borderRadius: 100,

    borderWidth: 1,
    borderColor: 'rgba(119,190,244,0.25)',

    alignItems: 'center',
    justifyContent: 'center',
  },

  glassBaseInner: {
    width: 150,
    height: 72,

    borderRadius: 80,

    backgroundColor: 'rgba(117,190,244,0.10)',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.62)',
  },

  /* ============================================================
     VIAL BODY
  ============================================================ */

  vial: {
    position: 'absolute',

    width: 142,
    height: 235,

    top: 18,

    alignItems: 'center',
  },

  vialNeck: {
    position: 'absolute',

    top: 38,

    width: 75,
    height: 53,

    backgroundColor: 'rgba(225,246,255,0.48)',

    borderLeftWidth: 1,
    borderRightWidth: 1,

    borderColor: 'rgba(255,255,255,0.82)',

    overflow: 'hidden',
  },

  neckHighlight: {
    position: 'absolute',

    left: 8,
    top: 4,

    width: 8,
    height: 44,

    borderRadius: 10,

    backgroundColor: 'rgba(255,255,255,0.45)',
  },

  vialCap: {
    position: 'absolute',

    top: 14,

    width: 91,
    height: 39,

    borderRadius: 11,

    backgroundColor: '#438FEF',

    borderWidth: 1,
    borderColor: '#75B5F7',

    overflow: 'hidden',

    shadowColor: '#3989E7',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },

  capTop: {
    position: 'absolute',

    width: 72,
    height: 12,

    borderRadius: 50,

    top: -3,
    left: 10,

    backgroundColor: 'rgba(255,255,255,0.20)',
  },

  capHighlight: {
    position: 'absolute',

    width: 65,
    height: 6,

    borderRadius: 10,

    top: 6,
    left: 13,

    backgroundColor: 'rgba(255,255,255,0.30)',
  },

  vialBody: {
    position: 'absolute',

    top: 68,

    width: 125,
    height: 151,

    borderRadius: 23,

    backgroundColor: 'rgba(239,250,255,0.42)',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.86)',

    alignItems: 'center',
    justifyContent: 'center',

    overflow: 'hidden',

    shadowColor: '#75B7E9',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.14,
    shadowRadius: 13,
    elevation: 4,
  },

  vialLabel: {
    width: 99,
    height: 84,

    borderRadius: 12,

    backgroundColor: 'rgba(255,255,255,0.42)',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.62)',

    alignItems: 'center',
    justifyContent: 'center',
  },

  vialReflection: {
    position: 'absolute',

    width: 16,
    height: 125,

    left: 12,
    top: 5,

    borderRadius: 15,

    backgroundColor: 'rgba(255,255,255,0.39)',

    transform: [
      { rotate: '7deg' },
    ],
  },

  vialReflectionSmall: {
    position: 'absolute',

    width: 7,
    height: 78,

    right: 13,
    top: 21,

    borderRadius: 10,

    backgroundColor: 'rgba(255,255,255,0.24)',
  },

  vialLiquid: {
    position: 'absolute',

    bottom: -18,

    width: 120,
    height: 48,

    borderRadius: 60,

    backgroundColor: 'rgba(82,164,236,0.16)',
  },

  vialBottom: {
    position: 'absolute',

    bottom: 0,

    width: 126,
    height: 34,

    borderRadius: 70,

    backgroundColor: 'rgba(198,229,247,0.38)',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.78)',
  },

  /* ============================================================
     VIAL PILLS
  ============================================================ */

  vialPillRight: {
    position: 'absolute',

    right: -7,
    top: 96,

    opacity: 0.82,
  },

  vialPillLeft: {
    position: 'absolute',

    left: -2,
    bottom: 36,

    opacity: 0.72,
  },

  /* ============================================================
     SCANNER
  ============================================================ */

  scannerAnimated: {
    position: 'absolute',

    right: 0,
    top: 31,
  },

  scannerBox: {
    width: 74,
    height: 74,

    borderRadius: 13,

    backgroundColor: 'rgba(255,255,255,0.48)',

    borderWidth: 1.5,
    borderColor: 'rgba(73,166,250,0.48)',

    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#62A9E8',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },

  scanCorner: {
    position: 'absolute',

    width: 15,
    height: 15,

    borderColor: COLORS.blue,
  },

  scanTL: {
    left: 9,
    top: 9,

    borderLeftWidth: 2.5,
    borderTopWidth: 2.5,

    borderTopLeftRadius: 4,
  },

  scanTR: {
    right: 9,
    top: 9,

    borderRightWidth: 2.5,
    borderTopWidth: 2.5,

    borderTopRightRadius: 4,
  },

  scanBL: {
    left: 9,
    bottom: 9,

    borderLeftWidth: 2.5,
    borderBottomWidth: 2.5,

    borderBottomLeftRadius: 4,
  },

  scanBR: {
    right: 9,
    bottom: 9,

    borderRightWidth: 2.5,
    borderBottomWidth: 2.5,

    borderBottomRightRadius: 4,
  },

  /* ============================================================
     PROGRESS
  ============================================================ */

  progressContainer: {
    width: width * 0.61,
    maxWidth: 585,

    alignItems: 'center',

    marginTop: -3,
  },

  progressTrack: {
    width: '100%',
    height: 6,

    borderRadius: 6,

    backgroundColor: 'rgba(69,157,240,0.18)',

    overflow: 'hidden',
  },

  progressBar: {
    height: '100%',

    borderRadius: 6,

    backgroundColor: COLORS.blue,

    shadowColor: COLORS.blue,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.45,
    shadowRadius: 7,
    elevation: 4,
  },

  progressText: {
    marginTop: 12,

    fontFamily: 'monospace',

    fontSize: 11,

    letterSpacing: 0.35,

    color: '#6F88A7',
  },

  progressBlue: {
    color: COLORS.blue,
  },

  /* ============================================================
     EXIT
  ============================================================ */

  exitOverlay: {
    position: 'absolute',

    width: width * 1.7,
    height: width * 1.7,

    borderRadius: width,

    backgroundColor: COLORS.bgLight,

    top: '50%',
    left: '50%',

    marginLeft: -(width * 0.85),
    marginTop: -(width * 0.85),

    zIndex: 20,
  },

  /* ============================================================
     SKIP
  ============================================================ */

  skipButton: {
    position: 'absolute',

    right: 18,
    bottom: 18,

    paddingHorizontal: 10,
    paddingVertical: 7,

    borderRadius: 18,

    backgroundColor: 'rgba(255,255,255,0.42)',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',

    flexDirection: 'row',
    alignItems: 'center',

    zIndex: 50,
  },

  skipText: {
    fontSize: 10,
    fontWeight: '600',

    color: COLORS.textMuted,

    marginRight: 2,
  },
});