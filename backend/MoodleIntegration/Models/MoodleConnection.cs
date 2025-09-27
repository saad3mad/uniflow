using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MoodleIntegration.Models;

[Table("moodle_connections", Schema = "public")]
public class MoodleConnection
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public Guid UserId { get; set; }

    [Required]
    public string MoodleBaseUrl { get; set; } = string.Empty;

    public long? MoodleUserId { get; set; }

    [Required]
    public string TokenEncrypted { get; set; } = string.Empty;

    public string? PrivateTokenEncrypted { get; set; }

    [Required]
    public string Status { get; set; } = "active"; // active | invalid

    public DateTimeOffset? LastVerifiedAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
