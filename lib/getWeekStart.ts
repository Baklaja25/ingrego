export function getWeekStart(date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay() // Sunday = 0
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

















