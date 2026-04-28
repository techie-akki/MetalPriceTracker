import React, {useEffect} from 'react';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface SparklineProps {
  color: string;
  data: number[];
}

export default function Sparkline({data, color}: SparklineProps) {
  const progress = useSharedValue(0);
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: (1 - progress.value) * 300,
  }));

  useEffect(() => {
    progress.value = withTiming(1, {duration: 800});
  }, [progress]);

  if (data.length < 2) {
    return null;
  }

  const max = Math.max(...data);
  const min = Math.min(...data);

  const width = 250;
  const height = 80;

  const stepX = width / (data.length - 1);

  const path = data
    .map((d, i) => {
      const x = i * stepX;
      const range = max - min || 1;
      const y = height - ((d - min) / range) * height;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <Svg width={width} height={height}>
      <AnimatedPath
        d={path}
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeDasharray="300"
        animatedProps={animatedProps}
      />
    </Svg>
  );
}
