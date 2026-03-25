

export function TaskItem({ tasks, handleToggleTask, handleDeleteTask, editingTaskId, setEditingTaskId, editTitle, setEditTitle, editDescription, setEditDescription, handleUpdateTask, setTasks,searchTerm }) {


  const filteredTasks = tasks.filter((task) => {

    return (
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });


  return (

    filteredTasks.map((task) => (
      <div
        key={task.id}
        className="flex items-center justify-between bg-gray-100 p-3 mb-2 rounded"
      >
        <div>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => handleToggleTask(task)}
            className="mr-2"
          />

          <span>
            {editingTaskId === task.id ? (
              <div className="flex gap-2">
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="border p-1 rounded"
                />

                <input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="border p-1 rounded"
                />

                <select
                  value={task.priority}
                  onChange={(e) => {
                    const newPriority = e.target.value;

                    setTasks((prevTasks) =>
                      prevTasks.map((t) =>
                        t.id === task.id ? { ...t, priority: newPriority } : t
                      )
                    );
                  }}
                  className="border p-1 rounded"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>

                <button onClick={() => handleUpdateTask(task.id)} className="text-green-500">
                  Save
                </button>
              </div>
            ) : (
              <span
                className={`${task.completed ? "line-through text-gray-500" : ""}`}
              >
                {task.title}
              </span>

            )}

            <p
              className={`text-xs font-semibold ${task.priority === "high"
                ? "text-red-500"
                : task.priority === "medium"
                  ? "text-yellow-500"
                  : "text-green-500"
                }`}
            >
              {(task.priority ?? "medium").toUpperCase()}
            </p>

          </span>
          <p className="text-sm text-gray-600">{task.description}</p>

          <p
            className={`text-xs ${task.deadline && new Date(task.deadline) < new Date()
              ? "text-red-500"
              : "text-gray-500"
              }`}
          >
            {task.deadline
              ? `Due: ${new Date(task.deadline).toLocaleDateString()}`
              : "No deadline"}
          </p>
        </div>



        <button
          onClick={() => {
            setEditingTaskId(task.id);
            setEditTitle(task.title);
            setEditDescription(task.description);
          }}

          className="text-blue-500 mr-2"
        >
          Edit
        </button>

        <button
          onClick={() => handleDeleteTask(task.id)}
          className="text-red-500"
        >
          Delete
        </button>
      </div>
    ))

  )
}