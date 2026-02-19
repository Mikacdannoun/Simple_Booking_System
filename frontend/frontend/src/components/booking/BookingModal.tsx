import type { FormEvent } from 'react'
import { Modal } from '../common/Modal'
import { StatusMessage } from '../common/StatusMessage'
import type { Resource, Status } from '../../types/booking'

type BookingModalProps = {
  isOpen: boolean
  selectedResource: Resource | null
  dateFrom: string
  dateTo: string
  quantity: number
  isSubmitting: boolean
  status: Status | null
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
  onQuantityChange: (value: number) => void
}

export function BookingModal({
  isOpen,
  selectedResource,
  dateFrom,
  dateTo,
  quantity,
  isSubmitting,
  status,
  onClose,
  onSubmit,
  onDateFromChange,
  onDateToChange,
  onQuantityChange,
}: BookingModalProps) {
  if (!isOpen || !selectedResource) {
    return null
  }

  return (
    <Modal className="booking-modal" onClose={onClose}>
      <div className="booking-header">
        <div className="card-title">Booking</div>
        <button type="button" className="close-button" onClick={onClose}>
          Close
        </button>
      </div>

      <form className="booking-form" onSubmit={onSubmit}>
        <label>
          <span>Resource</span>
          <input type="text" value={selectedResource.name} readOnly />
        </label>
        <label>
          <span>Date From</span>
          <input type="datetime-local" value={dateFrom} onChange={(event) => onDateFromChange(event.target.value)} required />
        </label>
        <label>
          <span>Date To</span>
          <input type="datetime-local" value={dateTo} onChange={(event) => onDateToChange(event.target.value)} required />
        </label>
        <label>
          <span>Quantity</span>
          <input type="number" min={1} value={quantity} onChange={(event) => onQuantityChange(Number(event.target.value))} required />
        </label>

        <StatusMessage status={status} />

        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Booking'}
        </button>
      </form>
    </Modal>
  )
}
