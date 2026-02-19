import type { Resource } from '../../types/booking'

type ResourcesTableProps = {
  resources: Resource[]
  isLoading: boolean
  error: string | null
  onOpenBooking: (resource: Resource) => void
  onOpenRegisteredBookings: () => void
}

export function ResourcesTable({
  resources,
  isLoading,
  error,
  onOpenBooking,
  onOpenRegisteredBookings,
}: ResourcesTableProps) {
  return (
    <section className="card resources-card">
      <div className="card-title">Resources</div>

      {isLoading && <p className="meta-text">Loading resources...</p>}
      {error && <p className="status-message status-error">{error}</p>}

      {!isLoading && !error && resources.length === 0 && <p className="meta-text">No resources found.</p>}

      {!isLoading && !error && resources.length > 0 && (
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
                    <button className="action-button" type="button" onClick={() => onOpenBooking(resource)}>
                      Book
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button type="button" className="ghost-button" onClick={onOpenRegisteredBookings}>
            View Registered Bookings
          </button>
        </>
      )}
    </section>
  )
}
