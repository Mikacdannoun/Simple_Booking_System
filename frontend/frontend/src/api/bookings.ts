import type { BookingEntry } from '../types/booking'

type BookingResponse = {
  message?: string
}

export type CreateBookingInput = {
  resourceId: number
  dateFrom: string
  dateTo: string
  bookedQuantity: number
}

export type CreateBookingResult = {
  ok: boolean
  message: string
}

export async function fetchBookings(): Promise<BookingEntry[]> {
  const response = await fetch('/api/bookings')
  if (!response.ok) {
    throw new Error('Failed to load bookings from API.')
  }

  const data = (await response.json()) as BookingEntry[]
  data.sort((a, b) => new Date(a.dateFrom).getTime() - new Date(b.dateFrom).getTime())
  return data
}

export async function createBooking(payload: CreateBookingInput): Promise<CreateBookingResult> {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = (await response.json().catch(() => null)) as BookingResponse | null
  if (!response.ok) {
    return {
      ok: false,
      message: data?.message ?? 'Booking could not be created.',
    }
  }

  return {
    ok: true,
    message: data?.message ?? 'Booking created successfully.',
  }
}

export async function deleteBooking(bookingId: number): Promise<void> {
  const response = await fetch(`/api/bookings/${bookingId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`Failed to delete booking #${bookingId}.`)
  }
}
