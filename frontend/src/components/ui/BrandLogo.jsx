export default function BrandLogo({
  size = 36,
  alt = 'Brand logo',
  className = '',
  style = {},
}) {
  return (
    <img
      src="/brand-logo.svg"
      alt={alt}
      width={size}
      height={size}
      className={className}
      style={{
        width: size,
        height: size,
        display: 'block',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}
