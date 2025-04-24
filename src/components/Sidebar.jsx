import { useState } from 'react';
import { useChat } from '../context';

export default function Sidebar() {
  const { agent, setSelectedAgent } = useChat();
  const [selectedId, setSelectedId] = useState('local-agent');
  
  // Hardcoded agent - this would normally come from the API
  const agentsList = [
    {
      _id: 'local-agent',
      name: 'Local Development Agent',
      description: 'Your local agent running on localhost:8000'
    }
  ];
  
  const handleAgentClick = (selectedAgent) => {
    setSelectedId(selectedAgent._id);
    if (setSelectedAgent) {
      setSelectedAgent(selectedAgent);
    }
  };
  
  return (
    <div className="flex flex-col h-full w-64 flex-shrink-0 border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="flex h-14 items-center border-b border-gray-200 px-4 dark:border-gray-700">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Inter-Chat</h1>
      </div>
      
      <div className="flex-1 p-4">
        <h2 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Available Agents</h2>
        <div className="space-y-2">
          {agentsList.map((agent) => (
            <button
              key={agent._id}
              onClick={() => handleAgentClick(agent)}
              className={`flex w-full items-center justify-between rounded-lg p-2 text-left transition-colors ${
                selectedId === agent._id
                  ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <div>
                <div className="font-medium">{agent.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {agent.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="border-t border-gray-200 p-4 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Powered by Inter-Chat
        </div>
      </div>
    </div>
  );
}
