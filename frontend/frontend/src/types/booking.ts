export type Resource = {
  id: number
  name: string
  quantity: number
}

export type BookingEntry = {
  id: number
  dateFrom: string
  dateTo: string
  bookedQuantity: number
  resourceId: number
}

export type Status = {
  kind: 'success' | 'error'
  text: string
}
