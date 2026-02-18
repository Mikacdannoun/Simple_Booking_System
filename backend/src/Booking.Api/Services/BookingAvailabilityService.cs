using Booking.Api.Data;
using Booking.Api.DTOs;
using Booking.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Booking.Api.Services;

public sealed class BookingAvailabilityService : IBookingAvailabilityValidator, IAvailabilityTimelineService
{
    private readonly BookingDbContext _dbContext;

    public BookingAvailabilityService(BookingDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<BookingAvailabilityResult> CheckBookingAsync(
        int resourceId,
        DateTime requestedFrom,
        DateTime requestedTo,
        int requestedQuantity,
        CancellationToken ct = default)
    {
        var resource = await _dbContext.Resources
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == resourceId, ct);

        if (resource is null)
        {
            return new BookingAvailabilityResult
            (
                IsAvailable: false,
                Message: $"Resource with id {resourceId} does not exist.",
                AvailableQuantity: 0);
        }

        var bookedInPeriod = await _dbContext.Bookings
            .AsNoTracking()
            .Where(b =>
                b.ResourceId == resourceId &&
                b.DateFrom < requestedTo &&
                requestedFrom < b.DateTo)
            .SumAsync(b => b.BookedQuantity, ct);

        var available = resource.Quantity - bookedInPeriod;
        if (available < 0) available = 0;

        var isAvailable = available >= requestedQuantity;

        return isAvailable
            ? new BookingAvailabilityResult(true, "Resource is available.", available)
            : new BookingAvailabilityResult(
                false,
                $"Resource is not available for the requested period. Available quantity: {available}.",
                available);
    }

    public async Task<IReadOnlyList<AvailabilityTimeFrameDTO>> GetAvailabilityTimelineAsync(
        int resourceId,
        DateTime from,
        DateTime to,
        TimeSpan timeFrameSize,
        CancellationToken ct = default)
    {
        var resource = await _dbContext.Resources
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == resourceId, ct);

        if (resource is null)
        {
            return Array.Empty<AvailabilityTimeFrameDTO>();
        }

        if (from >= to || timeFrameSize <= TimeSpan.Zero)
        {
            return Array.Empty<AvailabilityTimeFrameDTO>();
        }

        var overlappingBookings = await _dbContext.Bookings
            .AsNoTracking()
            .Where(b =>
                b.ResourceId == resourceId &&
                b.DateFrom < to &&
                from < b.DateTo)
            .Select(b => new { b.DateFrom, b.DateTo, b.BookedQuantity})
            .ToListAsync(ct);
        
        var timeFrames = new List<AvailabilityTimeFrameDTO>();
        var currentTimeFrameStart = from;

        while (currentTimeFrameStart < to)
        {
            var timeFrameEnd = currentTimeFrameStart + timeFrameSize;
            if (timeFrameEnd > to) timeFrameEnd = to;

            var bookedInTimeFrame = overlappingBookings
                .Where(b => b.DateFrom < timeFrameEnd && currentTimeFrameStart < b.DateTo)
                .Sum(b => b.BookedQuantity);
            
            var available = Math.Max(0, resource.Quantity - bookedInTimeFrame);
            
            timeFrames.Add(new AvailabilityTimeFrameDTO(
                From: currentTimeFrameStart,
                To: timeFrameEnd,
                AvailableQuantity: available,
                TotalQuantity: resource.Quantity));
            
            currentTimeFrameStart = timeFrameEnd;
        }
        return timeFrames;
    }
}
