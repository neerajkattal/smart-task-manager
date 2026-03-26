import { useState } from "react";

import API from "../services/api";


function ProjectList({ projects, setProjects, selectedProject, setSelectedProject }) {

  const [showForm, setShowForm] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const token = localStorage.getItem("token");

  function toggleForm() {
    setShowForm(!showForm);
  }


  const handleAddProject = async (e) => {

    //Stop reloading
    e.preventDefault();

    try {
      const response = await API.post('/projects',

        {
          title: projectTitle,
          description: projectDescription,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      // console.log("NEW PROJECT:", response.data);
      //  setProjects((prevProjects) => [...prevProjects, response.data]);
      setProjects((prev) => [...prev, response.data]);
      setProjectTitle("");
      setProjectDescription("");
      setShowForm(false);
    }
    catch (error) {
      console.log(error);
    }


  }


  //delete Project function

  const handleDeleteProject = async (projectId) => {


    try {
      await API.delete(`/projects/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
        }

      );

      setProjects((prev) => prev.filter((project) => project.id !== projectId));

      setSelectedProject(null);

    }
    catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="w-full">

      <h2 className="text-xl font-bold mb-4">Your Projects</h2>

      {/* New Project Button */}
      <button
        className="w-full bg-blue-500 text-white py-2 rounded mb-4 hover:bg-blue-600"
        onClick={toggleForm}
      >
        + New Project
      </button>

      {/* Create Project Form */}
      {showForm && (
        <form onSubmit={handleAddProject} className="mb-4">
          <div className="flex flex-col gap-3">

            <input
              type="text"
              placeholder="Project Title"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="w-full border p-2 rounded"
            />

            <input
              type="text"
              placeholder="Project Description"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="w-full border p-2 rounded"
            />

            <button className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
              Create Project
            </button>

          </div>
        </form>
      )}

      {/* Project List */}
      <div className="flex flex-col gap-3">

        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => {
              if (selectedProject === project.id) {
                setSelectedProject(null)
              }
              else {
                setSelectedProject(project.id)
              }

            }}
            className={`p-3 rounded cursor-pointer transition ${selectedProject === project.id
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
              }`}
          >

            <div className="flex justify-between items-start">

              <div>
                <h3 className="font-semibold">{project.title}</h3>
                <p className="text-sm opacity-80">{project.description}</p>
              </div>

              <button
                className="text-red-500 text-sm hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProject(project.id);
                }}
              >
                Delete
              </button>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

export default ProjectList;