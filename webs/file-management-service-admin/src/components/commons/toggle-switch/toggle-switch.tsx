"use client";

export function ToggleSwitch(props: { isOn: boolean; onChange: (isOn: boolean) => void; label: string }) {
  const { isOn, onChange, label } = props;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-label={label}
      onClick={() => onChange(!isOn)}
      className={`relative h-5.5 w-9.5 shrink-0 cursor-pointer rounded-full transition-colors ${isOn ? "bg-primary" : "bg-toggle-off"}`}
    >
      <span
        className="absolute top-0.75 size-4 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.2)] transition-[left] duration-150"
        style={{ left: isOn ? 19 : 3 }}
      />
    </button>
  );
}
