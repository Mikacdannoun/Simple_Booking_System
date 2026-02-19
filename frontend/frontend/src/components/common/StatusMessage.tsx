import type { Status } from '../../types/booking'

type StatusMessageProps = {
  status: Status | null
}

export function StatusMessage({ status }: StatusMessageProps) {
  if (!status) {
    return null
  }

  return (
    <p className={`status-message ${status.kind === 'success' ? 'status-success' : 'status-error'}`}>
      {status.text}
    </p>
  )
}
