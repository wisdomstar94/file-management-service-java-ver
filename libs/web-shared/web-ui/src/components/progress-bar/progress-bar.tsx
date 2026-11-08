export function ProgressBar(props: { value: number; max: number | null }) {
  const percent = props.max ? Math.min(100, Math.round((props.value / props.max) * 100)) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line-row">
      <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
    </div>
  );
}
