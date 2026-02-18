using Booking.Api.Data;
using Booking.Api.DTOs;
using BookingModel = Booking.Api.Models.Booking;
using Microsoft.EntityFrameworkCore;
using Booking.Api.Services;

namespace Booking.Api.Endpoints;

public static class BookingEndpoints
{
    const string GetBookingEndpoint = "GetBooking";
    public static void MapBookingEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/bookings");

        // GET /api/bookings
        group.MapGet("/", async (BookingDbContext dbContext) =>
        {
            var bookings = await dbContext.Bookings
                .AsNoTracking()
                .OrderBy(b => b.DateFrom)
                .ToListAsync();

            return Results.Ok(bookings);
        });

        // GET /api/bookings/{id}
        group.MapGet("/{id:int}", async (int id, BookingDbContext dbContext) =>
        {
            var booking = await dbContext.Bookings
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.Id == id);

            return booking is null
                ? Results.NotFound($"Booking with id {id} was not found.")
                : Results.Ok(booking);
        })
        .WithName(GetBookingEndpoint);

        // DELETE /api/bookings/{id}
        group.MapDelete("/{id:int}", async (int id, BookingDbContext dbContext) =>
        {
            var booking = await dbContext.Bookings.FindAsync(id);
            if (booking is null)
            {
                return Results.NotFound($"Booking with id {id} was not found.");
            }

            dbContext.Bookings.Remove(booking);
            await dbContext.SaveChangesAsync();

            return Results.NoContent();
        });

        // POST /api/bookings
        group.MapPost("/", async (CreateBookingDTO request, BookingDbContext dbContext, IBookingAvailabilityValidator availabilityService, IBookingNotificationService notificationService) =>
        {
            if (request.DateFrom >= request.DateTo)
            {
                return Results.BadRequest("DateFrom must be earlier than DateTo.");
            }

            if (!IsValidHalfHourBoundary(request.DateFrom) || !IsValidHalfHourBoundary(request.DateTo))
            {
                return Results.BadRequest("Bookings must start and end at :00 or :30.");
            }

            if (!IsValidHalfHourDuration(request.DateFrom, request.DateTo))
            {
                return Results.BadRequest("Booking duration must be in 30-minute increments.");
            }

            var availabilityResult = await availabilityService.CheckBookingAsync(
                request.ResourceId,
                request.DateFrom,
                request.DateTo,
                request.BookedQuantity);

            if (!availabilityResult.IsAvailable)
            {
                return Results.Conflict(new {message = availabilityResult.Message});
            }

            BookingModel booking = new()
            {
                DateFrom = request.DateFrom,
                DateTo = request.DateTo,
                BookedQuantity = request.BookedQuantity,
                ResourceId = request.ResourceId
            };

            dbContext.Bookings.Add(booking);
            await dbContext.SaveChangesAsync();

            await notificationService.NotifyBookingCreatedAsync(booking.Id);

            return Results.CreatedAtRoute(
                GetBookingEndpoint,
                new { id = booking.Id },
                new
                {
                    message = "Booking created successfully.",
                    bookingId = booking.Id,
                    booking
                });
        });
    }

    private static bool IsValidHalfHourBoundary(DateTime dateTime) =>
        (dateTime.Minute is 0 or 30) &&
        dateTime.Second == 0 &&
        dateTime.Millisecond == 0;

    private static bool IsValidHalfHourDuration(DateTime from, DateTime to) =>
        (to - from).Ticks % TimeSpan.FromMinutes(30).Ticks == 0;
}
