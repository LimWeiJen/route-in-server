export default interface Task {
	title: string,
	totalCompletionDay: number,
  totalDay: number,
	checked: boolean,
  status: 'checked' | 'unchecked' | 'ignored'
}
