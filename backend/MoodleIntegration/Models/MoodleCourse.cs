using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MoodleIntegration.Models;

[Table("moodle_courses", Schema = "public")]
public class MoodleCourse
{
    [Required]
    public Guid UserId { get; set; }

    [Required]
    public Guid ConnectionId { get; set; }

    [Required]
    public long CourseId { get; set; }

    [Required]
    public string Fullname { get; set; } = string.Empty;

    public string? Shortname { get; set; }
    public string? Summary { get; set; }
    public bool? Visible { get; set; }
    public decimal? Progress { get; set; }
    public DateTimeOffset? Startdate { get; set; }
    public DateTimeOffset? Enddate { get; set; }
    public long? Categoryid { get; set; }
    public string? Raw { get; set; } // jsonb

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
