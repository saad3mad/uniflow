using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MoodleIntegration.Models;

[Table("moodle_course_contents", Schema = "public")]
public class MoodleCourseContent
{
    [Required]
    public Guid UserId { get; set; }

    [Required]
    public Guid ConnectionId { get; set; }

    [Required]
    public long CourseId { get; set; }

    public long? SectionId { get; set; }
    public string? SectionName { get; set; }
    public long? ModuleId { get; set; }
    public string? ModuleName { get; set; }
    public string? Modname { get; set; }
    public string? Url { get; set; }
    public string? Raw { get; set; } // jsonb

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
