import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWellMindStore } from '@/stores/wellmindStore';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'buddy';
  timestamp: Date;
}

type BuddyExpression = 'idle' | 'happy' | 'thinking' | 'talking' | 'excited' | 'sad' | 'sleepy' | 'love';

// Rule-based responses with keywords
const responseRules: { keywords: string[]; responses: string[]; expression: BuddyExpression }[] = [
  {
    keywords: ['sad', 'unhappy', 'depressed', 'down', 'crying', 'cry'],
    responses: [
      "I'm sorry you're feeling this way. Remember, it's okay to not be okay sometimes. I'm here for you! 💚",
      "Sending you a big virtual hug! Would you like to try a breathing exercise together?",
      "Your feelings are valid. Let's take things one step at a time. What's one small thing that might help?",
    ],
    expression: 'sad',
  },
  {
    keywords: ['anxious', 'worried', 'nervous', 'panic', 'scared', 'fear'],
    responses: [
      "Take a deep breath with me... In... and out... You're safe here. 🌿",
      "Anxiety can feel overwhelming, but you're stronger than you know. Let's ground ourselves together.",
      "I'm right here with you. Try naming 5 things you can see around you. It helps!",
    ],
    expression: 'thinking',
  },
  {
    keywords: ['happy', 'great', 'good', 'amazing', 'wonderful', 'excited', 'joy'],
    responses: [
      "That's wonderful! Your happiness makes me happy too! 🌟",
      "Yay! I love seeing you in such good spirits! Keep shining!",
      "This is amazing news! Let's celebrate this positive moment together!",
    ],
    expression: 'excited',
  },
  {
    keywords: ['tired', 'exhausted', 'sleepy', 'fatigue', 'drained'],
    responses: [
      "Rest is so important. Maybe it's time for a little break? You deserve it! 😴",
      "Your body is telling you something. How about some gentle self-care?",
      "Being tired is your body's way of asking for rest. Listen to it!",
    ],
    expression: 'sleepy',
  },
  {
    keywords: ['stressed', 'overwhelmed', 'pressure', 'too much'],
    responses: [
      "I hear you. Let's break things down into smaller, manageable pieces. You've got this!",
      "Stress can feel heavy, but you don't have to carry it alone. I'm here! 🌈",
      "One thing at a time. What's the most important thing right now?",
    ],
    expression: 'thinking',
  },
  {
    keywords: ['love', 'thank', 'appreciate', 'grateful'],
    responses: [
      "Aww, I love you too! You're the best! 💕",
      "You just made my day! Thank YOU for being you!",
      "Gratitude is such a beautiful thing. You're spreading good vibes!",
    ],
    expression: 'love',
  },
  {
    keywords: ['hello', 'hi', 'hey', 'howdy', 'hola'],
    responses: [
      "Hey there, friend! So happy to see you! 👋",
      "Hello! I've been waiting for you! How can I help today?",
      "Hi hi hi! *bounces excitedly* What's on your mind?",
    ],
    expression: 'excited',
  },
  {
    keywords: ['help', 'advice', 'what should', 'suggest'],
    responses: [
      "I'm here to help! Tell me more about what's going on. 🤔",
      "Let's figure this out together. What specific situation are you dealing with?",
      "I'd love to help! Share what's troubling you and we'll work through it.",
    ],
    expression: 'thinking',
  },
];

const defaultResponses = [
  "I hear you. Tell me more about that! 💭",
  "That's interesting! How does that make you feel?",
  "I'm listening. You can always share more with me!",
  "Thanks for sharing that with me. I'm here for you! 🌟",
  "I appreciate you opening up. What else is on your mind?",
];

const getResponse = (message: string): { text: string; expression: BuddyExpression } => {
  const lowerMessage = message.toLowerCase();
  
  for (const rule of responseRules) {
    if (rule.keywords.some(keyword => lowerMessage.includes(keyword))) {
      const response = rule.responses[Math.floor(Math.random() * rule.responses.length)];
      return { text: response, expression: rule.expression };
    }
  }
  
  return {
    text: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
    expression: 'happy',
  };
};

// Buddy character expressions (Talking Tom style)
const buddyExpressions: Record<BuddyExpression, { face: string; body: string }> = {
  idle: { face: '😊', body: '🧸' },
  happy: { face: '😄', body: '🧸' },
  thinking: { face: '🤔', body: '🧸' },
  talking: { face: '😮', body: '🧸' },
  excited: { face: '🤩', body: '🧸' },
  sad: { face: '🥺', body: '🧸' },
  sleepy: { face: '😴', body: '🧸' },
  love: { face: '🥰', body: '🧸' },
};

interface MindBuddyChatProps {
  onClose: () => void;
}

export const MindBuddyChat = ({ onClose }: MindBuddyChatProps) => {
  const { pet, addCoins, addPetExperience } = useWellMindStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hi! I'm ${pet.name}! I'm so happy to talk to you! How are you feeling today? 💚`,
      sender: 'buddy',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [expression, setExpression] = useState<BuddyExpression>('happy');
  const [isTalking, setIsTalking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Animate talking
  useEffect(() => {
    if (isTalking) {
      const interval = setInterval(() => {
        setExpression(prev => prev === 'talking' ? 'happy' : 'talking');
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isTalking]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setExpression('thinking');

    // Simulate AI thinking
    setTimeout(() => {
      const { text, expression: responseExpression } = getResponse(input);
      setIsTyping(false);
      setIsTalking(true);
      setExpression(responseExpression);
      
      const buddyMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: text,
        sender: 'buddy',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, buddyMessage]);
      
      // Earn coins for chatting
      if (messages.length % 3 === 0) {
        addCoins(2);
        addPetExperience(5);
      }
      
      // Stop talking animation after message is displayed
      setTimeout(() => {
        setIsTalking(false);
        setExpression('happy');
      }, 2000);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl"
            animate={{ scale: isTalking ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.3, repeat: isTalking ? Infinity : 0 }}
          >
            {buddyExpressions[expression].face}
          </motion.div>
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              {pet.name}
              <Sparkles className="w-4 h-4 text-primary" />
            </h3>
            <p className="text-xs text-muted-foreground">
              {isTyping ? 'Thinking...' : isTalking ? 'Speaking...' : 'Online'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="h-8 w-8"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Buddy Character Display */}
      <div className="flex-shrink-0 p-4 bg-gradient-to-b from-primary/5 to-transparent">
        <motion.div 
          className="flex flex-col items-center"
          animate={{ 
            y: isTyping ? [0, -5, 0] : 0,
          }}
          transition={{ duration: 0.5, repeat: isTyping ? Infinity : 0 }}
        >
          <motion.div
            className="text-8xl mb-2"
            animate={{
              scale: isTalking ? [1, 1.05, 1] : [1, 1.02, 1],
              rotate: expression === 'excited' ? [-2, 2, -2] : 0,
            }}
            transition={{
              scale: { duration: 0.5, repeat: Infinity },
              rotate: { duration: 0.3, repeat: Infinity },
            }}
          >
            {buddyExpressions[expression].face}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-muted-foreground bg-card/80 px-3 py-1 rounded-full"
          >
            Level {pet.level} • {pet.name}
          </motion.div>
        </motion.div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`flex gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  message.sender === 'buddy'
                    ? 'bg-primary/10 text-foreground rounded-tl-sm'
                    : 'bg-primary text-primary-foreground rounded-tr-sm'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2"
          >
            <div className="bg-primary/10 p-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                <motion.span 
                  className="w-2 h-2 bg-primary/50 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.span 
                  className="w-2 h-2 bg-primary/50 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.span 
                  className="w-2 h-2 bg-primary/50 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
        {['How are you?', "I'm feeling anxious", "I'm happy today!", 'Tell me something nice'].map((text) => (
          <Button
            key={text}
            variant="outline"
            size="sm"
            onClick={() => {
              setInput(text);
              setTimeout(handleSend, 100);
            }}
            className="whitespace-nowrap text-xs rounded-full"
          >
            {text}
          </Button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-background safe-area-bottom">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Talk to ${pet.name}...`}
            className="flex-1 px-4 py-3 bg-muted rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            size="icon"
            className="rounded-full h-12 w-12"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
