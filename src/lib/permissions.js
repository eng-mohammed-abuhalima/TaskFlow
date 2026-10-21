// UI-side copy of the task rules in firestore.rules. Only used to show or hide controls:
// the real enforcement is in the rules, so keep the two in sync.

/*
  Member permissions (projects/{id}/memberPerms/{uid}.perms), granted by the owner. Each one works on ANY
  task of the project. Without them a member still manages the tasks they created, and updates the
  status of tasks assigned to them. A member without a permissions document is a "contributor".
*/
export const PERMS = ['create', 'edit', 'dueDate', 'assign', 'status', 'delete'];

export const PRESETS = {
  viewer: [],
  contributor: ['create'],
  manager: [...PERMS],
};
export const DEFAULT_PERMS = PRESETS.contributor;

/** 'viewer' | 'contributor' | 'manager' | 'custom' for a list of permissions (order doesn't matter). */
export function presetOf(perms = DEFAULT_PERMS) {
  const set = new Set(perms);
  const match = Object.entries(PRESETS).find(([, list]) => list.length === set.size && list.every((p) => set.has(p)));
  return match ? match[0] : 'custom';
}

export const isProjectOwner = (project, uid) => Boolean(project && uid && project.ownerId === uid);

/** The owner can do everything; a member only what they were given. */
const has = (perms, perm) => (perms ?? DEFAULT_PERMS).includes(perm);
const ownerOrCreator = (task, project, uid) => isProjectOwner(project, uid) || task.createdBy === uid;

export const canCreateTask = (project, uid, perms) => isProjectOwner(project, uid) || has(perms, 'create');

/** Which parts of a task's edit form this user may change. */
export function taskFieldAccess(task, project, uid, perms) {
  const base = ownerOrCreator(task, project, uid);
  return {
    details: base || has(perms, 'edit'), // title, description, priority
    dueDate: base || has(perms, 'dueDate'),
    assignee: base || has(perms, 'assign'),
  };
}

/** Shows the pencil: at least one part of the form can be changed. */
export function canEditTask(task, project, uid, perms) {
  const access = taskFieldAccess(task, project, uid, perms);
  return access.details || access.dueDate || access.assignee;
}

export const canDeleteTask = (task, project, uid, perms) => ownerOrCreator(task, project, uid) || has(perms, 'delete');

/** What the rules allow: the owner, the current assignee, or a member with "status". */
export const canChangeStatus = (task, project, uid, perms) =>
  isProjectOwner(project, uid) || task.assigneeId === uid || has(perms, 'status');

/**
 * The status button (StatusDialog, with an optional message): the assignee, and members with "status".
 * The owner changes the status from the edit form instead (unless the task is assigned to them).
 */
export const showsStatusButton = (task, project, uid, perms) =>
  task.assigneeId === uid || (!isProjectOwner(project, uid) && has(perms, 'status'));
