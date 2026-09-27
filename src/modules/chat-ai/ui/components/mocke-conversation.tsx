export interface MockConversation {
  id: string;
  title: string;
}

export const initialConversations: MockConversation[] = [
  { id: "1", title: "Plan a weekend trip to Kyoto" },
  { id: "2", title: "Debug the auth redirect loop" },
  { id: "3", title: "Brainstorm names for the app" },
];

/**
 * Stand-ins for real Server Actions (`renameGame` / `deleteGame`). They
 * resolve after a short delay to mimic a network round trip, so the pending
 * states in `DiscussionMenu` (spinners, disabled inputs) still have
 * something to show.
 */
export function mockRenameConversation(
  _id: string,
  title: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!title.trim()) {
        reject(new Error("Title cannot be empty"));
        return;
      }
      resolve();
    }, 400);
  });
}

export function mockDeleteConversation(_id: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 400);
  });
}

/**
 * Stand-in for `createGame`. Turns the first prompt into a title (truncated,
 * same as a real backend would likely do before an LLM-generated title comes
 * back) and hands back a fresh conversation the caller can navigate to.
 */
export function mockCreateConversation(
  prompt: string,
): Promise<MockConversation> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const title = prompt.length > 60 ? `${prompt.slice(0, 57)}...` : prompt;
      resolve({ id: crypto.randomUUID(), title });
    }, 400);
  });
}
