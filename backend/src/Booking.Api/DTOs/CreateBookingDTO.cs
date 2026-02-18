using System.ComponentModel.DataAnnotations;

namespace Booking.Api.DTOs;

public record class CreateBookingDTO(
    [Required]DateTime DateFrom,
    [Required]DateTime DateTo,
    [Range(1, int.MaxValue)]int BookedQuantity,
    [Range(1, int.MaxValue)]int ResourceId
);