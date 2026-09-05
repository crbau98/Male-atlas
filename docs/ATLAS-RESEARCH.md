# Project ATLAS: clinical research iteration

This document reconstructs the direction from the supplied conversation summary. It is not the missing original commit 5bbafe6.

## Implemented

The `/research` route offers a dimensionless compartment model, separate outcome-domain selection, a sourced evidence library with investigational filtering, and a downloadable JSON study brief. It requires no account, API key, or participant data. The original atlas is not used to generate clinical predictions.

## Scientific limits

The analytic model solves dx/dt = a(1-x) - bx with x(0)=0 and positive constant coefficients. It illustrates only inflow/outflow balance. It is not fitted to human measurements and has no validated mapping to penile hemodynamics, orgasm, ejaculation, desire, emotion, or medication response. No error bands are shown because no empirical error distribution is known.

## Next research milestones

1. Anatomy: have an anatomist audit labels, tissue boundaries, provenance and variation before adding clinical cross-sections. Separate geometry accuracy from physiological accuracy.
2. Physiology: specify independently testable vascular, neural and endocrine modules. Validate each against suitable published measurements before coupling modules; publish uncertainty and failure cases.
3. Outcomes: distinguish desire, erection, orgasm, ejaculation, distress and satisfaction. Use validated measures with licensing checked. Subjective outcomes require participant reports; do not infer them from facial expressions or genital appearance.
4. Evidence: add a reproducible search protocol, eligibility criteria, duplicate screening, risk-of-bias appraisal, adverse-event extraction and source versioning. Separate therapeutic benefit in diagnosed conditions from enhancement claims in healthy populations.
5. Compounds and regenerative interventions: maintain evidence maps of mechanisms, trial phase, comparator, endpoints and unresolved harms. Do not turn preclinical hypotheses into doses, combinations or predicted personal benefit. PRP for ED belongs in clinical trials under current EAU guidance.
6. Participant research: require ethics review, adult informed consent, independent clinical oversight and a statistical analysis plan before enrollment. Define recruitment, minimization, encryption, deletion, access auditing and withdrawal handling before collecting intimate information.

## Twelve-week validation plan

- Weeks 1–3: clinical and participant advisory review; outcome definitions and data provenance specification.
- Weeks 4–6: source-screening workflow and educational model usability evaluation; no efficacy claims.
- Weeks 7–9: retrospective benchmark design using appropriately licensed data, with held-out evaluation and explicit uncertainty.
- Weeks 10–12: independent review and go/no-go decision. Participant studies remain gated on ethics, privacy and clinical readiness.

Success requires reproducibility, correct evidence interpretation and usable uncertainty communication. A visually convincing model is not evidence of predictive validity.

## Sources reviewed September 5, 2026

- NIDDK, Treatment for Erectile Dysfunction: https://www.niddk.nih.gov/health-information/urologic-diseases/erectile-dysfunction/treatment
- EAU, Management of Erectile Dysfunction: https://uroweb.org/guidelines/sexual-and-reproductive-health/chapter/management-of-erectile-dysfunction

These summaries are not a systematic review. Recheck recommendations before any clinical use.
