using Booking.Api.Data;
using Booking.Api.Endpoints;
using Booking.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<BookingDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddOpenApi();
builder.Services.AddScoped<IBookingAvailabilityValidator, BookingAvailabilityService>();
builder.Services.AddScoped<IAvailabilityTimelineService, BookingAvailabilityService>();
builder.Services.AddScoped<IBookingNotificationService, ConsoleBookingNotificationService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapBookingEndpoints();
app.MapResourceEndpoints();

app.Run();
