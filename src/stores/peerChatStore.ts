import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PeerUser, PeerChat, PeerMessage } from '@/types/wellmind';

interface PeerChatState {
  // Current user's peer profile
  peerProfile: PeerUser | null;
  
  // Available peers to chat with
  availablePeers: PeerUser[];
  
  // Active chats
  chats: PeerChat[];
  
  // Actions
  createPeerProfile: (displayName: string, isAnonymous: boolean, bio?: string, supportTopics?: string[]) => void;
  updatePeerProfile: (updates: Partial<PeerUser>) => void;
  
  // Simulated peers for demo
  loadAvailablePeers: () => void;
  
  // Chat actions
  startChat: (peerId: string) => string;
  sendMessage: (chatId: string, content: string) => void;
  getChat: (chatId: string) => PeerChat | undefined;
  getChatWithPeer: (peerId: string) => PeerChat | undefined;
  
  // Simulate receiving messages
  simulatePeerResponse: (chatId: string) => void;
}

// Simulated peer supporters
const SIMULATED_PEERS: PeerUser[] = [
  {
    id: 'peer-1',
    displayName: 'Alex',
    isAnonymous: false,
    status: 'online',
    bio: 'Here to listen and support. Been through anxiety myself.',
    supportTopics: ['Anxiety', 'Stress', 'Work-life balance'],
    joinedAt: new Date('2024-01-15'),
  },
  {
    id: 'peer-2',
    displayName: 'Anonymous Helper',
    isAnonymous: true,
    status: 'online',
    bio: 'Sometimes talking to a stranger helps. I\'m here for you.',
    supportTopics: ['Depression', 'Loneliness', 'Life transitions'],
    joinedAt: new Date('2024-02-20'),
  },
  {
    id: 'peer-3',
    displayName: 'Sam',
    isAnonymous: false,
    status: 'away',
    bio: 'Student counselor. Happy to chat about anything.',
    supportTopics: ['Academic stress', 'Relationships', 'Self-esteem'],
    joinedAt: new Date('2024-03-10'),
  },
  {
    id: 'peer-4',
    displayName: 'Jordan',
    isAnonymous: false,
    status: 'online',
    bio: 'Mental health advocate. Let\'s talk!',
    supportTopics: ['General support', 'Mindfulness', 'Coping strategies'],
    joinedAt: new Date('2024-04-05'),
  },
  {
    id: 'peer-5',
    displayName: 'Anonymous Listener',
    isAnonymous: true,
    status: 'busy',
    bio: 'No judgment here. Share what\'s on your mind.',
    supportTopics: ['Family issues', 'Grief', 'Personal growth'],
    joinedAt: new Date('2024-05-12'),
  },
];

// Simulated responses for demo
const PEER_RESPONSES = [
  "I hear you. That sounds really tough. How long have you been feeling this way?",
  "Thank you for sharing that with me. It takes courage to open up.",
  "I've been through something similar. You're not alone in this.",
  "That's completely valid. Your feelings matter.",
  "It sounds like you're carrying a lot right now. What helps you cope usually?",
  "I'm here for you. Take your time, no rush.",
  "Sometimes just talking about it can help. I'm listening.",
  "What would make today a little bit better for you?",
  "Remember, it's okay to not be okay sometimes.",
  "You're doing great by reaching out. That's a big step.",
];

export const usePeerChatStore = create<PeerChatState>()(
  persist(
    (set, get) => ({
      peerProfile: null,
      availablePeers: [],
      chats: [],

      createPeerProfile: (displayName, isAnonymous, bio, supportTopics) => {
        const profile: PeerUser = {
          id: `user-${crypto.randomUUID()}`,
          displayName: isAnonymous ? 'Anonymous' : displayName,
          isAnonymous,
          status: 'online',
          bio,
          supportTopics: supportTopics || [],
          joinedAt: new Date(),
        };
        set({ peerProfile: profile });
      },

      updatePeerProfile: (updates) => {
        set((state) => ({
          peerProfile: state.peerProfile 
            ? { ...state.peerProfile, ...updates }
            : null,
        }));
      },

      loadAvailablePeers: () => {
        set({ availablePeers: SIMULATED_PEERS });
      },

      startChat: (peerId) => {
        const existingChat = get().getChatWithPeer(peerId);
        if (existingChat) return existingChat.id;

        const peer = get().availablePeers.find((p) => p.id === peerId);
        const profile = get().peerProfile;
        
        if (!peer || !profile) return '';

        const chat: PeerChat = {
          id: `chat-${crypto.randomUUID()}`,
          participants: [profile.id, peerId],
          participantNames: [profile.displayName, peer.displayName],
          messages: [],
          createdAt: new Date(),
          lastMessageAt: new Date(),
        };

        set((state) => ({
          chats: [...state.chats, chat],
        }));

        return chat.id;
      },

      sendMessage: (chatId, content) => {
        const profile = get().peerProfile;
        if (!profile) return;

        const message: PeerMessage = {
          id: `msg-${crypto.randomUUID()}`,
          chatId,
          senderId: profile.id,
          senderName: profile.displayName,
          content,
          timestamp: new Date(),
        };

        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [...chat.messages, message],
                  lastMessageAt: new Date(),
                }
              : chat
          ),
        }));

        // Simulate peer response after a delay
        setTimeout(() => {
          get().simulatePeerResponse(chatId);
        }, 2000 + Math.random() * 3000);
      },

      getChat: (chatId) => {
        return get().chats.find((c) => c.id === chatId);
      },

      getChatWithPeer: (peerId) => {
        return get().chats.find((c) => c.participants.includes(peerId));
      },

      simulatePeerResponse: (chatId) => {
        const chat = get().getChat(chatId);
        const profile = get().peerProfile;
        if (!chat || !profile) return;

        const peerId = chat.participants.find((p) => p !== profile.id);
        const peer = get().availablePeers.find((p) => p.id === peerId);
        if (!peer) return;

        const response: PeerMessage = {
          id: `msg-${crypto.randomUUID()}`,
          chatId,
          senderId: peer.id,
          senderName: peer.displayName,
          content: PEER_RESPONSES[Math.floor(Math.random() * PEER_RESPONSES.length)],
          timestamp: new Date(),
        };

        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  messages: [...c.messages, response],
                  lastMessageAt: new Date(),
                }
              : c
          ),
        }));
      },
    }),
    {
      name: 'wellmind-peer-chat',
    }
  )
);
