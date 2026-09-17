const cases = [
  {
    emoji: "🔧",
    title: "Plumbers & contractors",
    body: "Answer warranty questions, retrieve pricing sheets, and draft on-site quotes from your service manual.",
  },
  {
    emoji: "🩺",
    title: "Clinics & practices",
    body: "Ground patient FAQ replies in your own protocols. Every answer cites the policy it came from.",
  },
  {
    emoji: "💇",
    title: "Salons & studios",
    body: "Train new staff on your booking policies, pricing, and aftercare without chasing the manager.",
  },
  {
    emoji: "📋",
    title: "Legal & accounting",
    body: "Query contracts, tax guides, and internal memos. Full audit trail for compliance.",
  },
  {
    emoji: "🏗️",
    title: "Construction & trades",
    body: "Field teams get spec sheets and safety codes on their phones — even with poor connectivity.",
  },
  {
    emoji: "🏢",
    title: "Internal helpdesks",
    body: "Onboard new hires faster. Policies, SOPs, and HR manuals — searchable with citations.",
  },
];

export default function UseCases() {
  return (
    <section id="usecases" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-indigo-300">
            Who it's for
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Built for small teams that wear many hats
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            If you've ever wished you could ask your own documents a question, this is for you.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => (
            <div
              key={c.title}
              className="rounded-[24px] border border-white/10 bg-slate-900/45 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.32)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-indigo-400/40 hover:bg-slate-900/65"
            >
              <div className="mb-3 text-3xl">{c.emoji}</div>
              <h3 className="mb-2 font-semibold text-white">{c.title}</h3>
              <p className="text-[15px] leading-relaxed text-slate-300">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}