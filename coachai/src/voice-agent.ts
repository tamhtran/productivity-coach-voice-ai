import { RealtimeAgent, RealtimeSession } from '@openai/agents/realtime';

export class VoiceAgent {
  private agent: RealtimeAgent;
  private session: RealtimeSession;
  private connected: boolean = false;

  constructor() {
    this.agent = new RealtimeAgent({
      name: 'ProductivityCoach',
      instructions: 'You are a helpful productivity coach. Help users improve their workflow, manage time better, and achieve their goals. Be encouraging and provide actionable advice.'
    });

    this.session = new RealtimeSession(this.agent, {
      model: 'gpt-4o-realtime-preview-2025-06-03'
    });
  }

  private async generateEphemeralToken(): Promise<string> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('VITE_OPENAI_API_KEY environment variable is not set');
    }

    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2025-06-03',
        voice: 'alloy'
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate ephemeral token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.client_secret.value;
  }

  async connect(): Promise<void> {
    try {
      const clientSecret = await this.generateEphemeralToken();
      
      await this.session.connect({ 
        apiKey: clientSecret
      });
      this.connected = true;
      console.log('Voice agent connected successfully');
    } catch (error) {
      console.error('Failed to connect voice agent:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      this.session.close();
      this.connected = false;
      console.log('Voice agent disconnected');
    } catch (error) {
      console.error('Error disconnecting voice agent:', error);
    }
  }

  getSession(): RealtimeSession {
    return this.session;
  }

  isConnected(): boolean {
    return this.connected;
  }
}