using Booking.Api.DTOs;

namespace Booking.Api.Services;

public interface IBookingAvailabilityValidator
{
    Task<BookingAvailabilityResult> CheckBookingAsync(
        int resourceId, DateTime from, DateTime to, int requestedQuantity, CancellationToken ct = default);
}
