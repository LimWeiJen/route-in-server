import { Analytics, Task, TaskGroup } from ".";


export default interface UserContextInterface {
	taskGroups?: Array<TaskGroup>,
	analytics?: Analytics,
	deleteTaskGroup: (taskGroupId: string) => Promise<void>,
	saveTaskGroup: (taskGroupId: string, newDayOfAppearance: Array<boolean>, newName: string, newTasks: Array<Task>, newColor: string) => Promise<void>,
  	addNewTaskGroup: () => Promise<void>,
	toggleChecked: (taskGroupId: string, taskIndex: number, checked: boolean) => Promise<void>,
	totalDaysPassed: number
}
