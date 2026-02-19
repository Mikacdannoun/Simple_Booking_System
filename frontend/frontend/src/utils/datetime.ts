export function roundToNextHalfHour(date: Date): Date {
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

export function formatDateTimeLocal(date: Date): string {
  const pad = (value: number) => value.toString().padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function formatDisplayDate(value: string): string {
  return new Date(value).toLocaleString()
}
