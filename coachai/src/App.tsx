import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';
import { VoiceAgent } from './voice-agent';
import { VoiceIndicator } from './components/VoiceIndicator';
import './style.css';

const voiceAgent = new VoiceAgent();

type VoiceState = 'idle' | 'listening' | 'user-speaking' | 'ai-speaking' | 'connecting';

export const App: React.FC = () => {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [status, setStatus] = useState('Not connected');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const aiTranscriptRef = useRef('');

  const saveMessage = async (role: 'user' | 'assistant', content: string) => {
    if (!user || !content) return;
    console.log(`Saving ${role} message: ${content}`);
    const { error } = await supabase.from('messages').insert({
      user_id: user.id,
      role,
      content,
    });
    if (error) {
      console.error('Error saving message:', error);
    }
  };

  useEffect(() => {
    const fetchProfiles = async () => {
      console.log('Attempting to fetch profiles from Supabase...');
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) {
        console.error('Error fetching profiles:', error);
      } else {
        console.log('Successfully fetched profiles:', data);
      }
    };

    fetchProfiles();
  }, []);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setVoiceState('connecting');
      setStatus('Connecting...');
      
      await voiceAgent.connect();
      
      setIsConnected(true);
      setIsConnecting(false);
      setVoiceState('listening');
      setStatus('Connected - You can now talk to your productivity coach!');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user is logged in. Messages will not be saved.');
        setStatus('Warning: No user logged in. Conversation will not be saved.');
      }
      setUser(user);
      
      // Set up event listeners for voice activity
      const session = voiceAgent.getSession();
      
      try {
        // Log all available events for debugging
        console.log('Available session events:', Object.getOwnPropertyNames(session));
        
        // User speech detection
        session.on('input_audio_buffer.speech_started' as any, (event: any) => {
          console.log('🎤 User started speaking', event);
          setVoiceState('user-speaking');
        });
        
        session.on('input_audio_buffer.speech_stopped' as any, (event: any) => {
          console.log('🔇 User stopped speaking', event);
          setVoiceState('listening');
        });
        
        // AI speech detection  
        session.on('response.audio.delta' as any, (event: any) => {
          console.log('🤖 AI speaking delta', event);
          setVoiceState('ai-speaking');
        });
        
        session.on('response.audio.done' as any, (event: any) => {
          console.log('✅ AI finished speaking', event);
          setVoiceState('listening');
          saveMessage('assistant', aiTranscriptRef.current);
          aiTranscriptRef.current = ''; // Reset for next message
        });

        // Additional events for better detection
        session.on('conversation.item.input_audio_transcription.completed' as any, (event: { transcript: string }) => {
          console.log('📝 User speech transcription completed', event);
          saveMessage('user', event.transcript);
        });

        session.on('response.audio_transcript.delta' as any, (event: { transcript: string }) => {
          // console.log('📝 AI audio transcript delta', event); // Too noisy
          aiTranscriptRef.current += event.transcript;
        });

        // Listen to all events for debugging
        const originalEmit = session.emit;
        // @ts-expect-error - This is a monkey-patch for debugging and the type signature is intentionally simplified.
        session.emit = function(eventName: string, ...args: any[]) {
          console.log('🔔 Event emitted:', eventName, args);
          return (originalEmit as any).apply(this, [eventName, ...args]);
        };
        
      } catch (error) {
        console.log('Event listeners setup - some events may not be available:', error);
      }
      
    } catch (error) {
      console.error('Connection failed:', error);
      setStatus(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsConnecting(false);
      setVoiceState('idle');
    }
  };

  const handleDisconnect = async () => {
    try {
      await voiceAgent.disconnect();
      
      setIsConnected(false);
      setVoiceState('idle');
      setStatus('Disconnected');
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  return (
    <div>
      <h1>Productivity Coach Voice AI</h1>
      <div className="card">
        <VoiceIndicator state={voiceState} />
        <div className="controls">
          <button 
            onClick={handleConnect}
            disabled={isConnecting || isConnected}
            type="button"
          >
            Connect
          </button>
          <button 
            onClick={handleDisconnect}
            disabled={!isConnected}
            type="button"
          >
            Disconnect
          </button>
        </div>
        <div className="status">
          <p>{status}</p>
        </div>
      </div>
      <p className="read-the-docs">
        Click "Connect" to start chatting with your productivity coach
      </p>
    </div>
  );
};