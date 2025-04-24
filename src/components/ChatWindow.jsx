import { useState, useRef, useEffect } from 'react';
import { useChat } from '../context';

export default function ChatWindow() {
  const { messages, setMessages, agent, sendMessage, loading, setLoading } = useChat();
  const [input, setInput] = useState('');
  const bottomRef = useRef();

  // Scroll to bottom when messages change
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Format message text to handle escape sequences
  const formatMessageText = (text) => {
    if (!text) return '';
    
    // Handle escaped newlines
    let formatted = text.replace(/\\n/g, '\n');
    
    // Handle escaped quotes (both single and double)
    formatted = formatted.replace(/\\"/g, '"');
    formatted = formatted.replace(/\\'/g, "'");
    
    // Fix common broken escape patterns (like "I didn\" that should be "I didn't")
    formatted = formatted.replace(/([A-Za-z])\s?didn\\(\s|$)/g, "$1 didn't$2");
    formatted = formatted.replace(/([A-Za-z])\s?don\\(\s|$)/g, "$1 don't$2");
    formatted = formatted.replace(/([A-Za-z])\s?isn\\(\s|$)/g, "$1 isn't$2");
    formatted = formatted.replace(/([A-Za-z])\s?wasn\\(\s|$)/g, "$1 wasn't$2");
    formatted = formatted.replace(/([A-Za-z])\s?haven\\(\s|$)/g, "$1 haven't$2");
    
    // Handle escaped tabs if present
    formatted = formatted.replace(/\\t/g, '    ');
    
    return formatted;
  };

  async function handleSend() {
    if (!input.trim()) return;
    const prompt = input;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: prompt }]);
    setLoading(true);
    try {
      const answer = await sendMessage(prompt);
      setMessages(m => [...m, { role: 'assistant', text: answer }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', text: 'An error occurred while processing your request.' }]);
    }
    setLoading(false);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{agent.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{agent.description}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white p-4 dark:bg-gray-800">
        <div className="mx-auto max-w-2xl space-y-6">
          {messages.length === 0 && (
            <div className="flex h-32 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-700">
              <p className="text-gray-500 dark:text-gray-400">
                Start a conversation with {agent.name}
              </p>
            </div>
          )}
          
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 shadow-sm ${
                  m.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                {(() => {
                  const lines = formatMessageText(m.text).split('\n');
                  let currentList = null;
                  const result = [];
                  let key = 0;

                  lines.forEach((line, index) => {
                    const trimmedLine = line.trim();
                    const isMainBullet = trimmedLine.startsWith('*');
                    const isSubBullet = trimmedLine.startsWith('+');
                    
                    if (isMainBullet) {
                      // Extract the text after the bullet marker
                      const bulletText = trimmedLine.substring(1).trim();
                      
                      if (!currentList) {
                        // Start a new list
                        currentList = {
                          type: 'list',
                          items: [],
                          key: key++
                        };
                      }
                      
                      // Add a new main bullet point
                      currentList.items.push({
                        text: bulletText,
                        subItems: []
                      });
                    } else if (isSubBullet && currentList) {
                      // Extract the text after the plus symbol
                      const subBulletText = trimmedLine.substring(1).trim();
                      
                      // Add to the sub-items of the last main bullet point
                      if (currentList.items.length > 0) {
                        currentList.items[currentList.items.length - 1].subItems.push(subBulletText);
                      }
                    } else {
                      // If we were building a list, add it to results
                      if (currentList) {
                        result.push(currentList);
                        currentList = null;
                      }
                      
                      // Add regular paragraph
                      result.push({
                        type: 'paragraph',
                        content: line,
                        key: key++
                      });
                    }
                  });
                  
                  // Don't forget the last list if it exists
                  if (currentList) {
                    result.push(currentList);
                  }
                  
                  // Render the content
                  return result.map(item => {
                    if (item.type === 'list') {
                      return (
                        <ul key={item.key} className="list-disc pl-5 mt-2">
                          {item.items.map((listItem, i) => (
                            <li key={i} className="mb-1">
                              {listItem.text}
                              {listItem.subItems.length > 0 && (
                                <ul className="list-[circle] pl-5 mt-1">
                                  {listItem.subItems.map((subItem, j) => (
                                    <li key={j} className="mb-1">{subItem}</li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          ))}
                        </ul>
                      );
                    } else {
                      return (
                        <p key={item.key} className={item.key > 0 ? 'mt-2' : ''}>
                          {item.content}
                        </p>
                      );
                    }
                  });
                })()}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="mx-auto flex max-w-2xl flex-col space-y-1"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:hover:bg-blue-400 dark:focus:ring-offset-gray-900"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
