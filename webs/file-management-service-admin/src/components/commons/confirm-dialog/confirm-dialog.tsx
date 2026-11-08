"use client";

import { Button } from "@fms/web-ui/components/button";
import { Modal } from "../modal";

export function ConfirmDialog(props: {
  message: string;
  confirmLabel?: string;
  isPending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { message, confirmLabel = "삭제", isPending = false, onConfirm, onClose } = props;
  return (
    <Modal
      title="삭제하시겠습니까?"
      width={440}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>취소</Button>
          <Button variant="primary" className="bg-danger! hover:bg-[#c03b3b]!" disabled={isPending} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3.5 px-5.5 py-6">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
          <i className="ti ti-alert-triangle text-[20px]" aria-hidden />
        </div>
        <div className="pt-1 text-[14px] leading-relaxed text-ink-2">{message}</div>
      </div>
    </Modal>
  );
}
