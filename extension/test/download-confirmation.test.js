// Regression guard: captured links must never begin transferring before Start.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const main = read("../../crates/app/src/main.rs");
const clips = read("../../crates/app/src/clipui.rs");
const options = read("../../crates/app/src/options.rs");

const dialogStart = main.indexOf("pub(crate) fn open_add_dialog");
const dialogEnd = main.indexOf('/// "Cancel" in Download File Info', dialogStart);
assert(dialogStart >= 0 && dialogEnd > dialogStart, "download info dialog source was not found");
const dialog = main.slice(dialogStart, dialogEnd);
assert(!/early:\s*true/.test(dialog), "dialog must not create an early transfer");
assert(!/ctx\.mgr\.add\s*\(/.test(dialog), "dialog must not add a transfer before Start");
assert(dialog.includes("No network transfer starts while this dialog is open."), "explicit-start invariant comment missing");

const clipboardStart = main.indexOf("// Clipboard monitoring only captures a link.");
const refreshStart = main.indexOf("// ------------------------------------------------------------ refresh loops", clipboardStart);
assert(clipboardStart >= 0 && refreshStart > clipboardStart, "clipboard monitor source was not found");
const clipboard = main.slice(clipboardStart, refreshStart);
assert(!clipboard.includes("auto_start_clipboard"), "legacy clipboard auto-start must not be consulted");
assert(!/mgr\.add\s*\(/.test(clipboard), "clipboard monitoring must not start a transfer");

assert(!main.includes("!s.show_start_dialog"), "browser capture must not bypass the confirmation window");
assert(clips.includes("req.start = false;"), "video clips must enter the list stopped");
assert(options.includes("s.auto_start_clipboard = false;"), "legacy clipboard auto-start setting must be migrated off");
assert(options.includes("s.show_start_dialog = true;"), "confirmation window must remain enabled");
assert(options.includes("s.start_while_info = false;"), "early-start setting must be migrated off");

console.log("REVO explicit-start regression checks passed.");
