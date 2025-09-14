import React, { useContext, useEffect, useState } from 'react'
import { IoAddOutline, IoPerson, IoSearch, IoGrid, IoList, IoStar } from "react-icons/io5";
import { UserContext } from '../context/User.context'
import axiosInstance from '../config/axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { User } = useContext(UserContext);
  const [isOpen, setIsOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [activeFilter, setActiveFilter] = useState("all"); // "all", "recent", "starred"

  const navigate = useNavigate();

  useEffect(() => {
    if (!User) return;

    setLoading(true);
    axiosInstance.get("/project")
      .then((res) => {
        setProjects(res.data.projects);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, [User]);

  const handleCreate = async () => {
    if (!projectName) return alert("Please enter project name");
    
    try {
      const res = await axiosInstance.post("/project", {
        name: projectName 
      }, {
        withCredentials: true
      });
      
      // Add the new project to the list
      setProjects([...projects, res.data.project]);
      setIsOpen(false);
      setProjectName("");
    } catch (err) {
      console.log(err);
    }
  };

  // Filter projects based on search query
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Apply additional filters
  const getFilteredProjects = () => {
    let result = filteredProjects;
    
    if (activeFilter === "recent") {
      // Sort by most recent (assuming projects have createdAt field)
      result = [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (activeFilter === "starred") {
      // Filter starred projects (assuming projects have isStarred field)
      result = result.filter(project => project.isStarred);
    }
    
    return result;
  };

  return (
    <div className="dashboard-container bg-gray-50 min-h-screen flex">
      {/* Sidebar */}
      <div className="sidebar w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto flex flex-col">
        <div className="p-5 border-b border-gray-200">
          <div className="user-info flex items-center gap-3 mb-6">
            <div className="user-avatar w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <IoPerson size={20} className="text-gray-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800 capitalize">{User ? User.name : "Guest"}</h2>
              <p className='font-medium text-sm text-gray-500 '>{User.email}</p>
              
            </div>
          </div>
          
          <button
            className="w-full py-2.5 px-4 bg-gray-400 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
            onClick={() => setIsOpen(true)}
          >
            <IoAddOutline size={18} />
            <span>New Project</span>
          </button>
        </div>
        
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Filters</h3>
          <div className="space-y-1">
            <button 
              className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeFilter === "all" ? "bg-blue-50 text-gray-600" : "text-gray-600 hover:bg-gray-100"}`}
              onClick={() => setActiveFilter("all")}
            >
              All Projects
            </button>
            <button 
              className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeFilter === "recent" ? "bg-blue-50 text-gray-600" : "text-gray-600 hover:bg-gray-100"}`}
              onClick={() => setActiveFilter("recent")}
            >
              Recent
            </button>
            <button 
              className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeFilter === "starred" ? "bg-blue-50 text-gray-600" : "text-gray-600 hover:bg-gray-100"}`}
              onClick={() => setActiveFilter("starred")}
            >
              Starred
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">View Options</h3>
          <div className="flex border border-gray-200 rounded-md p-1">
            <button 
              className={`flex-1 py-1.5 flex items-center justify-center rounded-md ${viewMode === "grid" ? "bg-gray-100" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <IoGrid size={16} className={viewMode === "grid" ? "text-blue-600" : "text-gray-500"} />
            </button>
            <button 
              className={`flex-1 py-1.5 flex items-center justify-center rounded-md ${viewMode === "list" ? "bg-gray-100" : ""}`}
              onClick={() => setViewMode("list")}
            >
              <IoList size={16} className={viewMode === "list" ? "text-blue-600" : "text-gray-500"} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {User?.name}!</h1>
            <p className="text-gray-600">You have {projects.length} active projects</p>
          </div>
          
          {/* Search and Stats */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-80">
              <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-lg border border-gray-200 px-4 py-2">
                <span className="text-sm text-gray-600">{filteredProjects.length} projects found</span>
              </div>
            </div>
          </div>
          
          {/* Projects Grid/List */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse text-gray-500">Loading your projects...</div>
            </div>
          ) : (
            <>
              {getFilteredProjects().length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
                  <IoAddOutline size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No projects found</h3>
                  <p className="text-gray-500 mb-4">Create your first project to get started</p>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    onClick={() => setIsOpen(true)}
                  >
                    Create Project
                  </button>
                </div>
              ) : (
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-4"}>
                  {getFilteredProjects().map((project) => (
                    <div 
                      key={project._id}
                      onClick={() => navigate('/project', { state: project })}
                      className={`bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${viewMode === "list" ? "flex items-center p-4" : "p-5"}`}
                    >
                      <div className={viewMode === "list" ? "flex-1" : ""}>
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-gray-800 text-lg">{project.name}</h3>
                          <button 
                            className="text-gray-400 hover:text-yellow-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Toggle star functionality would go here
                            }}
                          >
                            <IoStar size={18} />
                          </button>
                        </div>
                        
                        <div className="flex items-center text-gray-500 text-sm">
                          <IoPerson size={16} className="mr-1" />
                          <span>{project.users.length} collaborators</span>
                        </div>
                        
                        {viewMode === "list" && (
                          <div className="mt-2">
                            <span className="inline-block bg-gray-100 text-xs text-gray-600 px-2 py-1 rounded">
                              Last updated: {new Date().toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {viewMode === "list" && (
                        <div className="ml-4">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                            {project.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Project</h2>
            <p className="text-gray-600 text-sm mb-5">Get started by creating a new project for your team</p>
            
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                onClick={() => {
                  setIsOpen(false);
                  setProjectName("");
                }}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleCreate}
                disabled={!projectName.trim()}
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;