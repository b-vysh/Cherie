interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-brand-primary/10 rounded-[10px] ${className}`} />
  );
}
