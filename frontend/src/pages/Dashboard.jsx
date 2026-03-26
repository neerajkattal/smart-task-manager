import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

import ProjectList from "../components/ProjectList";
import { TaskList } from "../components/TaskList";
import { TaskForm } from "../components/TaskForm";


function Dashboard() {

  const [projects, setProjects] = useState([]);
  const token = localStorage.getItem("token");


  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedProject, setSelectedProject] = useState(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const navigate = useNavigate();

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskDeadline, setTaskDeadline] = useState("");

  const [showTaskForm, setShowTaskForm] = useState(false);

  const [loadingTasks, setLoadingTasks] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  useEffect(() => {

    const fetchProjects = async () => {
      try {
        // Make an authenticated request to fetch projects
        const response = await API.get('/projects', {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        console.log(response.data);
        setProjects(response.data);
      }
      catch (error) {
        console.error("Error fetching projects:", error);
      }
    };


    fetchProjects();
  }, [token]);


  // Fetch tasks when a project is selected
  useEffect(() => {
    if (selectedProject === null) return;

    const fetchTasks = async () => {
      try {
        setLoadingTasks(true);

        const response = await API.get(
          `/projects/${selectedProject}/tasks`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setLoadingTasks(false);

        console.log(response.data);
        setTasks(response.data);

      } catch (error) {
        setLoadingTasks(false);
        console.error(error);
      }
    };
    setTasks([]);

    fetchTasks();
  }, [selectedProject, token]);


  // toggle to show/hie task form

  function toggleTaskForm() {
    setShowTaskForm(!showTaskForm);
  }

  // Add a new task to the selected project

  const handleAddTask = async () => {
    if (!selectedProject) {
      alert("Select a project first");
      return;
    }

    try {
      // Make an authenticated request to add a new task
      const response = await API.post(
        `/projects/${selectedProject}/tasks`,
        {
          title: taskTitle,
          description: taskDescription,
          priority: taskPriority,
          deadline: taskDeadline || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTasks((prevTasks) => [...prevTasks, response.data]);
      setTaskTitle("");
      setTaskDescription("");
      setTaskPriority("medium");
      setTaskDeadline("");
      setShowTaskForm(false)

    } catch (error) {
      console.error(error);
    }
  };

  // Delete a task
  const handleDeleteTask = async (taskId) => {
    try {
      await API.delete(`/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove the deleted task from the state
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error(error);
    }
  }

  const handleToggleTask = async (task) => {
    try {
      await API.patch(`/tasks/${task.id}`,
        {
          completed: !task.completed,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update UI
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === task.id ? { ...t, completed: !t.completed } : t
        )
      );


    }
    catch (error) {
      console.error(error);
    }
  }


  // const handleLogout = async () => {
  //   localStorage.removeItem("token");
  //   navigate("/login");
  // }

  const handleUpdateTask = async (taskId) => {
    try {
      await API.patch(
        `/tasks/${taskId}`,
        {
          title: editTitle,
          description: editDescription,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update UI
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === taskId
            ? { ...t, title: editTitle, description: editDescription }
            : t
        )
      );

      setEditingTaskId(null);

    } catch (error) {
      console.error(error);
    }
  };



  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">

      {/* Header */}
      <div className="mb-6 mt-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row gap-6">

        {/* LEFT: Projects */}
        <div className="w-full md:w-1/3 bg-white p-4 rounded shadow">
          <ProjectList
            projects={projects}
            setProjects={setProjects}
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
          />
        </div>

        {/* RIGHT: Tasks */}
        <div className="w-full md:w-2/3 bg-white p-4 rounded shadow">

          {/* Task List */}
          <TaskList
            tasks={tasks}
            selectedProject={selectedProject}
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
            setSearchTerm={setSearchTerm}
            loadingTasks={loadingTasks}

          />

          {/* Add Task Button */}
          <div className="mt-4">
            <button
              className="w-full md:w-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={toggleTaskForm}
            >
              + Add Task
            </button>
          </div>

          {/* Task Form */}
          {showTaskForm && (
            <div className="mt-4 flex justify-center">
              <div className="w-full max-w-md">
                <TaskForm
                  taskTitle={taskTitle}
                  setTaskTitle={setTaskTitle}
                  taskDescription={taskDescription}
                  setTaskDescription={setTaskDescription}
                  taskPriority={taskPriority}
                  setTaskPriority={setTaskPriority}
                  taskDeadline={taskDeadline}
                  setTaskDeadline={setTaskDeadline}
                  handleAddTask={handleAddTask}
                  selectedProject={selectedProject}
                />
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default Dashboard;