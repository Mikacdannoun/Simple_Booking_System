import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import { createBooking, deleteBooking, fetchBookings } from './api/bookings'
import { fetchResources } from './api/resources'
import { BookingModal } from './components/booking/BookingModal'
import { BookingsModal } from './components/booking/BookingsModal'
import { ConfirmDeleteModal } from './components/booking/ConfirmDeleteModal'
import { ResourcesTable } from './components/booking/ResourcesTable'
import type { BookingEntry, Resource, Status } from './types/booking'
import { formatDateTimeLocal, roundToNextHalfHour } from './utils/datetime'

function App() {
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoadingResources, setIsLoadingResources] = useState(true)
  const [resourcesError, setResourcesError] = useState<string | null>(null)

  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingStatus, setBookingStatus] = useState<Status | null>(null)

  const [isBookingsOpen, setIsBookingsOpen] = useState(false)
  const [bookings, setBookings] = useState<BookingEntry[]>([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)
  const [bookingsError, setBookingsError] = useState<string | null>(null)
  const [bookingsStatus, setBookingsStatus] = useState<Status | null>(null)
  const [bookingToDelete, setBookingToDelete] = useState<BookingEntry | null>(null)
  const [isDeletingBookingId, setIsDeletingBookingId] = useState<number | null>(null)

  const resourceNames = useMemo(() => {
    return new Map(resources.map((resource) => [resource.id, resource.name]))
  }, [resources])

  useEffect(() => {
    const loadResources = async () => {
      try {
        setIsLoadingResources(true)
        setResourcesError(null)
        setResources(await fetchResources())
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
    setDateFrom(formatDateTimeLocal(start))
    setDateTo(formatDateTimeLocal(end))
    setQuantity(1)
    setBookingStatus(null)
    setIsBookingOpen(true)
  }

  const closeBooking = () => {
    setIsBookingOpen(false)
    setIsSubmitting(false)
    setBookingStatus(null)
  }

  const openRegisteredBookings = async () => {
    try {
      setIsLoadingBookings(true)
      setBookingsError(null)
      setBookingsStatus(null)
      setIsBookingsOpen(true)
      setBookings(await fetchBookings())
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
      await deleteBooking(bookingId)
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
      setBookingStatus({ kind: 'error', text: 'No resource selected.' })
      return
    }

    try {
      setIsSubmitting(true)
      setBookingStatus(null)

      const result = await createBooking({
        resourceId: selectedResource.id,
        dateFrom,
        dateTo,
        bookedQuantity: quantity,
      })

      setBookingStatus({
        kind: result.ok ? 'success' : 'error',
        text: result.message,
      })
    } catch {
      setBookingStatus({ kind: 'error', text: 'Network error while creating booking.' })
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
          <ResourcesTable
            resources={resources}
            isLoading={isLoadingResources}
            error={resourcesError}
            onOpenBooking={openBooking}
            onOpenRegisteredBookings={() => void openRegisteredBookings()}
          />
        </div>
      </section>

      <BookingModal
        isOpen={isBookingOpen}
        selectedResource={selectedResource}
        dateFrom={dateFrom}
        dateTo={dateTo}
        quantity={quantity}
        isSubmitting={isSubmitting}
        status={bookingStatus}
        onClose={closeBooking}
        onSubmit={submitBooking}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onQuantityChange={setQuantity}
      />

      <BookingsModal
        isOpen={isBookingsOpen}
        bookings={bookings}
        isLoading={isLoadingBookings}
        error={bookingsError}
        status={bookingsStatus}
        isDeletingBookingId={isDeletingBookingId}
        getResourceName={(resourceId) => resourceNames.get(resourceId) ?? `#${resourceId}`}
        onClose={closeRegisteredBookings}
        onRequestDelete={setBookingToDelete}
      />

      <ConfirmDeleteModal
        bookingToDelete={bookingToDelete}
        isDeletingBookingId={isDeletingBookingId}
        onCancel={() => setBookingToDelete(null)}
        onConfirm={() => void confirmDeleteBooking()}
      />
    </main>
  )
}

export default App
