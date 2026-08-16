"use client";

import { useMemo } from "react";
import { APPEARANCES } from "@/lib/appearances";
import { useAtlas } from "@/lib/atlas-store";

export function AppearanceSelect() {
  const setAppearance = useAtlas((s) => s.setAppearance);

  return (
    <div className="min-h-full overflow-y-auto bg-[#07080c] text-[#efece6]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))] md:gap-10 md:px-6 md:py-12">
        <header className="flex flex-col gap-3">
          <p className="text-xs tracking-[0.28em] text-[#c4a46c] uppercase">
            Male Atlas
          </p>
          <h1 className="max-w-3xl font-serif text-4xl leading-tight md:text-6xl">
            Photoreal male, then the named anatomy underneath.
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-[#b7b3aa] md:text-base">
            Choose a living nude look. Tap the body or raise dissection to peel
            skin into BodyParts3D meshes — skeleton, muscle, viscera, vessels,
            nerves, genitalia, and a parcellated brain. On a phone, open this
            page then Share → Add to Home Screen for a full-screen app.
          </p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {APPEARANCES.map((person) => (
            <button
              key={person.id}
              type="button"
              onClick={() => setAppearance(person.id)}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-[#101218] text-left transition hover:-translate-y-1 hover:border-[#c4a46c]/70"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={person.portrait}
                  alt={person.name}
                  className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute right-3 bottom-3 left-3">
                  <div className="font-serif text-2xl">{person.name}</div>
                  <div className="text-xs tracking-wide text-[#d9c59a]">
                    {person.origin}
                  </div>
                </div>
              </div>
              <p className="px-4 py-3 text-xs leading-5 text-[#b7b3aa]">
                {person.blurb}
              </p>
            </button>
          ))}
        </div>

        <p className="max-w-3xl text-[11px] leading-5 text-[#7d796f]">
          Appearances are photoreal skin, hair and iris looks on the nude
          volunteer. External genitalia use BodyParts3D IS-A meshes (glans,
          corpora, testes) with skin shading; tap Pelvis to inspect them.
          Gallery portraits are clothed references. BodyParts3D, © The Database
          Center for Life Science, CC BY 4.0.
        </p>
      </div>
    </div>
  );
}

export function AppearanceStrip() {
  const appearanceId = useAtlas((s) => s.appearanceId);
  const setAppearance = useAtlas((s) => s.setAppearance);
  const people = useMemo(() => APPEARANCES, []);

  return (
    <div className="flex gap-2">
      {people.map((person) => (
        <button
          key={person.id}
          type="button"
          title={person.name}
          onClick={() => setAppearance(person.id)}
          className={`h-10 w-10 overflow-hidden rounded-full border ${
            appearanceId === person.id
              ? "border-[#c4a46c] ring-2 ring-[#c4a46c]/40"
              : "border-white/15 opacity-80 hover:opacity-100"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={person.portrait}
            alt={person.name}
            className="h-full w-full object-cover object-top"
          />
        </button>
      ))}
    </div>
  );
}
