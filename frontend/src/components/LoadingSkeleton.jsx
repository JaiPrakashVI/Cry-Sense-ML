export default function LoadingSkeleton({ variant = 'text', width, height, count = 1 }) {
  const style = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  const className = `skeleton skeleton-${variant}`;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={className} style={style} />
      ))}
    </>
  );
}
