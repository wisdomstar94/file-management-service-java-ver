import type { ReactNode } from "react";

export function DataTable(props: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">{props.children}</table>
    </div>
  );
}
