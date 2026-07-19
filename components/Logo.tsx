// Shared brand mark. "horizontal" (badge beside wordmark) fits nav bars;
// "stacked" (full logo with wordmark) fits footers, auth screens, and
// anywhere with vertical room.
type LogoProps = {
  variant?: 'horizontal' | 'stacked';
  className?: string;
};

export default function Logo({ variant = 'horizontal', className = '' }: LogoProps) {
  if (variant === 'stacked') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/logo-full.png" alt="Sammy's Store" className={`h-auto w-48 ${className}`} />
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-mark.png" alt="Sammy's Store" className="h-9 w-9" />
      <span className="hidden sm:inline text-2xl font-bold">
        <span className="text-gray-800">SAMMY&apos;S</span>
        <span className="text-[#f97316]">STORE</span>
      </span>
    </div>
  );
}
