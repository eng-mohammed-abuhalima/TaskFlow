// UI-side copy of the task rules in firestore.rules. Only used to show or hide controls:
// the real enforcement is in the rules, so keep the two in sync.

export const isProjectOwner = (project, uid) => Boolean(project && uid && project.ownerId === uid);

/** Owner, the task's creator, or its assignee. */
export const canEditTask = (task, project, uid) =>
  isProjectOwner(project, uid) || task.createdBy === uid || task.assigneeId === uid;

/** Owner or the task's creator. */
export const canDeleteTask = (task, project, uid) => isProjectOwner(project, uid) || task.createdBy === uid;

/** Owner or the task's (current) assignee. */
export const canChangeStatus = (task, project, uid) => isProjectOwner(project, uid) || task.assigneeId === uid;
