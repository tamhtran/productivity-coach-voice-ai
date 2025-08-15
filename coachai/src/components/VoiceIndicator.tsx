import React from 'react';
import { Mic, Phone } from 'lucide-react';

interface VoiceIndicatorProps {
  state: 'idle' | 'listening' | 'user-speaking' | 'ai-speaking' | 'connecting';
}

export const VoiceIndicator: React.FC<VoiceIndicatorProps> = ({ state }) => {
  const getStatusText = () => {
    switch (state) {
      case 'idle':
        return 'Ready to connect';
      case 'connecting':
        return 'Connecting...';
      case 'listening':
        return 'Listening - You can speak now';
      case 'user-speaking':
        return 'You are speaking...';
      case 'ai-speaking':
        return 'AI is speaking...';
    }
  };

  const getIcon = () => {
    if (state === 'idle' || state === 'connecting') {
      return <Phone size={32} className="icon" />;
    }
    return <Mic size={32} className="icon" />;
  };

  return (
    <div className="voice-indicator">
      <div className={`circle ${state}`}>
        <div className="inner-circle">
          {getIcon()}
        </div>
        {state === 'user-speaking' && (
          <>
            <div className="radiation-ring ring-1"></div>
            <div className="radiation-ring ring-2"></div>
            <div className="radiation-ring ring-3"></div>
          </>
        )}
        {state === 'ai-speaking' && (
          <>
            <div className="outward-ring ring-1"></div>
            <div className="outward-ring ring-2"></div>
            <div className="outward-ring ring-3"></div>
          </>
        )}
      </div>
      <p id="voice-status">{getStatusText()}</p>
    </div>
  );
};