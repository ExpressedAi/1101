"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Mic, Phone, Volume2, Settings, Square } from "lucide-react"

interface VoiceConfig {
  enabled: boolean
  voice: string
  speed: number
  pitch: number
  volume: number
  language: string
  interruptionDetection: boolean
  silenceTimeout: number
  maxDuration: number
  transcriptionModel: string
  ttsModel: string
  transport: "websocket" | "webrtc" | "twilio"
  twilioConfig?: {
    phoneNumber: string
    webhook: string
  }
}

interface VoiceAgentBuilderProps {
  onVoiceConfigChange: (config: VoiceConfig) => void
}

export function VoiceAgentBuilder({ onVoiceConfigChange }: VoiceAgentBuilderProps) {
  const [config, setConfig] = useState<VoiceConfig>({
    enabled: false,
    voice: "alloy",
    speed: 1.0,
    pitch: 1.0,
    volume: 0.8,
    language: "en-US",
    interruptionDetection: true,
    silenceTimeout: 3000,
    maxDuration: 300000, // 5 minutes
    transcriptionModel: "whisper-1",
    ttsModel: "tts-1",
    transport: "websocket",
  })

  const [isRecording, setIsRecording] = useState(false)
  const [testAudio, setTestAudio] = useState<HTMLAudioElement | null>(null)

  const voices = [
    { id: "alloy", name: "Alloy", description: "Neutral, balanced voice" },
    { id: "echo", name: "Echo", description: "Clear, professional voice" },
    { id: "fable", name: "Fable", description: "Warm, storytelling voice" },
    { id: "onyx", name: "Onyx", description: "Deep, authoritative voice" },
    { id: "nova", name: "Nova", description: "Bright, energetic voice" },
    { id: "shimmer", name: "Shimmer", description: "Soft, gentle voice" },
  ]

  const languages = [
    { value: "en-US", name: "English (US)" },
    { value: "en-GB", name: "English (UK)" },
    { value: "es-ES", name: "Spanish (Spain)" },
    { value: "es-MX", name: "Spanish (Mexico)" },
    { value: "fr-FR", name: "French" },
    { value: "de-DE", name: "German" },
    { value: "it-IT", name: "Italian" },
    { value: "pt-BR", name: "Portuguese (Brazil)" },
    { value: "ja-JP", name: "Japanese" },
    { value: "ko-KR", name: "Korean" },
    { value: "zh-CN", name: "Chinese (Mandarin)" },
  ]

  const updateConfig = (updates: Partial<VoiceConfig>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    onVoiceConfigChange(newConfig)
  }

  const testVoice = async () => {
    // Simulate voice test
    const utterance = new SpeechSynthesisUtterance("Hello! This is a test of the voice configuration.")
    utterance.rate = config.speed
    utterance.pitch = config.pitch
    utterance.volume = config.volume
    utterance.lang = config.language

    // Try to find a matching voice
    const voices = speechSynthesis.getVoices()
    const matchingVoice = voices.find((v) => v.lang.startsWith(config.language.split("-")[0]))
    if (matchingVoice) {
      utterance.voice = matchingVoice
    }

    speechSynthesis.speak(utterance)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setIsRecording(true)

      // Simulate recording for demo
      setTimeout(() => {
        setIsRecording(false)
        stream.getTracks().forEach((track) => track.stop())
      }, 3000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
    }
  }

  const generateVoiceAgentCode = () => {
    return `import { VoiceAgent, RealtimeSession } from '@openai/agents-realtime';

const voiceAgent = new VoiceAgent({
  name: 'Voice Assistant',
  instructions: 'You are a helpful voice assistant. Keep responses conversational and concise.',
  voice: '${config.voice}',
  language: '${config.language}',
  transcriptionModel: '${config.transcriptionModel}',
  ttsModel: '${config.ttsModel}',
  
  // Voice settings
  voiceSettings: {
    speed: ${config.speed},
    pitch: ${config.pitch},
    volume: ${config.volume}
  },
  
  // Conversation settings
  interruptionDetection: ${config.interruptionDetection},
  silenceTimeout: ${config.silenceTimeout},
  maxDuration: ${config.maxDuration},
  
  // Transport mechanism
  transport: '${config.transport}'${
    config.transport === "twilio" && config.twilioConfig
      ? `,
  
  // Twilio configuration
  twilioConfig: {
    phoneNumber: '${config.twilioConfig.phoneNumber}',
    webhook: '${config.twilioConfig.webhook}'
  }`
      : ""
  }
});

// Start a voice session
async function startVoiceSession() {
  const session = new RealtimeSession({
    agent: voiceAgent,
    transport: '${config.transport}'
  });
  
  await session.connect();
  
  session.on('userSpeechStart', () => {
    console.log('User started speaking');
  });
  
  session.on('userSpeechEnd', (transcript) => {
    console.log('User said:', transcript);
  });
  
  session.on('agentSpeechStart', () => {
    console.log('Agent started speaking');
  });
  
  session.on('agentSpeechEnd', (response) => {
    console.log('Agent said:', response);
  });
  
  return session;
}`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice Configuration
          </CardTitle>
          <CardDescription>Configure speech-to-speech capabilities for your agent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable Voice */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-voice" className="text-base font-medium">
                Enable Voice Capabilities
              </Label>
              <p className="text-sm text-muted-foreground">Turn your agent into a voice assistant</p>
            </div>
            <Switch
              id="enable-voice"
              checked={config.enabled}
              onCheckedChange={(checked) => updateConfig({ enabled: checked })}
            />
          </div>

          {config.enabled && (
            <>
              {/* Voice Selection */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="voice-select">Voice</Label>
                    <Select value={config.voice} onValueChange={(value) => updateConfig({ voice: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {voices.map((voice) => (
                          <SelectItem key={voice.id} value={voice.id}>
                            <div>
                              <div className="font-medium">{voice.name}</div>
                              <div className="text-xs text-muted-foreground">{voice.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language-select">Language</Label>
                    <Select value={config.language} onValueChange={(value) => updateConfig({ language: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Voice Test */}
                <div className="flex items-center gap-2">
                  <Button onClick={testVoice} variant="outline" size="sm">
                    <Volume2 className="h-4 w-4 mr-2" />
                    Test Voice
                  </Button>
                  <Badge variant="outline">Browser TTS Preview</Badge>
                </div>
              </div>

              {/* Voice Settings */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Voice Settings
                </h4>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Speed: {config.speed}x</Label>
                    <Slider
                      value={[config.speed]}
                      onValueChange={([value]) => updateConfig({ speed: value })}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pitch: {config.pitch}x</Label>
                    <Slider
                      value={[config.pitch]}
                      onValueChange={([value]) => updateConfig({ pitch: value })}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Volume: {Math.round(config.volume * 100)}%</Label>
                    <Slider
                      value={[config.volume]}
                      onValueChange={([value]) => updateConfig({ volume: value })}
                      min={0.0}
                      max={1.0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Models */}
              <div className="space-y-4">
                <h4 className="font-medium">AI Models</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="transcription-model">Transcription Model</Label>
                    <Select
                      value={config.transcriptionModel}
                      onValueChange={(value) => updateConfig({ transcriptionModel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whisper-1">Whisper v1</SelectItem>
                        <SelectItem value="whisper-large-v3">Whisper Large v3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tts-model">Text-to-Speech Model</Label>
                    <Select value={config.ttsModel} onValueChange={(value) => updateConfig({ ttsModel: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tts-1">TTS-1 (Fast)</SelectItem>
                        <SelectItem value="tts-1-hd">TTS-1-HD (High Quality)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Conversation Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Conversation Settings</h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Interruption Detection</Label>
                      <p className="text-sm text-muted-foreground">Allow users to interrupt the agent</p>
                    </div>
                    <Switch
                      checked={config.interruptionDetection}
                      onCheckedChange={(checked) => updateConfig({ interruptionDetection: checked })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Silence Timeout: {config.silenceTimeout / 1000}s</Label>
                    <Slider
                      value={[config.silenceTimeout]}
                      onValueChange={([value]) => updateConfig({ silenceTimeout: value })}
                      min={1000}
                      max={10000}
                      step={500}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">How long to wait for user input before timing out</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Max Duration: {config.maxDuration / 60000} minutes</Label>
                    <Slider
                      value={[config.maxDuration]}
                      onValueChange={([value]) => updateConfig({ maxDuration: value })}
                      min={60000}
                      max={1800000}
                      step={60000}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">Maximum conversation length</p>
                  </div>
                </div>
              </div>

              {/* Transport Mechanism */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Transport Mechanism
                </h4>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Connection Type</Label>
                    <Select value={config.transport} onValueChange={(value: any) => updateConfig({ transport: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="websocket">WebSocket (Web)</SelectItem>
                        <SelectItem value="webrtc">WebRTC (Real-time)</SelectItem>
                        <SelectItem value="twilio">Twilio (Phone)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {config.transport === "twilio" && (
                    <div className="space-y-3 p-3 border rounded-lg">
                      <h5 className="font-medium">Twilio Configuration</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Phone Number</Label>
                          <Input
                            placeholder="+1234567890"
                            value={config.twilioConfig?.phoneNumber || ""}
                            onChange={(e) =>
                              updateConfig({
                                twilioConfig: { ...config.twilioConfig, phoneNumber: e.target.value },
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Webhook URL</Label>
                          <Input
                            placeholder="https://your-app.com/webhook"
                            value={config.twilioConfig?.webhook || ""}
                            onChange={(e) =>
                              updateConfig({
                                twilioConfig: { ...config.twilioConfig, webhook: e.target.value },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Voice Testing */}
              <div className="space-y-4">
                <h4 className="font-medium">Test Voice Input</h4>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={startRecording}
                    disabled={isRecording}
                    variant={isRecording ? "destructive" : "default"}
                    className="flex items-center gap-2"
                  >
                    {isRecording ? (
                      <>
                        <Square className="h-4 w-4" />
                        Recording... ({3}s)
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4" />
                        Test Microphone
                      </>
                    )}
                  </Button>
                  {isRecording && <Badge variant="destructive">🔴 Live</Badge>}
                </div>
              </div>

              {/* Generated Code */}
              <div className="space-y-3">
                <h4 className="font-medium">Generated Voice Agent Code</h4>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-64">{generateVoiceAgentCode()}</pre>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {config.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Voice Testing
            </CardTitle>
            <CardDescription>Test your voice configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={startRecording}
                variant={isRecording ? "destructive" : "default"}
                className="flex items-center gap-2"
              >
                <Mic className="h-4 w-4" />
                {isRecording ? "Stop Recording" : "Start Recording"}
              </Button>

              {isRecording && (
                <Badge variant="destructive" className="animate-pulse">
                  Recording...
                </Badge>
              )}
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Voice testing functionality would be implemented here. This would include:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• Real-time speech-to-text</li>
                <li>• Text-to-speech preview</li>
                <li>• Voice quality testing</li>
                <li>• Latency measurement</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
