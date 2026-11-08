export function BrandMark(props: { size?: number }) {
  const { size = 30 } = props;
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-lg bg-primary text-white"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.57) }}
    >
      <i className="ti ti-folders" aria-hidden />
    </div>
  );
}
