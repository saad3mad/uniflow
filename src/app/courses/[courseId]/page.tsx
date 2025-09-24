{{ ... }}
import { useToast } from '@/components/ui/use-toast';
{{ ... }}
export default function CourseDetailPage() {
  const { toast } = useToast();
  {{ ... }}
  const handleMarkRead = useCallback(async (moduleId: number, courseId: number) => {
    if (!user) return;
    
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Not authenticated");
      
      const res = await fetch('/api/moodle/mark-read', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ moduleId, courseId })
      });
      
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Mark as read failed');
      
      toast({
        title: 'Marked as read',
        description: 'Your progress has been saved',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to mark as read',
        variant: 'destructive'
      });
    }
  }, [user, toast]);
  {{ ... }}
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleDownload(m.module_id)}
                              className="btn-secondary text-sm inline-flex items-center gap-1"
                            >
                              <Download className="w-4 h-4" /> Download
                            </button>
                            <button 
                              onClick={() => handleMarkRead(m.module_id, m.course_id)}
                              className="btn-secondary text-sm inline-flex items-center gap-1"
                            >
                              <Check className="w-4 h-4"/> Mark as read
                            </button>
                          </div>
{{ ... }}
