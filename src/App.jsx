import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChatProvider } from './context';
import Chat from './pages/Chat';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <ChatProvider>
        <Routes>
          <Route path="/" element={<Chat />} />
        </Routes>
      </ChatProvider>
    </BrowserRouter>
  );
}