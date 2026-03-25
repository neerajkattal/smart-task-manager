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


    try{
      await API.delete(`/projects/${projectId}`,
        {
          headers: {
            Authorization : `Bearer ${token}`
          },
        }

      );

      setProjects((prev) => prev.filter((project) => project.id !== projectId));

      setSelectedProject(null);

    }
    catch(error) {
      console.log(error);
    }
  }

  return (
    <div className="col-span-1 bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Your Projects</h2>

      <button
        className="bg-blue-500 text-white px-3 py-1 rounded mb-3 hover:bg-blue-600"
        onClick={toggleForm}
      >New Project</button>



      {showForm &&
        <form onSubmit={handleAddProject}>
          <div>
            <div className="flex flex-col items-center px-4">
              <input
                type="text"
                placeholder="Title"
                value={projectTitle}
                onChange={(e) => {
                  setProjectTitle(e.target.value);
                }}
                className="border p-2 rounded mb-2 w-full max-w-md"
              ></input>

              <input
                type="text"
                placeholder="Description"
                value={projectDescription}
                onChange={(e) => {
                  setProjectDescription(e.target.value);
                }}
                className="border p-2 rounded mb-2 w-full max-w-md"
              ></input>
            </div>
            <button
              className="bg-green-500 border p-2 rounded mb-2 w-full hover:bg-green-600"

            >Create Project</button>
          </div>
        </form>
      }




      {projects.map((project) => (
        <div
          key={project.id}
          onClick={() => setSelectedProject(project.id)}
          className={`p-3 mb-2 rounded cursor-pointer ${selectedProject === project.id
            ? "bg-blue-500 text-white"
            : "bg-gray-100"
            }`}
        >
          <h3 className="font-semibold">{project.title}</h3>
          <p className="text-sm">{project.description}</p>
          <button
            className="bg-red-500 text-sm mt-2 rounded p-1 hover:bg-red-600"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteProject(project.id);
              // console.log(project.id);
            }}
          >Delete</button>
        </div>
      ))}
    </div>
  )
}

export default ProjectList;