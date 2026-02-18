using Booking.Api.DTOs;

namespace Booking.Api.Services;

public interface IAvailabilityTimelineService
{
    Task<IReadOnlyList<AvailabilityTimeFrameDTO>> GetAvailabilityTimelineAsync(
        int resourceId, DateTime from, DateTime to, TimeSpan timeFrameSize, CancellationToken ct = default);
}
