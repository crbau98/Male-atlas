"use client";

import { useState } from "react";

const sources = {
  niddk: "https://www.niddk.nih.gov/health-information/urologic-diseases/erectile-dysfunction/treatment",
  eau: "https://uroweb.org/guidelines/sexual-and-reproductive-health/chapter/management-of-erectile-dysfunction",
};
const evidence = [
  { name: "PDE5 inhibitors", status: "Clinical option", question: "Which patients benefit, and which outcomes improve?", finding: "A prescription treatment for ED that supports penile blood flow. Effects on other outcome domains cannot be assumed.", source: sources.niddk },
  { name: "Counseling and lifestyle", status: "Clinical option", question: "How do psychological and physical contributors interact?", finding: "Care may address emotional factors and modifiable health habits alongside underlying causes.", source: sources.niddk },
  { name: "Testosterone", status: "Selected patients", question: "Was low testosterone established before treatment?", finding: "May be considered in patients with ED and low testosterone. This is not a general enhancement intervention.", source: sources.niddk },
  { name: "Platelet-rich plasma", status: "Investigational", question: "Are findings reproducible in larger controlled trials?", finding: "Evidence remains insufficient for routine clinical use; EAU guidance restricts use for ED to clinical trials.", source: sources.eau },
  { name: "Stem-cell approaches", status: "Investigational", question: "How do heterogeneous protocols affect interpretation?", finding: "Regenerative treatment remains under investigation. Early studies do not establish general enhancement benefits or long-term safety.", source: sources.eau },
];
const domains = ["Desire", "Erectile function", "Orgasm experience", "Ejaculatory function", "Emotional wellbeing"];
const panel = "rounded-2xl border border-white/15 bg-white/[0.035] p-6";
const button = "rounded-lg border border-white/30 px-4 py-2 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-teal-300";

export default function ResearchLab() {
  const [inflow, setInflow] = useState(50);
  const [outflow, setOutflow] = useState(50);
  const [filter, setFilter] = useState("All");
  const [domain, setDomain] = useState(domains[1]);
  const [notice, setNotice] = useState("");
  // Deliberately dimensionless teaching equation, not fitted to clinical data.
  const equilibrium = inflow / (inflow + outflow);
  const points = Array.from({ length: 61 }, (_, t) => {
    const value = equilibrium * (1 - Math.exp(-(inflow + outflow) / 100 * t / 10));
    return `${30 + t * 8},${180 - value * 150}`;
  }).join(" ");
  function reset() { setInflow(50); setOutflow(50); setFilter("All"); setDomain(domains[1]); setNotice("Workspace reset."); }
  function exportBrief() {
    const brief = { version: 1, createdAt: new Date().toISOString(), purpose: "Research planning only", outcome: domain,
      hypothesis: `Pre-register a clinically meaningful change in ${domain.toLowerCase()} as a distinct outcome.`,
      design: "Define population, comparator, validated measure, follow-up, confounders, harms, missing-data handling and independent review before recruitment.",
      simulation: { type: "Unvalidated dimensionless teaching model", inflow, outflow, equation: "dx/dt = inflow/100 * (1-x) - outflow/100 * x; x(0)=0", limitation: "No mapping to a person, drug, erection score, orgasm, or emotional state." },
      evidenceReviewed: "2026-09-05", evidence };
    const url = URL.createObjectURL(new Blob([JSON.stringify(brief, null, 2)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = "atlas-research-brief.json"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); setNotice("Research brief exported.");
  }
  return <main className="mx-auto max-w-6xl space-y-8 px-5 py-10 text-slate-100">
    <header className="space-y-4">
      <p className="text-sm tracking-[0.25em] text-teal-300">ATLAS / RESEARCH WORKSPACE</p>
      <h1 className="text-4xl font-semibold md:text-6xl">Explore mechanisms.<br />Interrogate the evidence.</h1>
      <p className="max-w-2xl text-lg text-slate-300">Adult sexual-health education and study planning. A physiological animation cannot establish how a person feels or predict treatment response.</p>
      <p className="text-sm text-amber-200">Prototype · synthetic model · no clinical validation · evidence reviewed September 5, 2026</p>
    </header>
    <section className="grid gap-5 md:grid-cols-2" aria-label="Mechanism explorer">
      <div className={panel}>
        <h2 className="mb-3 text-2xl font-medium">A vascular teaching model</h2>
        <p className="mb-6 text-slate-300">Explore how inflow and outflow change filling in an abstract compartment. Parameters are arbitrary; the curve is not a simulation of complete sexual response.</p>
        {([{ label: "Inflow coefficient", value: inflow, set: setInflow }, { label: "Outflow coefficient", value: outflow, set: setOutflow }]).map(control => <label key={control.label} className="mb-6 block">{control.label}: {control.value} arbitrary units<input className="mt-3 accent-teal-300" type="range" min="1" max="100" value={control.value} onChange={e => control.set(Number(e.target.value))} /></label>)}
        <p className="text-sm text-slate-400">Assumptions: one compartment, constant coefficients, initial filling zero. No neural, hormonal, tissue-pressure, drug or psychological model.</p>
      </div>
      <div className={panel}>
        <h2 className="text-2xl font-medium">Synthetic filling trajectory</h2>
        <svg viewBox="0 0 540 220" role="img" aria-label={`Abstract compartment filling approaches ${Math.round(equilibrium * 100)} percent. Arbitrary time units.`} className="my-5 w-full">
          <path d="M30 25V180H520" fill="none" stroke="#94a3b8" />
          <line x1="30" y1="30" x2="520" y2="30" stroke="#334155" strokeDasharray="4 6" />
          <polyline points={points} fill="none" stroke="#5eead4" strokeWidth="3" />
          <text x="5" y="32" fill="#cbd5e1" fontSize="12">1</text><text x="5" y="180" fill="#cbd5e1" fontSize="12">0</text>
          <text x="170" y="210" fill="#cbd5e1" fontSize="12">Time (arbitrary units)</text>
        </svg>
        <p>Model equilibrium: <strong className="text-teal-300">{equilibrium.toFixed(2)}</strong> (dimensionless)</p>
        <p className="mt-3 text-sm text-slate-400">dx/dt = a(1 − x) − bx. This output does not measure erection quality or treatment efficacy.</p>
      </div>
    </section>
    <section className={panel}>
      <h2 className="text-2xl font-medium">Define the question before the experiment</h2>
      <label className="mt-5 block">Primary outcome domain<select value={domain} onChange={e => setDomain(e.target.value)} className="mt-2 block w-full rounded-lg border border-white/30 bg-slate-900 p-3">{domains.map(d => <option key={d}>{d}</option>)}</select></label>
      <p className="mt-4 text-slate-300">Selected: {domain}. Specify a validated measure, population, comparator, follow-up period and meaningful change threshold. Analyze the other domains separately; never infer emotion or subjective experience from anatomy.</p>
      <div className="mt-5 flex flex-wrap gap-3"><button className={button} onClick={exportBrief}>Export research brief</button><button className={button} onClick={reset}>Reset workspace</button></div>
      <p className="mt-3 text-sm text-slate-400">Controls stay in memory. This workspace collects no personal health information.</p>
      <p role="status" className="mt-2 text-sm text-teal-300">{notice}</p>
    </section>
    <section aria-labelledby="evidence-heading">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4"><h2 id="evidence-heading" className="text-3xl font-medium">Evidence, with limits attached</h2><label>Filter <select className="rounded-lg border border-white/30 bg-slate-900 p-2" value={filter} onChange={e => setFilter(e.target.value)}>{["All", "Clinical option", "Selected patients", "Investigational"].map(f => <option key={f}>{f}</option>)}</select></label></div>
      <div className="grid gap-4 md:grid-cols-2">{evidence.filter(e => filter === "All" || e.status === filter).map(e => <article className={panel} key={e.name}>
        <p className="text-sm text-teal-300">{e.status}</p><h3 className="my-2 text-xl font-medium">{e.name}</h3><p className="text-slate-300">{e.finding}</p><p className="mt-4 text-sm">Research question: {e.question}</p><a className="mt-4 inline-block text-teal-300 underline" href={e.source} target="_blank" rel="noreferrer">Read source ↗</a>
      </article>)}</div>
      <p className="mt-5 text-sm text-slate-400">Curated summaries, not a systematic review or individualized recommendations. No compound combinations, doses, or predicted enhancement scores.</p>
    </section>
  </main>;
}
