"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Component,
  useCallback,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  CYCLE_SECONDS,
  MODES,
  SKINS,
  STRUCTURES,
  VIEWS,
  breathExcursion,
  type CameraView,
  type StudyMode,
} from "./anatomy-data";
import styles from "./anatomy.module.css";

const AnatomyCanvas = dynamic(() => import("./anatomy-canvas"), {
  ssr: false,
  loading: () => (
    <p className={styles.loading}>Preparing the anatomy viewer…</p>
  ),
});
class ViewerBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className={styles.loading} role="alert">
        <p>
          The 3D viewer could not load. The structure descriptions remain
          available.
        </p>
        <button onClick={() => window.location.reload()}>Reload viewer</button>
      </div>
    ) : (
      this.props.children
    );
  }
}

export default function AnatomyStudy() {
  const [mode, setMode] = useState<StudyMode>("surface");
  const [view, setView] = useState<CameraView>("anterior");
  const [cameraRevision, setCameraRevision] = useState(0);
  const [skin, setSkin] = useState(1);
  const [selected, setSelected] = useState("FJ3134");
  const [opacity, setOpacity] = useState(0.12);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [breaths, setBreaths] = useState(15);
  const [pulse, setPulse] = useState(72);
  const [labels, setLabels] = useState(true);
  const [contextLost, setContextLost] = useState(false);
  const clockRef = useRef(0);
  const handleContextLost = useCallback(() => {
    setContextLost(true);
    setPlaying(false);
  }, []);
  const updateTime = useCallback((next: number) => {
    setTime(next);
    if (next >= CYCLE_SECONDS) setPlaying(false);
  }, []);
  const active = MODES.find((m) => m.id === mode)!;
  const structure = STRUCTURES.find((s) => s.id === selected)!;
  const dynamicMode = mode === "breathing" || mode === "circulation";
  const excursion = breathExcursion(time, breaths);
  function chooseView(next: CameraView) {
    setView(next);
    setCameraRevision((n) => n + 1);
  }
  function chooseMode(next: StudyMode) {
    setMode(next);
    setPlaying(false);
    clockRef.current = 0;
    setTime(0);
    chooseView(
      next === "tissues"
        ? "pelvis"
        : next === "breathing"
          ? "thorax"
          : "anterior",
    );
  }
  function reset() {
    chooseMode("surface");
    setSkin(1);
    setSelected("FJ3134");
    setOpacity(0.12);
    setLabels(true);
    setBreaths(15);
    setPulse(72);
  }
  return (
    <main className={styles.study}>
      <header className={styles.header}>
        <Link href="/research" className={styles.back}>
          ← Research workspace
        </Link>
        <div className={styles.titleRow}>
          <div>
            <p className={styles.eyebrow}>ATLAS / ANATOMY STUDIO</p>
            <h1>
              The human form,
              <br />
              <span>layer by layer.</span>
            </h1>
          </div>
          <p className={styles.intro}>
            An adult anatomical reference with selectable reproductive
            structures and illustrative motion. Explore form, then examine
            function.
          </p>
        </div>
        <div className={styles.badges}>
          <span>Adult clinical anatomy</span>
          <span>Reference geometry</span>
          <span>Illustrative physiology</span>
        </div>
      </header>
      <div className={styles.modeBar} aria-label="Study mode">
        {MODES.map((m) => (
          <button
            key={m.id}
            aria-pressed={mode === m.id}
            onClick={() => chooseMode(m.id)}
          >
            {m.title}
          </button>
        ))}
      </div>
      <section
        className={styles.workspace}
        aria-label="Interactive anatomy workspace"
      >
        <div className={styles.viewerColumn}>
          <div className={styles.viewer}>
            <div className={styles.viewerTitle}>
              <span>{active.title}</span>
              <span>01 / ADULT REFERENCE</span>
            </div>
            <ViewerBoundary>
              <AnatomyCanvas
                mode={mode}
                skin={skin}
                selected={selected}
                onSelect={setSelected}
                opacity={opacity}
                labels={labels}
                view={view}
                cameraRevision={cameraRevision}
                playing={playing && !contextLost}
                clockRef={clockRef}
                time={time}
                onTime={updateTime}
                breaths={breaths}
                pulse={pulse}
                onContextLost={handleContextLost}
              />
            </ViewerBoundary>
            {contextLost ? (
              <div className={styles.loading} role="alert">
                The graphics context was interrupted.{" "}
                <button onClick={() => window.location.reload()}>
                  Reload viewer
                </button>
              </div>
            ) : null}
            <div className={styles.viewerHint}>
              Drag to rotate · scroll or pinch to zoom · choose a structure to
              inspect
            </div>
          </div>
          <div className={styles.cameraBar} aria-label="Camera presets">
            {VIEWS.map((v) => (
              <button key={v.id} onClick={() => chooseView(v.id)}>
                {v.title}
              </button>
            ))}
            <button onClick={() => chooseView(view)}>Reset camera</button>
          </div>
          <div className={styles.timeline}>
            <div className={styles.timelineTitle}>
              <strong>
                {dynamicMode
                  ? "Physiology timeline"
                  : "Static anatomical reference"}
              </strong>
              <span>
                {dynamicMode
                  ? `${time.toFixed(1)} / ${CYCLE_SECONDS}.0 s`
                  : "At rest"}
              </span>
            </div>
            <div className={styles.transport}>
              <button
                disabled={!dynamicMode || contextLost}
                onClick={() => {
                  if (clockRef.current >= CYCLE_SECONDS) {
                    clockRef.current = 0;
                    setTime(0);
                  }
                  setPlaying((p) => !p);
                }}
              >
                {playing ? "Pause" : "Play"}
              </button>
              <label className={styles.scrubber}>
                Time in seconds
                <input
                  aria-label="Timeline in seconds"
                  type="range"
                  min="0"
                  max={CYCLE_SECONDS}
                  step="0.05"
                  disabled={!dynamicMode}
                  value={time}
                  onChange={(e) => {
                    setPlaying(false);
                    clockRef.current = Number(e.target.value);
                    setTime(clockRef.current);
                  }}
                />
              </label>
            </div>
            <p>
              {dynamicMode
                ? "Motion starts only when you press Play. Scrubbing pauses the animation. The eight-second teaching sequence stops at its end."
                : "Choose Respiratory motion or Circulation schematic to explore an animated teaching sequence."}
            </p>
          </div>
        </div>
        <aside className={styles.inspector}>
          <p className={styles.eyebrow}>STUDY CONTROLS</p>
          <h2>{active.title}</h2>
          <p>{active.description}</p>
          <div className={styles.controlGroup}>
            <h3>Skin material</h3>
            <div className={styles.swatches}>
              {SKINS.map((s, i) => (
                <button
                  key={s.name}
                  aria-label={`${s.name} skin material`}
                  aria-pressed={skin === i}
                  onClick={() => setSkin(i)}
                >
                  <i style={{ background: s.color }} />
                  <span>{s.name}</span>
                </button>
              ))}
            </div>
            <p className={styles.small}>
              One adult geometry; four material tones. These are not
              population-specific anatomical models.
            </p>
          </div>
          {mode !== "surface" ? (
            <label className={styles.controlGroup}>
              Body reference opacity · {Math.round(opacity * 100)}%
              <input
                type="range"
                min="0"
                max="0.4"
                step="0.01"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
              />
            </label>
          ) : null}
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={labels}
              onChange={(e) => setLabels(e.target.checked)}
            />
            Show anatomical landmarks
          </label>
          {mode === "tissues" ? (
            <div className={styles.controlGroup}>
              <label htmlFor="structure">Reproductive structure</label>
              <select
                id="structure"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
              >
                {STRUCTURES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <div className={styles.selection} aria-live="polite">
                <span style={{ color: structure.color }}>
                  ● SELECTED STRUCTURE
                </span>
                <h3>{structure.name}</h3>
                <p>{structure.description}</p>
                <small>BodyParts3D · {structure.id}</small>
              </div>
            </div>
          ) : null}
          {mode === "breathing" ? (
            <div className={styles.controlGroup}>
              <label>
                Illustrative breathing rate · {breaths}/min
                <input
                  type="range"
                  min="10"
                  max="24"
                  step="1"
                  value={breaths}
                  onChange={(e) => setBreaths(Number(e.target.value))}
                />
              </label>
              <div className={styles.metric}>
                <span>{Math.round(excursion * 100)}%</span>
                <p>
                  Animation excursion
                  <br />
                  Not lung volume or oxygen saturation
                </p>
              </div>
              <p className={styles.small}>
                The diaphragm lowers during inspiration. The airway geometry
                itself remains static; chest motion uses an approximate
                deformation.
              </p>
            </div>
          ) : null}
          {mode === "circulation" ? (
            <div className={styles.controlGroup}>
              <label>
                Illustrative pulse rate · {pulse}/min
                <input
                  type="range"
                  min="50"
                  max="110"
                  step="1"
                  value={pulse}
                  onChange={(e) => setPulse(Number(e.target.value))}
                />
              </label>
              <div className={styles.legend}>
                <span>
                  <i style={{ background: "#e39b8c" }} />
                  Outward systemic flow
                </span>
                <span>
                  <i style={{ background: "#82b7df" }} />
                  Return systemic flow
                </span>
              </div>
              <p className={styles.small}>
                Color and marker speed communicate direction and rhythm only.
                Pulmonary circulation and local genital hemodynamics are not
                modeled.
              </p>
            </div>
          ) : null}
          {mode === "surface" ? (
            <div className={styles.selection}>
              <span>EXTERNAL ANATOMY</span>
              <h3>Adult anatomy at rest</h3>
              <p>
                The reference includes an approximate external penis and scrotal
                envelope. Use the tissue view to inspect the glans, erectile
                tissues, testes, epididymides and prostate individually.
              </p>
            </div>
          ) : null}
          <button className={styles.reset} onClick={reset}>
            Reset study
          </button>
        </aside>
      </section>
      <section
        className={styles.notes}
        aria-label="Scientific scope and sources"
      >
        <article>
          <p className={styles.eyebrow}>READ THE MODEL CORRECTLY</p>
          <h2>A reference, not a prediction.</h2>
          <p>
            The external genital envelope is a simplified surface
            reconstruction. The body and segmented internal tissues come from
            different reference assets. Their alignment is approximate. Fine
            anatomy, individual variation, neural signaling, hormonal effects
            and subjective experience are not fully represented. This is not a
            diagnostic or treatment simulator.
          </p>
        </article>
        <article>
          <h3>Provenance & reading</h3>
          <ul>
            <li>
              Adult surface: Blender Studio Human Base Meshes (CC0); atlas skin
              microtexture with physically based shading.
            </li>
            <li>
              Internal meshes: BodyParts3D, © The Database Center for Life
              Science, CC BY 4.0.
            </li>
            <li>
              <a
                href="https://training.seer.cancer.gov/anatomy/reproductive/male/"
                target="_blank"
                rel="noreferrer"
              >
                NCI SEER · Male reproductive anatomy ↗
              </a>
            </li>
            <li>
              <a
                href="https://www.nhlbi.nih.gov/health/lungs/body-controls-breathing"
                target="_blank"
                rel="noreferrer"
              >
                NHLBI · Breathing mechanics ↗
              </a>
            </li>
          </ul>
        </article>
      </section>
    </main>
  );
}
