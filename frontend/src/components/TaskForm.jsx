export function TaskForm({
  taskTitle,
  setTaskTitle,
  taskDescription,
  setTaskDescription,
  taskPriority,
  setTaskPriority,
  taskDeadline,
  setTaskDeadline,
  handleAddTask,
  selectedProject,
}) {
  return (
    <div className="w-full bg-gray-50 p-4 rounded shadow">

      {/* Inputs container */}
      <div className="flex flex-col gap-3">

        {/* Title */}
        <input
          className="w-full border p-2 rounded"
          placeholder="Task title"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
        />

        {/* Description */}
        <input
          className="w-full border p-2 rounded"
          placeholder="Task description"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
        />

        {/* Row for priority + date */}
        <div className="flex flex-col md:flex-row gap-3">

          <select
            value={taskPriority}
            onChange={(e) => setTaskPriority(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <input
            type="date"
            value={taskDeadline}
            onChange={(e) => setTaskDeadline(e.target.value)}
            className="w-full border p-2 rounded"
          />

        </div>

        {/* Button */}
        <button
          onClick={handleAddTask}
          disabled={!selectedProject}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          Add Task
        </button>

      </div>
    </div>
  );
}