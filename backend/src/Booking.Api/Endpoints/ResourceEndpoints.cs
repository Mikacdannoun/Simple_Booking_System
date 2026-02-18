using Booking.Api.Data;
using Booking.Api.DTOs;
using Booking.Api.Models;
using Booking.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace Booking.Api.Endpoints;

public static class ResourceEndpoints
{
    const string GetResourceEndpoint = "GetResource";

    public static void MapResourceEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/resources");

        // GET /api/resources
        group.MapGet("/", async (BookingDbContext dbContext) =>
        {
            var resources = await dbContext.Resources
            .AsNoTracking()
            .OrderBy(r => r.Id)
            .ToListAsync();

            return Results.Ok(resources);
        });

        // GET /api/resources/{id}
        group.MapGet("/{id:int}", async (int id, BookingDbContext dbContext) =>
        {
            var resource = await dbContext.Resources
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id);

            return resource is null
            ? Results.NotFound($"Resource with id {id} was not found.")
            : Results.Ok(resource);
        })
        .WithName(GetResourceEndpoint);

        // GET /api/resources/{id}/availability
        group.MapGet("/{id:int}/availability", async (
            int id,
            DateTime from,
            DateTime to,
            IAvailabilityTimelineService timelineService) =>
        {
            if (from >= to)
            {
                return Results.BadRequest("From must be earlier than To.");
            }

            if (!IsValidHalfHourBoundary(from) || !IsValidHalfHourBoundary(to))
            {
                return Results.BadRequest("Availability range must use :00 or :30 boundaries.");
            }

            var availability = await timelineService.GetAvailabilityTimelineAsync(
                id,
                from,
                to,
                TimeSpan.FromMinutes(30));

            return Results.Ok(availability);
        });

        // POST /api/resources
        group.MapPost("/", async (CreateResourceDTO request, BookingDbContext dbContext) =>
        {
            Resource resource = new()
            {
                Name = request.Name.Trim(),
                Quantity = request.Quantity
            };

            dbContext.Resources.Add(resource);
            await dbContext.SaveChangesAsync();

            return Results.CreatedAtRoute(GetResourceEndpoint, new {id = resource.Id}, resource);
        });
    }

    private static bool IsValidHalfHourBoundary(DateTime dateTime) =>
        (dateTime.Minute is 0 or 30) &&
        dateTime.Second == 0 &&
        dateTime.Millisecond == 0;
}
