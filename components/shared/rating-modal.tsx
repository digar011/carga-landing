'use client';

import { Modal } from '@/components/ui/modal';
import { RatingForm } from '@/components/shared/rating-form';

interface TRatingModalProps {
  open: boolean;
  onClose: () => void;
  loadId: string;
  toUserId: string;
  routeLabel: string;
  userName: string;
}

export function RatingModal({
  open,
  onClose,
  loadId,
  toUserId,
  routeLabel,
  userName,
}: TRatingModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={`Califica a ${userName}`}>
      <RatingForm
        loadId={loadId}
        toUserId={toUserId}
        routeLabel={routeLabel}
        onComplete={onClose}
      />
    </Modal>
  );
}
