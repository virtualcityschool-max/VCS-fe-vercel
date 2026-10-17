const STORAGE_KEY = 'vcs_admin_action_center_dismissed_v1';

export interface ActionCenterDismissState {
  dismissedItemIds: Record<string, string[]>;
  dismissedCardTimes: Record<string, number>;
}

export function loadDismissedActionCenterState(): ActionCenterDismissState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { dismissedItemIds: {}, dismissedCardTimes: {} };
    const parsed = JSON.parse(raw);
    return {
      dismissedItemIds: parsed.dismissedItemIds || {},
      dismissedCardTimes: parsed.dismissedCardTimes || {},
    };
  } catch {
    return { dismissedItemIds: {}, dismissedCardTimes: {} };
  }
}

export function saveDismissedActionCenterState(state: ActionCenterDismissState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save action center dismissed state:', e);
  }
}

export function dismissCardItems(
  cardKey: string,
  ids: (string | number)[]
): ActionCenterDismissState {
  const current = loadDismissedActionCenterState();
  const existing = new Set(current.dismissedItemIds[cardKey] || []);
  ids.forEach((id) => existing.add(String(id)));
  const updated: ActionCenterDismissState = {
    ...current,
    dismissedItemIds: {
      ...current.dismissedItemIds,
      [cardKey]: Array.from(existing),
    },
    dismissedCardTimes: {
      ...current.dismissedCardTimes,
      [cardKey]: Date.now(),
    },
  };
  saveDismissedActionCenterState(updated);
  return updated;
}

export function resetAllDismissedNotices(): ActionCenterDismissState {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  return { dismissedItemIds: {}, dismissedCardTimes: {} };
}
