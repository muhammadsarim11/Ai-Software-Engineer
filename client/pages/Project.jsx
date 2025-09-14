import React, { useState, useEffect, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { FaUserGroup } from "react-icons/fa6";
import { IoIosSend } from "react-icons/io";
import { IoIosCloseCircle } from "react-icons/io";
import { LuCircleUser } from "react-icons/lu";
import { IoMdAdd } from "react-icons/io";
import axiosInstance from '../config/axios.js';
import { initiateSocket, recievedMessage, sendMessage } from '../config/socket.js';
import { UserContext } from '../context/User.context.jsx';
import Markdown from 'markdown-to-jsx';
import Editor from '@monaco-editor/react';
import { RiFoldersLine } from "react-icons/ri";
import { getWebContainer } from '../config/webContainers.js';

const Project = () => {
  const { User } = useContext(UserContext);
  const [isSidePanelOpen, setisSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [messages, setMessages] = useState([]);
  const location = useLocation();
  const [message, setMessage] = useState("");
  const [openFiles, setOpenFiles] = useState([]);
  const [fileTree, setFileTree] = useState({});
  const [currentFile, setCurrentFile] = useState(null);
  const [webContainer, setwebContainer] = useState(null)
  const [iframeUrl, setiframeUrl] = useState(null)
  const [runProcess, setRunProcess] = useState(null)
  const projectID = location.state?._id;

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axiosInstance.get('/users');
      setUsers(response.data.users);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    fetchUsers();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUsers([]);
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };


 function saveFileTree(ft) {
  axiosInstance.put('/project/update-file-tree', { // ← Use axiosInstance
    projectId: projectID,
    fileTree: ft
  }).then(res => {
    console.log("FileTree saved:", res.data.project);
  }).catch(err => {
    console.error("Error saving fileTree:", err);
  });
}


  function getLanguageFromExtension(filename) {
    const extension = filename.split('.').pop() || '';
    switch (extension) {
      case 'js': return 'javascript';
      case 'jsx': return 'javascript';
      case 'ts': return 'typescript';
      case 'tsx': return 'typescript';
      case 'json': return 'json';
      case 'css': return 'css';
      case 'html': return 'html';
      case 'md': return 'markdown';
      case 'py': return 'python';
      case 'java': return 'java';
      default: return 'plaintext';
    }
  }

  const handleAddCollaborators = async () => {
    if (!projectID) {
      setError('Project ID not found');
      return;
    }

    if (selectedUsers.length === 0) {
      return;
    }

    try {
      for (const userId of selectedUsers) {
        await axiosInstance.put(`/project/add-user`, {
          project_id: projectID,
          user_id: userId
        });
      }
      closeModal();
      fetchProjectCollaborators();
    } catch (err) {
      setError('Failed to add collaborators: ' + (err.response?.data?.message || err.message));
    }
  };

  const fetchProjectCollaborators = async () => {
    if (!projectID) return;

    try {
      const response = await axiosInstance.get(`/project/get-users/${projectID}`);
      setCollaborators(response.data.project.users);
      setFileTree(response.data.project.fileTree)
    } catch (error) {
      console.log(error);
    }
  };

  const handleSendMessage = () => {
    if (message.trim() === "") return;

    const outgoingData = { message, sender: User };
    sendMessage("project-message", outgoingData);
    appendOutgoingMessage(outgoingData);
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  function appendIncomingMessage(data) {
    setMessages(prev => [...prev, { ...data, type: 'incoming' }]);
  }

  function appendOutgoingMessage(data) {
    setMessages(prev => [...prev, { ...data, type: 'outgoing' }]);
  }

  useEffect(() => {
    if (!projectID) return;
    initiateSocket(projectID);

    if (!webContainer) {
      getWebContainer().then(container => {
        setwebContainer(container)
      })
    }

    fetchProjectCollaborators();

    recievedMessage("project-message", (data) => {
      try {
        let messageData;

        if (typeof data.message === 'string') {
          messageData = JSON.parse(data.message);
        } else {
          messageData = data.message;
        }

        webContainer?.mount(messageData.fileTree)

        if (messageData.fileTree) {
          setFileTree(messageData.fileTree);

          const messageForChat = {
            ...data,
            message: messageData.text || "AI response received"
          };

          appendIncomingMessage(messageForChat);
        } else {
          appendIncomingMessage({ ...data, message: messageData });
        }
      } catch (error) {
        appendIncomingMessage(data);
      }
    });
  }, [projectID]);

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop() || '';
    const iconMap = {
      js: '📄',
      jsx: '📄',
      ts: '📄',
      tsx: '📄',
      json: '📋',
      css: '🎨',
      html: '🌐',
      md: '📝',
      py: '🐍',
      java: '☕',
      txt: '📝',
      xml: '📄',
      yml: '📋',
      yaml: '📋',
      default: '📄'
    };

    return iconMap[extension] || iconMap.default;
  };

  const WriteAimessage = (messageContent) => {
    if (typeof messageContent === 'string') {
      return <Markdown>{messageContent}</Markdown>;
    }

    if (typeof messageContent === 'object' && messageContent !== null) {
      if (messageContent.text) {
        return <Markdown>{messageContent.text}</Markdown>;
      }
      return <Markdown>{JSON.stringify(messageContent)}</Markdown>;
    }

    return <Markdown>{String(messageContent)}</Markdown>;
  };

  useEffect(() => {
    const messageBox = document.querySelector(".message-box");
    if (messageBox) {
      messageBox.scrollTop = messageBox.scrollHeight;
    }
  }, [messages]);

  if (!projectID) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Project not found</h2>
          <p className="text-gray-500">Please navigate to a valid project</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-gray-100 overflow-hidden">
      <div className='flex flex-col h-full w-80 bg-white border-r border-gray-200 relative'>
        <header className='flex justify-between items-center p-3 border-b border-gray-200 bg-white'>
          <div className='flex items-center'>
            <button
              onClick={openModal}
              className='p-1 rounded hover:bg-gray-100 transition-colors'
            >
              <IoMdAdd size={20} />
            </button>
            <p className='text-sm text-gray-500 ml-2'>Add collaborators</p>
          </div>
          <button
            onClick={() => setisSidePanelOpen(!isSidePanelOpen)}
            className='p-2 rounded hover:bg-gray-100 transition-colors'
          >
            <FaUserGroup size={18} />
          </button>
        </header>

        <div className="conversation-area flex-grow flex flex-col h-full">
          <div
            className="message-box flex-grow overflow-y-auto p-3 space-y-2 text-sm"
            style={{ maxHeight: "calc(100vh - 130px)" }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.type === 'outgoing' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs rounded-lg overflow-auto px-3 py-2 ${msg.type === 'outgoing'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                    }`}
                  style={{ wordBreak: 'break-word' }}
                >
                  <div className='flex flex-col'>
                    <small className="text-xs opacity-80">
                      {msg.sender?.name || 'Unknown'}
                    </small>
                    <span className="message">
                      {msg.sender?._id === "ai-bot" ?
                        WriteAimessage(msg.message) :
                        <>{typeof msg.message === 'object' ? JSON.stringify(msg.message) : msg.message}</>
                      }
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="input w-full flex p-3 border-t border-gray-200 bg-white">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className='flex-grow py-2 px-4 border border-gray-300 rounded-l-lg outline-none focus:border-blue-500'
              type="text"
              placeholder='Type a message'
            />
            <button
              onClick={handleSendMessage}
              disabled={message.trim() === ""}
              className={`px-4 py-2 rounded-r-lg transition-colors ${message.trim() === ""
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
            >
              <IoIosSend fontSize={20} />
            </button>
          </div>
        </div>

        <div className={`side-panel absolute top-0 right-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out z-10 ${isSidePanelOpen ? 'translate-x-0' : 'translate-x-[-100%]'
          }`}>
          <header className='flex justify-between items-center p-4 border-b border-gray-200 bg-white'>
            <h3 className='font-semibold text-gray-700'>Collaborators</h3>
            <button
              onClick={() => setisSidePanelOpen(false)}
              className='p-1 rounded hover:bg-gray-100 transition-colors'
            >
              <IoIosCloseCircle size={24} />
            </button>
          </header>

          <div className='p-3 overflow-y-auto h-full'>
            {collaborators.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No collaborators yet</p>
            ) : (
              collaborators.map((user, id) => (
                <div key={id} className='flex items-center p-3 hover:bg-gray-100 rounded-lg mb-2 transition-colors'>
                  <div className='mr-3 text-gray-600'>
                    <LuCircleUser size={24} />
                  </div>
                  <div className='text-md text-gray-700'>
                    <p>{user.name}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="right flex flex-grow h-full bg-white overflow-auto">
        <div className='explorer min-w-52 border-r border-gray-200 p-4 bg-gray-50 overflow-y-auto'>
          <h3 className="text-md flex font-semibold text-gray-700 mb-3">
            <RiFoldersLine size={24} className='inline-flex' />
            Files
          </h3>
          <div className="tree-elements space-y-1">
            {fileTree && Object.keys(fileTree).map((fileName, index) => (
              <button
                onClick={() => {
                  setCurrentFile(fileName);
                  setOpenFiles(prev => [...new Set([...prev, fileName])]);
                }}
                key={index}
                className={`file-item p-2 rounded-md text-left w-full transition-colors flex items-center gap-2 ${fileName === currentFile
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                <span className="text-sm">{getFileIcon(fileName)}</span>
                <span className="text-xs font-medium truncate">{fileName}</span>
              </button>
            ))}
          </div>
        </div>

        {currentFile && (
          <div className='code-editor flex flex-col flex-grow h-full bg-white'>
            <div className="editor-tabs bg-gray-50 px-3 py-2 border-b border-gray-200 flex overflow-x-auto items-center">
              {openFiles.map((file, index) => (
                <div
                  key={index}
                  className={`file-tab px-3 py-2 border-r border-gray-200 cursor-pointer flex items-center gap-2 transition-colors text-sm ${file === currentFile
                      ? 'bg-white text-blue-600 font-medium border-t-2 border-t-blue-500'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  onClick={() => setCurrentFile(file)}
                >
                  <span className="text-sm">📄</span>
                  <span className="truncate max-w-32">{file}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenFiles(prev => prev.filter(f => f !== file));
                      if (file === currentFile) {
                        setCurrentFile(openFiles.find(f => f !== file) || '');
                      }
                    }}
                    className="ml-1 text-gray-400 hover:text-red-500 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}

              <div className="run-files ml-auto px-3">
                <button
                  className='bg-green-100 px-4 py-2 rounded text-green-700 hover:bg-green-200 transition-colors text-sm font-medium'
                  onClick={async () => {
                    if (!fileTree || typeof fileTree !== 'object') return;

                    try {
                      const filesystem = {};

                      Object.keys(fileTree).forEach(fileName => {
                        const fileData = fileTree[fileName];
                        let fileContent = "";

                        if (fileData?.file?.contents) {
                          fileContent = fileData.file.contents;
                        } else if (fileData?.content) {
                          fileContent = fileData.content;
                        }

                        filesystem[fileName] = {
                          file: {
                            contents: fileContent
                          }
                        };
                      });

                      await webContainer?.mount(filesystem);

                      const InstallProcess = await webContainer?.spawn('npm', ['install']);
                      InstallProcess.output.pipeTo(new WritableStream({
                        write(chunk) {
                          console.log("LS output:", chunk);
                        }
                      }));




                      if (runProcess) {
                        runProcess.kill()
                      }

                      let tempRunProcess = await webContainer.spawn("npm", ["start"]);

                      tempRunProcess.output.pipeTo(new WritableStream({
                        write(chunk) {
                          console.log(chunk)
                        }
                      }))

                      setRunProcess(tempRunProcess)

                      webContainer.on("server-ready", (port, url) => {
                        console.log(port + url)
                        setiframeUrl(url)

                      })

                    } catch (error) {
                      console.error("Error mounting file tree:", error);
                    }
                  }}
                >
                  🚀 Run LS
                </button>
              </div>
            </div>

            <div className="editor-container flex flex-grow">
              {fileTree[currentFile] && (
                <div className="monaco-editor-container w-full h-full">
               <Editor
  height="100%"
  language={getLanguageFromExtension(currentFile)}
  value={
    fileTree[currentFile].content ||
    (fileTree[currentFile].file && fileTree[currentFile].file.contents) ||
    ""
  }
  onChange={(value) => {
    const updatedFileTree = {
      ...fileTree,
      [currentFile]: {
        file: {
          contents: value
        }
      }
    };
    setFileTree(updatedFileTree); 
    // Debounced save
   saveFileTree(updatedFileTree)
  }}
  theme="vs-light"
  options={{
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 13,
    fontFamily: "'Fira Code', monospace",
    wordWrap: 'on',
    automaticLayout: true,
    padding: { top: 12 },
    lineNumbers: 'on',
    glyphMargin: false,
    folding: true,
    lineNumbersMinChars: 3
  }}
/>
                </div>
              )}
            </div>
          </div>
        )}

        {
          iframeUrl && webContainer && (
            <div className='flex flex-col  h-full'>
              <div className="address-bar">
                <input
                  onChange={(e) => {
                    setiframeUrl(e.target.value)
                  }}
                  value={iframeUrl}
                  type="text"
                  className='w-full p-2 px-4 bg-gray-200' />

              </div>
              <iframe src={iframeUrl} className='w-full h-full border border-gray-200'></iframe>

            </div>
          )
        }


      </div>


      {/* Backdrop for side panel */}
      {isSidePanelOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-5"
          onClick={() => setisSidePanelOpen(false)}
        />
      )}

      {/* Modal for adding collaborators */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border rounded-lg w-96 max-w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Add Collaborators</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <IoIosCloseCircle size={24} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-grow max-h-96">
              {isLoading ? (
                <p className="text-center py-4">Loading users...</p>
              ) : error ? (
                <p className="text-center py-4 text-red-500">{error}</p>
              ) : users.length === 0 ? (
                <p className="text-center py-4">No users found</p>
              ) : (
                <div className="space-y-2">
                  {users.map(user => (
                    <div
                      key={user._id}
                      className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors"
                      onClick={() => toggleUserSelection(user._id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => { }}
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <LuCircleUser size={20} className="mr-2 text-gray-600" />
                        <span className="text-gray-700">{user.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end p-4 border-t">
              <button
                onClick={handleAddCollaborators}
                disabled={selectedUsers.length === 0 || isLoading}
                className={`px-4 py-2 rounded transition-colors ${selectedUsers.length === 0 || isLoading
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
              >
                Add Collaborators
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Project;