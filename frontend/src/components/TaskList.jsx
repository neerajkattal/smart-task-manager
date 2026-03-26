import { TaskItem } from "./TaskItem";



export function TaskList({ tasks, selectedProject, handleToggleTask, handleDeleteTask, editingTaskId, setEditingTaskId, editTitle, setEditTitle, editDescription, setEditDescription, handleUpdateTask, setTasks, searchTerm, setSearchTerm, loadingTasks, ...props }) {

  return (

    < div className="col-span-2 bg-white p-4 rounded-lg shadow" >
      <h2 className="text-xl font-bold mb-4">Tasks</h2>
      {/* Search task input */}

      {selectedProject && <input
        placeholder="Search tasks.."
        className="w-full w-full border p-2 rounded mb-3"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
        }}
      >

      </input>}

      {
        loadingTasks ? (
          <div className="space-y-4">

            {/* Spinner */}
            <div className="flex justify-center">
              <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>

            {/* Skeleton */}
            <div className="space-y-3 animate-pulse">
              <div className="h-16 bg-gray-300 rounded"></div>
              <div className="h-16 bg-gray-300 rounded"></div>
              <div className="h-16 bg-gray-300 rounded"></div>
            </div>

          </div>
        ) :
          !selectedProject ? (
            <p className="text-gray-500">Select a project first</p>
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