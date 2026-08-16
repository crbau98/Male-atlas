/** Short original summaries for high-value structures. Others use generated copy from the name. */

const DESCRIPTIONS: Record<string, string> = {
  skin: "Continuous cutaneous envelope of the volunteer. Click or raise dissection to open a living window into the named meshes beneath.",
  brain: "Encephalon within the cranial cavity: cerebrum, cerebellum, and brainstem, with ventricles and Circle of Willis branches nearby.",
  "left cerebral hemisphere": "Left telencephalon, dominant for language in most people, including lateral gyri and underlying white matter.",
  "right cerebral hemisphere": "Right telencephalon, strongly involved in visuospatial and attentional networks, mirrored to the left hemisphere.",
  "left hippocampus": "Medial temporal formation for episodic memory and spatial mapping, along the temporal horn of the left ventricle.",
  "right hippocampus": "Medial temporal formation for episodic memory and spatial mapping, along the temporal horn of the right ventricle.",
  hypothalamus: "Ventral diencephalon controlling autonomic, endocrine, and circadian set-points, sitting above the pituitary stalk.",
  thalamus: "Paired diencephalic relay that gates almost all sensory traffic to cortex except olfaction.",
  cerebellum: "Posterior fossa coordinator of timing, gait, and learned motor sequences, folded into folia over the fourth ventricle.",
  brainstem: "Midbrain, pons, and medulla — the compact highway of cranial-nerve nuclei and descending motor tracts.",
  midbrain: "Mesencephalon containing the cerebral aqueduct, superior/inferior colliculi, and substantia nigra region.",
  heart: "Four-chamber pump in the middle mediastinum, with coronary arteries arising from the aortic root.",
  aorta: "Systemic outflow trunk from the aortic valve through arch and descending segments to the iliac bifurcation.",
  liver: "Right-upper-quadrant metabolic organ with portal inflow, hepatic veins, and biliary tree.",
  lung: "Paired respiratory organs filling the pleural cavities around the heart.",
  "left lung": "Two-lobed lung with a cardiac notch, occupying the left pleural cavity.",
  "right lung": "Three-lobed lung occupying the right pleural cavity.",
  stomach: "Intraperitoneal J-shaped reservoir between esophagus and duodenum.",
  pancreas: "Retroperitoneal exocrine/endocrine gland crossing the midline posterior to the stomach.",
  spleen: "Left-upper-quadrant lymphoid filter under the diaphragm.",
  kidney: "Paired retroperitoneal filters that set blood volume and composition.",
  "left kidney": "Left retroperitoneal filter, slightly higher than the right, with its own artery, vein, and ureter.",
  "right kidney": "Right retroperitoneal filter, slightly lower because of the liver, with its own artery, vein, and ureter.",
  "urinary bladder": "Pelvic reservoir for urine, sitting behind the pubic symphysis.",
  prostate: "Walnut-sized gland wrapping the proximal male urethra, inferior to the bladder.",
  testis: "Paired gonads in the scrotum producing sperm and testosterone.",
  "left testis": "Left gonad in the scrotum; venous drainage typically via the left renal vein.",
  "right testis": "Right gonad in the scrotum; venous drainage typically into the inferior vena cava.",
  "glans penis": "Distal erectile cap of the penis, with a mucosal sheen and the urethral meatus at its tip.",
  "corpus cavernosum of penis": "Paired erectile cylinders forming the bulk of the penile shaft, deep to skin and fascia.",
  "corpus spongiosum of penis": "Midline erectile tissue that surrounds the urethra and expands as the glans.",
  scrotum: "Cutaneous sac holding the testes, with a midline raphe and dartos muscle in its wall.",
  "left epididymis": "Comma-shaped duct on the left testis where sperm mature.",
  "right epididymis": "Comma-shaped duct on the right testis where sperm mature.",
  urethra: "Outlet tube from bladder through the prostate and penis in the male.",
  "cerebral arterial circle": "Circle of Willis — anastomotic ring of anterior and posterior cerebral arteries at the base of the brain.",
  "spinal cord": "Central nervous column inside the vertebral canal, giving off paired spinal nerves.",
  diaphragm: "Dome-shaped skeletal muscle that separates thorax from abdomen and drives quiet breathing.",
  trachea: "Cartilaginous airway from the larynx to the main bronchi.",
  esophagus: "Muscular tube posterior to the trachea, carrying food to the stomach.",
  thyroid: "Endocrine gland on the anterior trachea that sets basal metabolic rate.",
};

export function describePart(name: string, system: string, fmaId: string): string {
  const key = name.toLowerCase();
  if (DESCRIPTIONS[key]) return DESCRIPTIONS[key];
  for (const [k, v] of Object.entries(DESCRIPTIONS)) {
    if (key.includes(k)) return v;
  }
  return `${capitalize(name)} is a BodyParts3D element in the ${system} system (ontology ${fmaId}). Select it to isolate the mesh, clip through it, or explode neighboring parts.`;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
