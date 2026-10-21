import { useCallback, useEffect, useRef, useState } from 'react';
import { markChatRead, subscribeToMessages, subscribeToReads } from '../services/chat.js';

export const CHAT_PAGE = 30;

/**
 * Live chat of a project for member `uid`:
 * { status: 'loading' | 'ready' | 'error', messages (oldest first), hasMore, loadOlder, reads, unread, seenBy }.
 * While `open`, new messages from others are marked read (which also gives their authors the ✓✓).
 */
export function useChat(project, uid, open) {
  const [pages, setPages] = useState(1);
  const [state, setState] = useState({ status: 'loading', messages: [], hasMore: false });
  const [reads, setReads] = useState({});
  const projectId = project.id;

  useEffect(
    () =>
      subscribeToMessages(
        projectId,
        pages * CHAT_PAGE,
        (messages, hasMore) => setState({ status: 'ready', messages, hasMore }),
        () => setState({ status: 'error', messages: [], hasMore: false })
      ),
    [projectId, pages]
  );

  // Without the markers the chat still works (no unread count, no ticks), so errors are ignored.
  useEffect(() => subscribeToReads(projectId, setReads, () => setReads({})), [projectId]);

  const myReadAt = reads[uid] ?? null;
  const fromOthers = state.messages.filter((m) => m.authorId !== uid && !m.pending);
  const unread = fromOthers.filter((m) => !myReadAt || m.createdAt > myReadAt).length;
  const latestOther = fromOthers.at(-1);

  // Mark read once per newest message, so a slow save isn't sent again on every render.
  const marked = useRef(null);
  useEffect(() => {
    if (!open || !latestOther || unread === 0 || marked.current === latestOther.id) return;
    marked.current = latestOther.id;
    markChatRead(projectId, uid).catch(() => { marked.current = null; });
  }, [open, latestOther, unread, projectId, uid]);

  /** Current members (not the author) who opened the chat after `message` was sent. */
  const seenBy = useCallback(
    (message) =>
      project.memberIds.filter((id) => id !== message.authorId && reads[id] && reads[id] >= message.createdAt),
    [project.memberIds, reads]
  );

  const loadOlder = useCallback(() => setPages((p) => p + 1), []);

  return { ...state, loadOlder, reads, unread, seenBy };
}
