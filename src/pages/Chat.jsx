import ChatWindow from '../components/ChatWindow.jsx';
import Sidebar from '../components/Sidebar.jsx';

export default function Chat() {
  // Mock logout function (non-functional)
  const handleLogout = () => {
    alert('This is a demo version without authentication. Logout is not functional.');
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="relative flex h-full w-full flex-1 flex-col">
        <div className="absolute right-4 top-4 z-10">
          <button 
            onClick={handleLogout}
            className="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-600 dark:hover:bg-red-700"
          >
            Logout
          </button>
        </div>
        
        <div className="flex h-full w-full max-w-4xl flex-1 flex-col px-4 mx-auto">
          <ChatWindow />
        </div>
      </div>
    </div>
  );
}
