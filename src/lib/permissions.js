// UI-side copy of the task rules in firestore.rules. Only used to show or hide controls:
// the real enforcement is in the rules, so keep the two in sync.

export const isProjectOwner = (project, uid) => Boolean(project && uid && project.ownerId === uid);

/**
 * Owner or the task's creator: title, description, priority, due date, assignee.
 * Someone who is only the assignee can update the status (and take themselves off the task).
 */
export const canEditTaskDetails = (task, project, uid) => isProjectOwner(project, uid) || task.createdBy === uid;

/** Owner or the task's creator. */
export const canDeleteTask = (task, project, uid) => isProjectOwner(project, uid) || task.createdBy === uid;

/**
 * Owner or the task's (current) assignee (what the rules allow). In the UI the assignee does it from the
 * status button (with an optional message) and the owner from the edit form.
 */
export const canChangeStatus = (task, project, uid) => isProjectOwner(project, uid) || task.assigneeId === uid;
