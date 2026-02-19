import { Modal } from '../common/Modal'
import { StatusMessage } from '../common/StatusMessage'
import type { BookingEntry, Status } from '../../types/booking'
import { formatDisplayDate } from '../../utils/datetime'

type BookingsModalProps = {
  isOpen: boolean
  bookings: BookingEntry[]
  isLoading: boolean
  error: string | null
  status: Status | null
  isDeletingBookingId: number | null
  getResourceName: (resourceId: number) => string
  onClose: () => void
  onRequestDelete: (booking: BookingEntry) => void
}

export function BookingsModal({
  isOpen,
  bookings,
  isLoading,
  error,
  status,
  isDeletingBookingId,
  getResourceName,
  onClose,
  onRequestDelete,
}: BookingsModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <Modal className="bookings-modal" onClose={onClose}>
      <div className="booking-header">
        <div className="card-title">Registered Bookings</div>
        <button type="button" className="close-button" onClick={onClose}>
          Close
        </button>
      </div>

      {isLoading && <p className="meta-text">Loading bookings...</p>}
      {error && <p className="status-message status-error">{error}</p>}
      <StatusMessage status={status} />

      {!isLoading && !error && bookings.length === 0 && <p className="meta-text">No bookings registered yet.</p>}

      {!isLoading && !error && bookings.length > 0 && (
        <table className="resources-table bookings-table">
          <thead>
            <tr>
              <th className="col-id">Id</th>
              <th>Resource</th>
              <th>From</th>
              <th>To</th>
              <th>Qty</th>
              <th className="col-action">Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{getResourceName(booking.resourceId)}</td>
                <td>{formatDisplayDate(booking.dateFrom)}</td>
                <td>{formatDisplayDate(booking.dateTo)}</td>
                <td>{booking.bookedQuantity}</td>
                <td>
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => onRequestDelete(booking)}
                    disabled={isDeletingBookingId === booking.id}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Modal>
  )
}
