import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft, 
  Users, 
  MessageCircle, 
  Send, 
  User, 
  Eye, 
  EyeOff,
  Circle,
  Clock
} from 'lucide-react';
import { usePeerChatStore } from '@/stores/peerChatStore';
import { useWellMindStore } from '@/stores/wellmindStore';
import { toast } from 'sonner';
import type { PeerUser, PeerChat } from '@/types/wellmind';

interface PeerSupportChatProps {
  onClose: () => void;
}

type View = 'setup' | 'peers' | 'chat';

export const PeerSupportChat = ({ onClose }: PeerSupportChatProps) => {
  const user = useWellMindStore((state) => state.user);
  const { 
    peerProfile, 
    availablePeers, 
    chats,
    createPeerProfile, 
    updatePeerProfile,
    loadAvailablePeers,
    startChat,
    sendMessage,
    getChat,
  } = usePeerChatStore();

  const [view, setView] = useState<View>(peerProfile ? 'peers' : 'setup');
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [bio, setBio] = useState('');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAvailablePeers();
  }, [loadAvailablePeers]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatId, chats]);

  const handleSetupComplete = () => {
    if (!displayName.trim() && !isAnonymous) {
      toast.error('Please enter a display name');
      return;
    }
    createPeerProfile(displayName || 'Anonymous', isAnonymous, bio);
    toast.success('Profile created! You can now connect with peer supporters.');
    setView('peers');
  };

  const handleStartChat = (peer: PeerUser) => {
    const chatId = startChat(peer.id);
    if (chatId) {
      setActiveChatId(chatId);
      setView('chat');
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeChatId) return;
    sendMessage(activeChatId, messageInput);
    setMessageInput('');
  };

  const activeChat = activeChatId ? getChat(activeChatId) : null;
  const chatPeer = activeChat 
    ? availablePeers.find((p) => activeChat.participants.includes(p.id))
    : null;

  const getStatusColor = (status: PeerUser['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-amber-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-muted';
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Setup View
  if (view === 'setup') {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur px-5 py-4 border-b border-border">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-foreground">Set Up Your Profile</h1>
          </div>
        </header>

        <main className="px-5 py-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-6 shadow-soft"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-coral/20 flex items-center justify-center">
                {isAnonymous ? (
                  <EyeOff className="h-8 w-8 text-coral" />
                ) : (
                  <User className="h-8 w-8 text-coral" />
                )}
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Choose Your Identity</h2>
                <p className="text-sm text-muted-foreground">
                  Decide how others will see you
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 bg-sage-light/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <EyeOff className="h-5 w-5 text-sage" />
                  <div>
                    <p className="font-medium text-foreground">Stay Anonymous</p>
                    <p className="text-xs text-muted-foreground">
                      Your real name won't be shown
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
              </div>

              {!isAnonymous && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Display Name
                  </label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="How should others call you?"
                    className="bg-background"
                  />
                </motion.div>
              )}

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Short Bio (Optional)
                </label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a little about yourself or why you're here..."
                  className="bg-background resize-none"
                  rows={3}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-honey-light/50 rounded-2xl p-5"
          >
            <h3 className="font-medium text-foreground mb-2">💡 About Peer Support</h3>
            <p className="text-sm text-muted-foreground">
              Connect with trained peer supporters who understand what you're going through. 
              All conversations are private and confidential. Remember, this is not a 
              replacement for professional help.
            </p>
          </motion.div>

          <Button
            onClick={handleSetupComplete}
            className="w-full py-6 rounded-2xl bg-coral hover:bg-coral/90 text-white"
          >
            <Users className="h-5 w-5 mr-2" />
            Find Peer Supporters
          </Button>
        </main>
      </div>
    );
  }

  // Chat View
  if (view === 'chat' && activeChat && chatPeer) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur px-5 py-4 border-b border-border">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setView('peers')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 flex-1">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-coral/20 flex items-center justify-center">
                  {chatPeer.isAnonymous ? (
                    <EyeOff className="h-5 w-5 text-coral" />
                  ) : (
                    <User className="h-5 w-5 text-coral" />
                  )}
                </div>
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(chatPeer.status)}`} />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">{chatPeer.displayName}</h1>
                <p className="text-xs text-muted-foreground capitalize">{chatPeer.status}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {activeChat.messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 rounded-full bg-sage-light mx-auto mb-4 flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-sage" />
              </div>
              <p className="text-muted-foreground">
                Start the conversation. Share what's on your mind.
              </p>
            </motion.div>
          )}

          <AnimatePresence>
            {activeChat.messages.map((message, index) => {
              const isOwn = message.senderId === peerProfile?.id;
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      isOwn
                        ? 'bg-coral text-white rounded-br-md'
                        : 'bg-sage-light text-foreground rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-muted-foreground'}`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </main>

        <footer className="sticky bottom-0 bg-background border-t border-border px-5 py-4">
          <div className="flex gap-3">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-card"
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              className="bg-coral hover:bg-coral/90 text-white"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </footer>
      </div>
    );
  }

  // Peers List View
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur px-5 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">Peer Supporters</h1>
            <p className="text-xs text-muted-foreground">
              {peerProfile?.isAnonymous ? 'Chatting as Anonymous' : `Chatting as ${peerProfile?.displayName}`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('setup')}
            className="text-xs"
          >
            <Eye className="h-4 w-4 mr-1" />
            Edit Profile
          </Button>
        </div>
      </header>

      <main className="px-5 py-6 space-y-4">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground"
        >
          Connect with someone who understands. All conversations are confidential.
        </motion.p>

        {/* Active Chats */}
        {chats.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-sm font-semibold text-foreground mb-3">Your Conversations</h2>
            <div className="space-y-3">
              {chats.map((chat) => {
                const peer = availablePeers.find((p) => chat.participants.includes(p.id));
                if (!peer) return null;
                const lastMessage = chat.messages[chat.messages.length - 1];
                
                return (
                  <motion.button
                    key={chat.id}
                    onClick={() => {
                      setActiveChatId(chat.id);
                      setView('chat');
                    }}
                    className="w-full bg-card rounded-xl p-4 shadow-soft flex items-center gap-4 hover:shadow-card transition-all text-left"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-coral/20 flex items-center justify-center">
                        {peer.isAnonymous ? (
                          <EyeOff className="h-6 w-6 text-coral" />
                        ) : (
                          <User className="h-6 w-6 text-coral" />
                        )}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${getStatusColor(peer.status)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{peer.displayName}</p>
                      {lastMessage && (
                        <p className="text-sm text-muted-foreground truncate">
                          {lastMessage.content}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(chat.lastMessageAt)}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Available Peers */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-sm font-semibold text-foreground mb-3">Available Supporters</h2>
          <div className="space-y-3">
            {availablePeers.map((peer, index) => (
              <motion.div
                key={peer.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl p-4 shadow-soft"
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-sage-light flex items-center justify-center">
                      {peer.isAnonymous ? (
                        <EyeOff className="h-7 w-7 text-sage" />
                      ) : (
                        <User className="h-7 w-7 text-sage" />
                      )}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-card ${getStatusColor(peer.status)}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{peer.displayName}</h3>
                      <span className={`text-xs capitalize px-2 py-0.5 rounded-full ${
                        peer.status === 'online' ? 'bg-green-100 text-green-700' :
                        peer.status === 'away' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {peer.status}
                      </span>
                    </div>
                    {peer.bio && (
                      <p className="text-sm text-muted-foreground mb-2">{peer.bio}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {peer.supportTopics.map((topic) => (
                        <span
                          key={topic}
                          className="text-xs px-2 py-1 bg-sage-light/50 text-sage rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleStartChat(peer)}
                      disabled={peer.status === 'busy'}
                      className="bg-coral hover:bg-coral/90 text-white"
                    >
                      <MessageCircle className="h-4 w-4 mr-1.5" />
                      Start Chat
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default PeerSupportChat;
