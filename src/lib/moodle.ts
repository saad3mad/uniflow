export type MoodleSiteInfo = {
  userid: number
  username: string
  firstname: string
  lastname: string
  fullname: string
  siteurl: string
  userpictureurl?: string
  functions?: Array<{ name: string }>
}

export type MoodleCourse = any
export type MoodleAssignmentsResp = {
  courses: Array<{
    id: number
    assignments: Array<any>
  }>
}
export type MoodleCourseContents = any

function toURL(base: string, path: string): string {
  const u = base.replace(/\/$/, '') + '/' + path.replace(/^\//, '')
  return u
}

// Retrieve a Moodle token from username/password
export async function getMoodleToken(baseUrl: string, username: string, password: string, service = 'moodle_mobile_app'): Promise<string> {
  const url = toURL(baseUrl, 'login/token.php')
  const body = new URLSearchParams({
    username,
    password,
    service,
  })
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) {
    throw new Error(`Failed to retrieve token: HTTP ${res.status}`)
  }
  const data = await res.json().catch(async () => ({ token: (await res.text()) as any }))
  if ((data as any).error) {
    throw new Error(`Moodle token error: ${(data as any).error}`)
  }
  const token = (data as any).token
  if (!token) throw new Error('Token not present in Moodle response')
  return token as string
}

// Call a Moodle core function using REST server api
export async function callMoodle<T = any>(baseUrl: string, token: string, wsfunction: string, params: Record<string, any> = {}): Promise<T> {
  const url = new URL(toURL(baseUrl, 'webservice/rest/server.php'))
  url.searchParams.set('wstoken', token)
  url.searchParams.set('wsfunction', wsfunction)
  url.searchParams.set('moodlewsrestformat', 'json')
  for (const [k, v] of Object.entries(params)) {
    if (Array.isArray(v)) {
      v.forEach((vv, idx) => url.searchParams.set(`${k}[${idx}]`, String(vv)))
    } else {
      url.searchParams.set(k, String(v))
    }
  }
  const res = await fetch(url.toString(), { method: 'GET' })
  if (!res.ok) throw new Error(`Moodle call failed: ${wsfunction} HTTP ${res.status}`)
  const data = await res.json()
  if ((data as any)?.exception) {
    throw new Error(`Moodle exception ${wsfunction}: ${(data as any).message}`)
  }
  return data as T
}

export async function verifyToken(baseUrl: string, token: string): Promise<MoodleSiteInfo> {
  return callMoodle<MoodleSiteInfo>(baseUrl, token, 'core_webservice_get_site_info')
}

export async function getUserCourses(baseUrl: string, token: string, userid: number) {
  return callMoodle<any[]>(baseUrl, token, 'core_enrol_get_users_courses', { userid })
}

export async function getAssignments(baseUrl: string, token: string, courseids: number[]) {
  return callMoodle<MoodleAssignmentsResp>(baseUrl, token, 'mod_assign_get_assignments', { courseids })
}

export async function getCourseContents(baseUrl: string, token: string, courseid: number) {
  return callMoodle<MoodleCourseContents>(baseUrl, token, 'core_course_get_contents', { courseid })
}
