export default function deregisterTask(state, action) {
  state.KOI_TASKS = state.KOI_TASKS.filter(
    (e) => e.TaskId != action.input.taskId
  );
  return { state };
}
