namespace Booking.Api.Services;

public sealed class ConsoleBookingNotificationService : IBookingNotificationService
{
    public Task NotifyBookingCreatedAsync(int bookingId, CancellationToken ct = default)
    {
        Console.WriteLine($"EMAIL SENT TO admin@admin.com FOR CREATED BOOKING WITH ID {bookingId}");
        return Task.CompletedTask;
    }
}
