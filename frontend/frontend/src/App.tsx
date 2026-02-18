import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Resource = {
  id: number
  name: string
  quantity: number
}

type BookingEntry = {
  id: number
  dateFrom: string
  dateTo: string
  bookedQuantity: number
  resourceId: number
}

type Status = {
  kind: 'success' | 'error'
  text: string
}

function roundToNextHalfHour(date: Date): Date {
  const rounded = new Date(date)
  rounded.setSeconds(0, 0)

  const minutes = rounded.getMinutes()
  if (minutes === 0 || minutes === 30) {
    return rounded
  }

  if (minutes < 30) {
    rounded.setMinutes(30)
  } else {
    rounded.setHours(rounded.getHours() + 1)
    rounded.setMinutes(0)
  }

  return rounded
}

function formatDateTimeLocal(date: Date): string {
  const pad = (value: number) => value.toString().padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function splitDateTime(value: string): { date: string; time: string } {
  const [date = '', time = ''] = value.split('T')
  return { date, time }
}

function buildDateTime(date: string, time: string): string {
  return `${date}T${time}`
}

const timeOptions = Array.from({ length: 48 }, (_, index) => {
  const hours = String(Math.floor(index / 2)).padStart(2, '0')
  const minutes = index % 2 === 0 ? '00' : '30'
  return `${hours}:${minutes}`
})

function formatDisplayDate(value: string): string {
  const date = new Date(value)
  return date.toLocaleString()
}

function App() {
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoadingResources, setIsLoadingResources] = useState(true)
  const [resourcesError, setResourcesError] = useState<string | null>(null)

  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [dateFromDate, setDateFromDate] = useState('')
  const [dateFromTime, setDateFromTime] = useState('09:00')
  const [dateToDate, setDateToDate] = useState('')
  const [dateToTime, setDateToTime] = useState('10:00')
  const [quantity, setQuantity] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<Status | null>(null)
  const [isBookingsOpen, setIsBookingsOpen] = useState(false)
  const [bookings, setBookings] = useState<BookingEntry[]>([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)
  const [bookingsError, setBookingsError] = useState<string | null>(null)
  const [bookingsStatus, setBookingsStatus] = useState<Status | null>(null)
  const [bookingToDelete, setBookingToDelete] = useState<BookingEntry | null>(null)
  const [isDeletingBookingId, setIsDeletingBookingId] = useState<number | null>(null)

  useEffect(() => {
    const loadResources = async () => {
      try {
        setIsLoadingResources(true)
        setResourcesError(null)

        const response = await fetch('/api/resources')
        if (!response.ok) {
          throw new Error('Failed to load resources from API.')
        }

        const data = (await response.json()) as Resource[]
        setResources(data)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error while loading resources.'
        setResourcesError(message)
      } finally {
        setIsLoadingResources(false)
      }
    }

    void loadResources()
  }, [])

  const openBooking = (resource: Resource) => {
    const start = roundToNextHalfHour(new Date())
    const end = new Date(start.getTime() + 60 * 60 * 1000)

    setSelectedResource(resource)
    const fromParts = splitDateTime(formatDateTimeLocal(start))
    const toParts = splitDateTime(formatDateTimeLocal(end))

    setDateFromDate(fromParts.date)
    setDateFromTime(fromParts.time)
    setDateToDate(toParts.date)
    setDateToTime(toParts.time)
    setQuantity(1)
    setStatus(null)
    setIsBookingOpen(true)
  }

  const closeBooking = () => {
    setIsBookingOpen(false)
    setIsSubmitting(false)
    setStatus(null)
  }

  const openRegisteredBookings = async () => {
    try {
      setIsLoadingBookings(true)
      setBookingsError(null)
      setBookingsStatus(null)
      setIsBookingsOpen(true)

      const response = await fetch('/api/bookings')
      if (!response.ok) {
        throw new Error('Failed to load bookings from API.')
      }

      const data = (await response.json()) as BookingEntry[]
      data.sort((a, b) => new Date(a.dateFrom).getTime() - new Date(b.dateFrom).getTime())
      setBookings(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error while loading bookings.'
      setBookingsError(message)
    } finally {
      setIsLoadingBookings(false)
    }
  }

  const closeRegisteredBookings = () => {
    setIsBookingsOpen(false)
    setBookingToDelete(null)
    setBookingsStatus(null)
  }

  const confirmDeleteBooking = async () => {
    if (!bookingToDelete) {
      return
    }

    const bookingId = bookingToDelete.id

    try {
      setIsDeletingBookingId(bookingId)
      setBookingsStatus(null)

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed to delete booking #${bookingId}.`)
      }

      setBookings((previous) => previous.filter((booking) => booking.id !== bookingId))
      setBookingsStatus({ kind: 'success', text: `Booking #${bookingId} deleted.` })
      setBookingToDelete(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error while deleting booking.'
      setBookingsStatus({ kind: 'error', text: message })
    } finally {
      setIsDeletingBookingId(null)
    }
  }

  const submitBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedResource) {
      setStatus({ kind: 'error', text: 'No resource selected.' })
      return
    }

    try {
      setIsSubmitting(true)
      setStatus(null)

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resourceId: selectedResource.id,
          dateFrom: buildDateTime(dateFromDate, dateFromTime),
          dateTo: buildDateTime(dateToDate, dateToTime),
          bookedQuantity: quantity,
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        const errorMessage = data?.message ?? 'Booking could not be created.'
        setStatus({ kind: 'error', text: errorMessage })
        return
      }

      const successMessage = data?.message ?? 'Booking created successfully.'
      setStatus({ kind: 'success', text: successMessage })
    } catch {
      setStatus({ kind: 'error', text: 'Network error while creating booking.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="page">
      <section className="app-shell">
        <header className="app-header">
          <div>
            <h1>Plan2Learn Booking</h1>
            <p>Choose a resource and create a booking</p>
          </div>
        </header>

        <div className="layout-grid">
          <section className="card resources-card">
            <div className="card-title">Resources</div>

            {isLoadingResources && <p className="meta-text">Loading resources...</p>}
            {resourcesError && <p className="status-message status-error">{resourcesError}</p>}

            {!isLoadingResources && !resourcesError && resources.length === 0 && (
              <p className="meta-text">No resources found.</p>
            )}

            {!isLoadingResources && !resourcesError && resources.length > 0 && (
              <>
                <table className="resources-table">
                  <thead>
                    <tr>
                      <th className="col-id">Id</th>
                      <th>Name</th>
                      <th>Quantity</th>
                      <th className="col-action">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resources.map((resource) => (
                      <tr key={resource.id}>
                        <td>{resource.id}</td>
                        <td>{resource.name}</td>
                        <td>{resource.quantity}</td>
                        <td>
                          <button
                            className="action-button"
                            type="button"
                            onClick={() => openBooking(resource)}
                          >
                            Book
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => void openRegisteredBookings()}
                >
                  View Registered Bookings
                </button>
              </>
            )}
          </section>
        </div>
      </section>

      {isBookingOpen && selectedResource && (
        <div className="modal-backdrop" onClick={closeBooking}>
          <section
            className="card booking-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="booking-header">
              <div className="card-title">Booking</div>
              <button
                type="button"
                className="close-button"
                onClick={closeBooking}
              >
                Close
              </button>
            </div>

            <form className="booking-form" onSubmit={submitBooking}>
              <label>
                <span>Resource</span>
                <input type="text" value={selectedResource.name} readOnly />
              </label>
              <label>
                <span>Date From</span>
                <div className="date-time-row">
                  <input
                    type="date"
                    value={dateFromDate}
                    onChange={(event) => setDateFromDate(event.target.value)}
                    required
                  />
                  <select
                    value={dateFromTime}
                    onChange={(event) => setDateFromTime(event.target.value)}
                    required
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
              <label>
                <span>Date To</span>
                <div className="date-time-row">
                  <input
                    type="date"
                    value={dateToDate}
                    onChange={(event) => setDateToDate(event.target.value)}
                    required
                  />
                  <select
                    value={dateToTime}
                    onChange={(event) => setDateToTime(event.target.value)}
                    required
                  >
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
              <label>
                <span>Quantity</span>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  required
                />
              </label>

              {status && (
                <p className={`status-message ${status.kind === 'success' ? 'status-success' : 'status-error'}`}>
                  {status.text}
                </p>
              )}

              <button className="primary-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Booking'}
              </button>
            </form>
          </section>
        </div>
      )}

      {isBookingsOpen && (
        <div className="modal-backdrop" onClick={closeRegisteredBookings}>
          <section
            className="card bookings-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="booking-header">
              <div className="card-title">Registered Bookings</div>
              <button
                type="button"
                className="close-button"
                onClick={closeRegisteredBookings}
              >
                Close
              </button>
            </div>

            {isLoadingBookings && <p className="meta-text">Loading bookings...</p>}
            {bookingsError && <p className="status-message status-error">{bookingsError}</p>}
            {bookingsStatus && (
              <p className={`status-message ${bookingsStatus.kind === 'success' ? 'status-success' : 'status-error'}`}>
                {bookingsStatus.text}
              </p>
            )}

            {!isLoadingBookings && !bookingsError && bookings.length === 0 && (
              <p className="meta-text">No bookings registered yet.</p>
            )}

            {!isLoadingBookings && !bookingsError && bookings.length > 0 && (
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
                  {bookings.map((booking) => {
                    const resourceName = resources.find((resource) => resource.id === booking.resourceId)?.name ?? `#${booking.resourceId}`

                    return (
                      <tr key={booking.id}>
                        <td>{booking.id}</td>
                        <td>{resourceName}</td>
                        <td>{formatDisplayDate(booking.dateFrom)}</td>
                        <td>{formatDisplayDate(booking.dateTo)}</td>
                        <td>{booking.bookedQuantity}</td>
                        <td>
                          <button
                            type="button"
                            className="delete-button"
                            onClick={() => setBookingToDelete(booking)}
                            disabled={isDeletingBookingId === booking.id}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </section>
        </div>
      )}

      {bookingToDelete && (
        <div className="modal-backdrop" onClick={() => setBookingToDelete(null)}>
          <section
            className="card confirm-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="card-title">Confirm deletion</div>
            <p className="meta-text">
              Delete booking #{bookingToDelete.id} ({formatDisplayDate(bookingToDelete.dateFrom)})?
            </p>
            <div className="confirm-actions">
              <button
                type="button"
                className="close-button"
                onClick={() => setBookingToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-button"
                onClick={() => void confirmDeleteBooking()}
                disabled={isDeletingBookingId === bookingToDelete.id}
              >
                {isDeletingBookingId === bookingToDelete.id ? 'Deleting...' : 'Yes, delete'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

export default App
