import './style.css'
import { VoiceAgent } from './voice-agent'

const voiceAgent = new VoiceAgent();

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Productivity Coach Voice AI</h1>
    <div class="card">
      <div class="voice-indicator">
        <div id="voice-circle" class="circle idle">
          <div class="inner-circle"></div>
        </div>
        <p id="voice-status">Ready to connect</p>
      </div>
      <div class="controls">
        <button id="connect-btn" type="button">Connect</button>
        <button id="disconnect-btn" type="button" disabled>Disconnect</button>
      </div>
      <div class="status">
        <p id="status">Not connected</p>
      </div>
    </div>
    <p class="read-the-docs">
      Click "Connect" to start chatting with your productivity coach
    </p>
  </div>
`

const connectBtn = document.querySelector<HTMLButtonElement>('#connect-btn')!;
const disconnectBtn = document.querySelector<HTMLButtonElement>('#disconnect-btn')!;
const statusEl = document.querySelector<HTMLParagraphElement>('#status')!;
const voiceCircle = document.querySelector<HTMLDivElement>('#voice-circle')!;
const voiceStatus = document.querySelector<HTMLParagraphElement>('#voice-status')!;

function updateVoiceIndicator(state: 'idle' | 'listening' | 'speaking' | 'connecting') {
  voiceCircle.className = `circle ${state}`;
  
  switch (state) {
    case 'idle':
      voiceStatus.textContent = 'Ready to connect';
      break;
    case 'connecting':
      voiceStatus.textContent = 'Connecting...';
      break;
    case 'listening':
      voiceStatus.textContent = 'Listening - You can speak now';
      break;
    case 'speaking':
      voiceStatus.textContent = 'AI is speaking...';
      break;
  }
}

connectBtn.addEventListener('click', async () => {
  try {
    connectBtn.disabled = true;
    updateVoiceIndicator('connecting');
    statusEl.textContent = 'Connecting...';
    
    await voiceAgent.connect();
    
    connectBtn.disabled = true;
    disconnectBtn.disabled = false;
    updateVoiceIndicator('listening');
    statusEl.textContent = 'Connected - You can now talk to your productivity coach!';
    
    // Set up event listeners for voice activity
    const session = voiceAgent.getSession();
    
    try {
      session.on('input_audio_buffer.speech_started' as any, () => {
        updateVoiceIndicator('listening');
      });
      
      session.on('input_audio_buffer.speech_stopped' as any, () => {
        updateVoiceIndicator('listening');
      });
      
      session.on('response.audio.delta' as any, () => {
        updateVoiceIndicator('speaking');
      });
      
      session.on('response.audio.done' as any, () => {
        updateVoiceIndicator('listening');
      });
    } catch (error) {
      console.log('Event listeners setup - some events may not be available:', error);
    }
    
  } catch (error) {
    console.error('Connection failed:', error);
    statusEl.textContent = `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    connectBtn.disabled = false;
    updateVoiceIndicator('idle');
  }
});

disconnectBtn.addEventListener('click', async () => {
  try {
    await voiceAgent.disconnect();
    
    connectBtn.disabled = false;
    disconnectBtn.disabled = true;
    updateVoiceIndicator('idle');
    statusEl.textContent = 'Disconnected';
  } catch (error) {
    console.error('Disconnect failed:', error);
  }
});
