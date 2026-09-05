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

## Adult anatomy studio iteration

`/research/anatomy` adds a neutral adult reference with physically based skin shading and four material tones. It includes an approximate static external genital envelope, selectable BodyParts3D reproductive tissues, a respiratory teaching sequence and a simplified systemic circulation overlay. The studio has front/back/side/pelvic/chest cameras, reference-opacity and label controls, pause/scrub/replay, keyboard-accessible structure selection, and a responsive phone layout.

The inherited photographic bake has visible projection seams; the clinical studio uses the existing skin normal texture with consistent material shading instead. The external genital envelope is a simplified reconstruction, not scanned genital skin. Skin materials share one geometry and imply no demographic differences in function. Facial movement, neural signaling, hormonal effects and subjective states are not simulated.

### Model boundaries

- Internal meshes and the adult surface are separate reference assets. A fixed depth offset approximates alignment; it is not validated image registration.
- Reproductive structures remain static. The external envelope uses a static curved surface and approximate scrotal contour; fine folds, urethral lumen and foreskin variation are not resolved.
- Breathing uses a periodic illustrative excursion, approximate chest deformation and diaphragm translation. Airway geometry remains static. Values are not lung volumes, oxygen saturation, or diagnostic measurements.
- Circulation uses a schematic systemic path and moving markers. It omits pulmonary circulation and local genital hemodynamics. Marker speed does not represent measured blood velocity.
- Playback is opt-in and stops after eight seconds. Pausing and scrubbing share the same clock used by the model. Static scenes render on demand.
- GLTF scenes and materials are cloned for the clinical viewer; cached reference geometry is not modified. Internal assets load only when their mode is selected. Graphics failure leaves explanatory content accessible.

### Verification

Run `node --test scripts/test-clinical-anatomy.mjs` with Node 24+ to verify selectable structure IDs and animated objects against the shipped GLB files. This checks asset integration, not anatomical accuracy. Also run scoped ESLint and the production build. Browser verification covers mode switching, skin presets, tissue selection, timeline playback/end/replay/scrub, reset, and phone-width layout.

Clinical reading: [NCI SEER male reproductive anatomy](https://training.seer.cancer.gov/anatomy/reproductive/male/) and [NHLBI breathing mechanics](https://www.nhlbi.nih.gov/health/lungs/body-controls-breathing). Independent anatomical review is required before any clinical use.
