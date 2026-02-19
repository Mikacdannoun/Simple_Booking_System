import { Modal } from '../common/Modal'
import type { BookingEntry } from '../../types/booking'
import { formatDisplayDate } from '../../utils/datetime'

type ConfirmDeleteModalProps = {
  bookingToDelete: BookingEntry | null
  isDeletingBookingId: number | null
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDeleteModal({
  bookingToDelete,
  isDeletingBookingId,
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) {
  if (!bookingToDelete) {
    return null
  }

  return (
    <Modal className="confirm-modal" onClose={onCancel}>
      <div className="card-title">Confirm deletion</div>
      <p className="meta-text">
        Delete booking #{bookingToDelete.id} ({formatDisplayDate(bookingToDelete.dateFrom)})?
      </p>
      <div className="confirm-actions">
        <button type="button" className="close-button" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="delete-button"
          onClick={onConfirm}
          disabled={isDeletingBookingId === bookingToDelete.id}
        >
          {isDeletingBookingId === bookingToDelete.id ? 'Deleting...' : 'Yes, delete'}
        </button>
      </div>
    </Modal>
  )
}
