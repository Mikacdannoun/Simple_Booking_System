namespace Booking.Api.DTOs;

public sealed record BookingAvailabilityResult(
    bool IsAvailable,
    string Message,
    int AvailableQuantity
);

public sealed record AvailabilityTimeFrameDTO(
    DateTime From,
    DateTime To,
    int AvailableQuantity,
    int TotalQuantity
);
