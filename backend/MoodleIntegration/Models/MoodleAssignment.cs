using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MoodleIntegration.Models;

[Table("moodle_assignments", Schema = "public")]
public class MoodleAssignment
{
    [Required]
    public Guid UserId { get; set; }

    [Required]
    public Guid ConnectionId { get; set; }

    [Required]
    public long AssignmentId { get; set; }

    [Required]
    public long CourseId { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;

    public DateTimeOffset? Duedate { get; set; }
    public DateTimeOffset? Allowsubmissionsfromdate { get; set; }
    public DateTimeOffset? Cutoffdate { get; set; }
    public decimal? Grade { get; set; }
    public string? Status { get; set; }
    public string? Raw { get; set; } // jsonb

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
