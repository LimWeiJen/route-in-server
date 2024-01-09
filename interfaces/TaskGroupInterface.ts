import Task from "./TaskInterface";

export default interface TaskGroup {
	id: string,
	name: string,
	tasks: Array<Task>,
	dayOfAppearance: Array<boolean>,
	color: string
}
