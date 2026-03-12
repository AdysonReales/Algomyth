import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Trash2, CheckSquare, Square, X, Search } from 'lucide-react';

interface MessagesPanelProps {
  userData: any;
  onSearch: (query: string) => void;
  chatTarget?: any;
  clearChatTarget?: () => void;
}

export const MessagesPanel = ({ userData, onSearch, chatTarget, clearChatTarget }: MessagesPanelProps) => {
  const [inbox, setInbox] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Trash Mode States
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedForTrash, setSelectedForTrash] = useState<string[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 1. Initial Load & Real-time Polling
  useEffect(() => {
    fetchInbox();
    const interval = setInterval(fetchInbox, 5000); 
    return () => clearInterval(interval);
  }, [selectedUser]); 

  // 2. Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // 3. Handle Redirect from "Send Message" Modal
  useEffect(() => {
    if (chatTarget && userData) {
      if (chatTarget._id === userData._id) {
        if (clearChatTarget) clearChatTarget();
        return;
      }
      setSelectedUser(chatTarget);
      const history = inbox.filter(m => 
        m.sender?._id === chatTarget._id || m.receiver?._id === chatTarget._id
      ).reverse();
      setChatHistory(history);
      if (clearChatTarget) clearChatTarget();
    }
  }, [chatTarget, inbox, userData, clearChatTarget]);

  const fetchInbox = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/inbox?t=${Date.now()}`);
      setInbox(res.data);
      setLoading(false);

      if (selectedUser) {
        const history = res.data.filter((m: any) => 
          m.sender?._id === selectedUser._id || m.receiver?._id === selectedUser._id
        ).reverse();
        setChatHistory(history);
      }
    } catch (err) {
      console.error("Inbox load failed", err);
      setLoading(false);
    }
  };

  

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || !selectedUser) return;

    try {
      setNewMessage('');
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/messages/send`, {
        receiverId: selectedUser._id,
        content: text
      });
      
      const sentMsg = { ...res.data, sender: userData, receiver: selectedUser };
      setChatHistory(prev => [...prev, sentMsg]);
      fetchInbox(); 
    } catch (err) {
      alert("Failed to send. Try again.");
    }
  };

  const markAsRead = async (senderId: string) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/messages/clear-alerts`, { fromUser: senderId });
    } catch (err) {
      console.error("Failed to mark as read");
    }
  };

  const uniqueConvos = Array.from(new Set(
    inbox
      .map(m => (m.sender?._id === userData?._id ? m.receiver?._id : m.sender?._id))
      .filter(id => id && id !== userData?._id)
  )).map(id => inbox.find(m => m.sender?._id === id || m.receiver?._id === id));

  const toggleTrashSelection = (userId: string) => {
    setSelectedForTrash(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleTrashMessages = async () => {
    if (selectedForTrash.length === 0) return;
    if (window.confirm(`Delete ${selectedForTrash.length} conversation(s)?`)) {
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/messages/delete-bulk`, { 
          targetUserIds: selectedForTrash 
        });
        setSelectedForTrash([]);
        setIsEditMode(false);
        if (selectedUser && selectedForTrash.includes(selectedUser._id)) setSelectedUser(null);
        fetchInbox();
      } catch (err) {
        alert("Failed to delete messages");
      }
    }
  };

  const getUsernameColor = (charIndex: any) => {
    const idx = Number(charIndex || 1);
    const mapping: Record<number, string> = {
      1: 'text-amber-800',   // Knight (Brown)
      2: 'text-blue-700',    // Mage (Blue)
      3: 'text-emerald-700', // Rogue (Green)
      4: 'text-amber-800',   // Knight
      5: 'text-blue-700',    // Mage
      6: 'text-emerald-700', // Rogue
    };
    return mapping[idx] || 'text-[#5d3a1a]';
  };

  return (
    <div className="h-[600px] flex bg-[#fdf6e3] border-4 border-[#5d3a1a]" style={{ fontFamily: "'VT323', monospace" }}>
      
      {/* 📁 SIDEBAR */}
      <div className="w-80 border-r-4 border-[#5d3a1a] bg-[#d4a373] flex flex-col shadow-lg">
        <div className="p-3 bg-[#b88a5f] border-b-4 border-[#5d3a1a]">
          <div className="relative flex items-center">
            <input 
              type="text" 
              placeholder="Search @player..." 
              className="w-full p-2 pr-10 bg-[#f4e4bc] border-4 border-[#5d3a1a] text-xl outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onSearch(searchQuery); }}
            />
            <Search className="absolute right-3 text-[#5d3a1a] cursor-pointer" size={20} onClick={() => onSearch(searchQuery)} />
          </div>
        </div>

        <div className="p-4 bg-[#5d3a1a] text-white flex justify-between items-center">
          <span className="text-2xl uppercase font-bold tracking-widest">{loading ? "..." : "Inbox"}</span>
          <button onClick={() => { setIsEditMode(!isEditMode); setSelectedForTrash([]); }}>
            {isEditMode ? <X size={24} /> : <Trash2 size={24} />}
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {uniqueConvos.length === 0 && !loading ? (
             <div className="p-8 text-center text-[#3e2723] opacity-40 italic uppercase font-bold">No archives found.</div>
          ) : (
            uniqueConvos.map((msg: any) => {
              const otherUser = msg.sender?._id === userData?._id ? msg.receiver : msg.sender;
              if (!otherUser) return null;

              const isSelected = selectedForTrash.includes(otherUser._id);
              const isUnread = !msg.isRead && msg.receiver?._id === userData?._id;

              return (
                <div 
                  key={otherUser._id} 
                  className={`relative border-b-2 border-[#5d3a1a]/20 cursor-pointer transition-all
                    ${selectedUser?._id === otherUser._id ? 'bg-[#f4e4bc]' : 'hover:bg-[#f4e4bc]/50'}
                    ${isSelected ? 'bg-red-200' : ''}
                  `}
                  onClick={() => {
                    if (isEditMode) {
                      toggleTrashSelection(otherUser._id);
                    } else {
                      setSelectedUser(otherUser);
                      markAsRead(otherUser._id);
                      setChatHistory(inbox.filter(m => m.sender?._id === otherUser._id || m.receiver?._id === otherUser._id).reverse());
                    }
                  }}
                >
                  <div className="p-4 flex items-center gap-3">
                    {isEditMode && (
                      <div className="text-[#5d3a1a]">
                        {isSelected ? <CheckSquare size={24} /> : <Square size={24} />}
                      </div>
                    )}
                    <div className="relative">
                      <div className="w-12 h-12 bg-[#b88a5f] border-2 border-[#5d3a1a] flex items-center justify-center text-2xl">👤</div>
                      {isUnread && <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 border-2 border-white rounded-full animate-pulse" />}
                    </div>
                    <div className="text-left overflow-hidden text-[#3e2723]">
                      <div className={`text-xl truncate ${isUnread ? 'font-black text-black' : 'font-bold'}`}>@{otherUser.username}</div>
                      <div className="text-sm truncate opacity-70">{msg.content}</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {isEditMode && selectedForTrash.length > 0 && (
          <button onClick={handleTrashMessages} className="p-4 bg-red-600 text-white text-2xl uppercase font-bold border-t-4 border-black">Trash Archives ({selectedForTrash.length})</button>
        )}
      </div>

      {/* 💬 CHAT WINDOW */}
      <div className="flex-1 flex flex-col bg-[#fdf6e3]/50">
        {selectedUser ? (
          <>
            <div className="p-4 border-b-4 border-[#5d3a1a] bg-[#f4e4bc] text-2xl font-bold uppercase text-[#3e2723]">
              To: @{selectedUser.username}
            </div>
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {chatHistory.map((m, i) => {
  const isMe = m.sender?._id === userData?._id || m.sender === userData?._id;
  // Determine whose data to use for the name and color
  const senderData = isMe ? userData : selectedUser;

  return (
    <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
      {/* CLASS-COLORED USERNAME */}
      <span className={`text-sm font-black uppercase mb-1 ${getUsernameColor(senderData?.characterIndex)}`}>
        {senderData?.username}
      </span>

      <div className={`max-w-[80%] p-3 border-4 border-[#5d3a1a] ${isMe ? 'bg-[#76c442] text-white shadow-md' : 'bg-white text-[#3e2723] shadow-sm'}`}>
        <div className="text-xl leading-tight">{m.content}</div>
        <div className={`text-[10px] mt-1 opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>
          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
})}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t-4 border-[#5d3a1a] bg-[#f4e4bc] flex gap-3">
              <input 
                value={newMessage} 
                onChange={e => setNewMessage(e.target.value)} 
                className="flex-1 p-3 border-4 border-[#5d3a1a] bg-white text-xl outline-none shadow-inner" 
                placeholder="Write message..." 
              />
              <button className="bg-[#76c442] border-4 border-[#3e2723] px-8 text-white font-bold uppercase hover:scale-105 transition-transform shadow-[0_4px_0_#3e2723] active:translate-y-1 active:shadow-none">Send</button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-4xl font-bold uppercase text-[#5d3a1a]">Select a chat</div>
        )}
      </div>
    </div>
  );
};