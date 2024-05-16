import hexRgb from 'hex-rgb';

export const rgba = (hex: string, alpha: number) => {
  const rgb = hexRgb(hex, { format: 'array' }).slice(0, -1).join(',');
  return `rgba(${rgb},${alpha})`;
};
