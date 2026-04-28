import React from 'react';
import {StyleSheet, View} from 'react-native';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

interface SkeletonTileProps {
  accent?: string;
}

export default function SkeletonTile({accent = '#D6B86B'}: SkeletonTileProps) {
  return (
    <View style={styles.container}>
      <ShimmerPlaceHolder
        LinearGradient={LinearGradient}
        shimmerColors={[
          'rgba(255,255,255,0.08)',
          accent,
          'rgba(255,255,255,0.08)',
        ]}
        style={styles.tile}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  tile: {
    borderRadius: 28,
    height: 198,
  },
});
