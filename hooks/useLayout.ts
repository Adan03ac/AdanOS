import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
export function useLayout() {
  const [size, setSize] = useState({ width: 375, height: 667 });
  useEffect(() => { const update = () => { const d = Dimensions.get('window'); setSize({ width: Math.max(320, d.width || 375), height: Math.max(1, d.height || 667) }); }; update(); const sub = Dimensions.addEventListener('change', update); return () => sub.remove(); }, []);
  return { ...size, wide: size.width >= 768, desktop: size.width >= 1024 };
}
