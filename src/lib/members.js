/** Display name of a member, from the project's `members` map. */
export const memberName = (project, uid) => project.members?.[uid]?.displayName ?? null;

/**
 * [{ uid, name }] for everyone in the project, owner first. `fallback` is shown for members whose
 * name isn't stored (projects created before the `members` map existed).
 */
export function projectMembers(project, fallback) {
  const list = project.memberIds.map((uid) => ({ uid, name: memberName(project, uid) || fallback }));
  return list.sort((a, b) => (b.uid === project.ownerId) - (a.uid === project.ownerId));
}
