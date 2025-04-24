import { createContext, useContext, useState } from 'react';
import { ulid } from 'ulid';

// Chat Context for managing messages
const ChatContext = createContext();
export const useChat = () => useContext(ChatContext);

// Simple text decoder helper (browser equivalent of Node's TextDecoder)
const decodeUTF8 = (bytes) => {
  return new TextDecoder('utf-8').decode(bytes);
};

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [activityId, setActivityId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Hardcoded agent info
  const [agent, setSelectedAgent] = useState({
    name: "Local Development Agent",
    description: "Your local development agent running on localhost:8000",
    _id: "local-agent"
  });

  // Function to send a message to the agent
  const sendMessage = async (prompt) => {
    setLoading(true);
    try {
      // Generate IDs using proper ULID format
      const newActivityId = activityId || ulid();
      const requestId = ulid();
      
      // Format the request body to match the exact format
      const body = {
        query: {
          id: ulid(),  // Valid ULID format
          prompt: prompt
        },
        session: {
          processor_id: "test-processor",
          activity_id: newActivityId,
          request_id: requestId,
          interactions: []
        }
      };
      
      console.log('Sending message to agent:', body);

      // Use fetch with streaming for SSE responses
      return new Promise((resolve, reject) => {
        fetch('/assist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream'
          },
          body: JSON.stringify(body)
        }).then(response => {
          if (!response.ok) {
            throw new Error('Failed to get response from agent');
          }
          
          // Save the activity ID for the next request
          setActivityId(newActivityId);

          // Set up a reader for the stream
          const reader = response.body.getReader();
          let buffer = '';
          let answer = '';
          
          function readStream() {
            reader.read().then(({ done, value }) => {
              if (done) {
                console.log('Stream ended, resolving with answer:', answer);
                resolve(answer.trim() || 'No response received from agent.');
                return;
              }
              
              // Decode the chunk and process it
              const chunk = typeof value === 'string' ? value : decodeUTF8(value);
              console.log('Received chunk:', chunk);
              
              buffer += chunk;
              
              // Split on double-newline - standard SSE frame separator
              const frames = buffer.split('\n\n');
              buffer = frames.pop(); // last piece might be incomplete
              
              for (const frame of frames) {
                if (!frame.trim()) continue; // Skip empty frames
                
                try {
                  const lines = frame.split('\n');
                  if (lines.length < 2) {
                    console.log('Invalid frame format (less than 2 lines):', frame);
                    continue;
                  }
                  
                  const eventLine = lines[0];
                  const dataLine = lines[1];
                  
                  if (!eventLine.startsWith('event: ') || !dataLine.startsWith('data: ')) {
                    console.log('Invalid line format:', eventLine, dataLine);
                    continue;
                  }
                  
                  const type = eventLine.replace('event: ', '');
                  
                  // Extract the content value - handle both formats
                  if (type === 'FINAL_RESPONSE') {
                    // Try to parse as JSON first (for the new format)
                    try {
                      const jsonData = JSON.parse(dataLine.replace('data: ', ''));
                      if (jsonData && jsonData.content !== undefined) {
                        answer += jsonData.content;
                        console.log('Appended to answer (JSON format):', jsonData.content);
                      }
                    } catch (e) {
                      // Fallback to regex for old format
                      const contentMatch = dataLine.match(/content='([^']*)'/) || dataLine.match(/content="([^"]*)"/);
                      if (contentMatch && contentMatch[1]) {
                        const content = contentMatch[1];
                        answer += content;
                        console.log('Appended to answer (text format):', content);
                      }
                    }
                  }
                  
                  if (type === 'done') {
                    console.log('Done event received, resolving with answer:', answer.trim());
                    resolve(answer.trim() || 'No response received from agent.');
                    return;
                  }
                } catch (err) {
                  console.error('Error processing frame:', err);
                }
              }
              
              // Continue reading
              readStream();
            }).catch(err => {
              console.error('Stream error:', err);
              reject(err);
            });
          }
          
          // Start reading the stream
          readStream();
        }).catch(error => {
          console.error('Error calling agent:', error);
          reject(error);
        });
      });
    } catch (error) {
      console.error('Error communicating with agent:', error);
      return 'Error: Could not connect to your local agent. Make sure it\'s running on localhost:8000';
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChatContext.Provider value={{ 
      messages, 
      setMessages, 
      agent, 
      setSelectedAgent,
      sendMessage,
      loading,
      setLoading,
      activityId
    }}>
      {children}
    </ChatContext.Provider>
  );
} 