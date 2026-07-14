// NOTE: these are placeholder quotes so the section isn't empty while you
// collect real reviews. Swap them for actual customer feedback (screenshots,
// WhatsApp messages, etc.) as soon as you have some - never leave fabricated
// quotes live on a production site.
const TESTIMONIALS = [
  {
    name: 'Chidi A.',
    role: 'SMM customer',
    quote: 'Funded my wallet and had my Instagram order running within a couple of minutes. No stress.',
  },
  {
    name: 'Fatima O.',
    role: 'Virtual numbers customer',
    quote: 'Needed a number for WhatsApp verification and it arrived instantly. Refund was automatic when one didn\u2019t work.',
  },
  {
    name: 'Emeka N.',
    role: 'Accounts customer',
    quote: 'Straightforward checkout and the account details were delivered right away with clear setup instructions.',
  },
];

export default function Testimonials() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {TESTIMONIALS.map((t, idx) => (
        <div key={idx} className="card p-6">
          <p className="text-gray-700 text-sm mb-4">&ldquo;{t.quote}&rdquo;</p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#fb923c] to-[#ea580c] flex items-center justify-center text-white font-bold text-sm">
              {t.name.charAt(0)}
            </div>
            <div>
              <p className="text-gray-800 font-semibold text-sm">{t.name}</p>
              <p className="text-gray-500 text-xs">{t.role}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
