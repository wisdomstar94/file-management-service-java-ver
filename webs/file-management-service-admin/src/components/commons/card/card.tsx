import type { ReactNode } from "react";

export function Card(props: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-line bg-white ${props.className ?? ""}`}>
      {props.children}
    </div>
  );
}
