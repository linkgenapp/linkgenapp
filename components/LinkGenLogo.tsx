import React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';

const LOGO_NO_BG = require('../assets/branding/nobg-linkgen.png');

const screenW = Dimensions.get('window').width;

type Props = {
  /** Header bar: compact wide logo, no background (transparent PNG). */
  variant?: 'hero' | 'header';
};

/**
 * Uses `nobg-linkgen.png` only — no white plates; transparency shows the app background through.
 */
export function LinkGenLogo({ variant = 'hero' }: Props) {
  if (variant === 'header') {
    return (
      <View style={styles.headerWrap}>
        <Image
          source={LOGO_NO_BG}
          style={styles.headerImage}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel="LinkGen"
        />
      </View>
    );
  }

  return (
    <View style={styles.heroWrap}>
      <Image
        source={LOGO_NO_BG}
        style={styles.heroImage}
        resizeMode="contain"
        accessibilityRole="image"
        accessibilityLabel="LinkGen"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    alignSelf: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: screenW,
    marginBottom: 6,
  },
  heroImage: {
    width: screenW * 0.88,
    height: 128,
    alignSelf: 'center',
  },
  headerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerImage: {
    width: Math.min(screenW * 0.5, 200),
    height: 36,
  },
});
