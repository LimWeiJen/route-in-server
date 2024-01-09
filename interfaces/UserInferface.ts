import Analytics from "./AnalyticsInterface";
import TaskGroup from "./TaskGroupInterface";

export default interface User {
	lastLogInDay: number,
	taskGroups: Array<TaskGroup>,
	analytics: Analytics
}
