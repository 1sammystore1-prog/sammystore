const FEATURES = [
  '200+ countries supported',
  'Instant delivery',
  'Auto-refund on failure',
  'Fund via card or bank transfer',
  '24/7 WhatsApp support',
  'One wallet for everything',
];

export default function Ticker() {
  const items = [...FEATURES, ...FEATURES];

  return (
    <div className="bg-white border-b border-gray-200 py-2 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {items.map((item, idx) => (
          <span key={idx} className="text-gray-500 text-xs font-medium mx-6 flex items-center gap-2">
            <span className="text-[#f97316]">●</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
