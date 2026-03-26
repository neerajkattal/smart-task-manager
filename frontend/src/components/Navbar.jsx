import { useNavigate } from "react-router-dom";


export function Navbar() {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="w-full p-4 bg-white shadow ">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Smart Task Manager</h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      
    </div>
  );
}