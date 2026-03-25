import { TaskItem } from "./TaskItem";



export function TaskList({ tasks, selectedProject, handleToggleTask, handleDeleteTask, editingTaskId, setEditingTaskId, editTitle, setEditTitle, editDescription, setEditDescription, handleUpdateTask, setTasks, searchTerm, setSearchTerm, ...props }) {

  return (

    < div className="col-span-2 bg-white p-4 rounded-lg shadow" >
      <h2 className="text-xl font-bold mb-4">Tasks</h2>
      {/* Search task input */}

      <input
        placeholder="Search tasks.."
        className="w-full w-full border p-2 rounded mb-3"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
        }}
      >

      </input>

      {
        !selectedProject ? (
          <p className="text-gray-500">Select a project</p>
        ) : tasks.length === 0 ? (
          <p className="text-gray-500 italic">
            No tasks yet — add your first task 🚀
          </p>
        ) : (

          <TaskItem
            tasks={tasks}
            handleToggleTask={handleToggleTask}
            handleDeleteTask={handleDeleteTask}
            editingTaskId={editingTaskId}
            setEditingTaskId={setEditingTaskId}
            editTitle={editTitle}
            setEditTitle={setEditTitle}
            editDescription={editDescription}
            setEditDescription={setEditDescription}
            handleUpdateTask={handleUpdateTask}
            setTasks={setTasks}
            searchTerm={searchTerm}
          />
        )
      }

    </div >
  );
}