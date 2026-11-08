export function EmptyRow(props: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={props.colSpan} className="px-4 py-14 text-center text-[13.5px] text-faint">
        {props.message}
      </td>
    </tr>
  );
}
