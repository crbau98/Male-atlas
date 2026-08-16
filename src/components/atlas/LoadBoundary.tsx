"use client";

import { Component, type ReactNode } from "react";
import { Html } from "@react-three/drei";

type Props = { fallback?: ReactNode; children: ReactNode };

type State = { error: Error | null };

export class LoadBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <Html center>
          <p className="rounded-full bg-black/70 px-3 py-1 text-[11px] text-[#d9c59a]">
            Couldn’t load this layer
          </p>
        </Html>
      );
    }
    return this.props.children;
  }
}
