
export function TaskForm({ taskTitle, setTaskTitle, taskDescription, setTaskDescription, taskPriority, setTaskPriority, taskDeadline, setTaskDeadline, handleAddTask, selectedProject }) {


  return (

    <div className="mt-4 flex gap-2">
      <div className="flex flex-col items-center px-4">
        <input
          className="border p-2 rounded w-full max-w-md"
          placeholder="Task title"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
        />

        <input
          className="border p-2 rounded w-1/2"
          placeholder="Task Description"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
        />
      </div>

      <select
        value={taskPriority}
        onChange={(e) => setTaskPriority(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <input
        type="date"
        value={taskDeadline}
        onChange={(e) => {
          setTaskDeadline(e.target.value);
        }}
        className="border p-2 rounded">
      </input>


      <button
        onClick={handleAddTask}
        disabled={!selectedProject}
        className="bg-blue-500 text-white px-4 rounded disabled:bg-gray-400"

      >
        Add
      </button>

    </div>

  );
}