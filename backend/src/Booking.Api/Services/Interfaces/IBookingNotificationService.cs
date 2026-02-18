namespace Booking.Api.Services;

public interface IBookingNotificationService
{
    Task NotifyBookingCreatedAsync(int bookingId, CancellationToken ct = default);
}
