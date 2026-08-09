import type { CommandCenterUiAction } from "./types";

export const MITRA_UI_ACTION_EVENT = "poshane:mitra-ui-action";

export type MitraUiActionEvent = CustomEvent<CommandCenterUiAction>;

export function dispatchMitraUiAction(action: CommandCenterUiAction) {
  window.dispatchEvent(
    new CustomEvent<CommandCenterUiAction>(MITRA_UI_ACTION_EVENT, {
      detail: action,
    }),
  );
}
