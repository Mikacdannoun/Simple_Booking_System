using BookingModel = Booking.Api.Models.Booking;
using Booking.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Booking.Api.Data;

public class BookingDbContext : DbContext
{
    public BookingDbContext(DbContextOptions<BookingDbContext> options) : base(options)
    {
    }

    public DbSet<Resource> Resources => Set<Resource>();
    public DbSet<BookingModel> Bookings => Set<BookingModel>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BookingModel>()
            .HasOne<Resource>()
            .WithMany()
            .HasForeignKey(b => b.ResourceId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
