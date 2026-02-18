using System.ComponentModel.DataAnnotations;

namespace Booking.Api.DTOs;

public record class CreateResourceDTO(
    [Required, MinLength(1), MaxLength(100)]string Name,
    [Range(1, int.MaxValue)]int Quantity
);