import { useState } from 'react';
import Header from './components/ui/Header';
import VoiceControl from './components/drone/VoiceControl';
import DroneControls from './components/drone/DroneControls';
import CameraControls from './components/camera/CameraControls';
import SystemLog from './components/ui/SystemLog';

export default function DroneControlUI() {
  // 시스템 상태
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [batteryLevel, setBatteryLevel] = useState(0);
  const [isArmed, setIsArmed] = useState(false);
  
  // 제어 모드 상태
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const [commandInput, setCommandInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [autoVoice, setAutoVoice] = useState(true);
  
  // 카메라 상태
  const [cameraState, setCameraState] = useState({
    streaming: false,
    recording: false,
    mode: 'normal', // normal / tracking
    resolution: '1080p'
  });

  // 드론 상태
  const [droneState, setDroneState] = useState({
    gps: { lat: 37.5665, lng: 126.9780, satellites: 12 },
    altitude: 0,
    speed: 0,
    isFlying: false
  });

  // 드론 연결/연결 해제 처리
  const handleConnect = () => {
    if (connectionStatus === 'connected') {
      setConnectionStatus('disconnected');
      setBatteryLevel(0);
      setIsArmed(false);
      setDroneState(prev => ({ ...prev, isFlying: false, altitude: 0, speed: 0 }));
      setCameraState(prev => ({ ...prev, streaming: false, recording: false }));
    } else {
      setConnectionStatus('connecting');
      setTimeout(() => {
        setConnectionStatus('connected');
        setBatteryLevel(87);
      }, 1500);
    }
  };

  // 음성 녹음 토글
  const toggleRecording = () => {
    if (!isVoiceMode || connectionStatus !== 'connected') return;
    
    setIsRecording(prev => !prev); 
    if (!isRecording) { 
      // If stopping recording, keep the input for sending or clearing manually, or clear it
      // setCommandInput(''); // Or keep current command
    } else { 
      // If starting recording
      setCommandInput(''); // Clear previous command before new recording recognition
      setTimeout(() => {
        setCommandInput(autoVoice ? '명령 입력: 고도 30미터 상승' : '[음성 분석 결과]');
      }, 1500);
    }
  };
  
  // 자동 인식 토글
  const toggleAutoVoice = () => {
    setAutoVoice(!autoVoice);
  };

  // 명령 전송
  const handleSendCommand = () => {
    if (!commandInput.trim()) return;
    
    console.log(`명령 전송: ${commandInput}`);
    if (commandInput.toLowerCase().includes('이륙')) {
      setDroneState(prev => ({ ...prev, isFlying: true, altitude: 10, speed: 5 }));
    } else if (commandInput.toLowerCase().includes('착륙')) {
      setDroneState(prev => ({ ...prev, isFlying: false, altitude: 0, speed: 0 }));
    } else if (commandInput.toLowerCase().includes('고도')) {
      const altMatch = commandInput.match(/고도 (\d+)/);
      if (altMatch && altMatch[1]) {
        setDroneState(prev => ({ ...prev, altitude: parseInt(altMatch[1]) }));
      }
    }
  
    // Clear input only if not voice recording (voice recording flow handles its input)
    if (!isVoiceMode || !isRecording) {
        setCommandInput('');
    }
  };

  // ARM/DISARM 처리
  const handleArmDisarm = () => {
    if (connectionStatus !== 'connected') return;
    if (droneState.isFlying && isArmed) {
      alert("비행 중에는 Disarm 할 수 없습니다.");
      return;
    }
    setIsArmed(!isArmed);
  };

  // 카메라 관련 함수
  const toggleStreaming = () => {
    if (connectionStatus !== 'connected') return;
    setCameraState(prev => ({ ...prev, streaming: !prev.streaming, recording: prev.streaming ? false : prev.recording }));
  };

  const toggleCameraRecording = () => {
    if (connectionStatus !== 'connected' || !cameraState.streaming) return;
    setCameraState(prev => ({ ...prev, recording: !prev.recording }));
  };

  const changeCameraMode = () => {
    if (connectionStatus !== 'connected') return;
    setCameraState(prev => ({ ...prev, mode: prev.mode === 'normal' ? 'tracking' : 'normal' }));
  };
  
  const changeCameraResolution = (e) => {
    setCameraState(prev => ({ ...prev, resolution: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* 헤더 */}
      <Header 
        connectionStatus={connectionStatus} 
        onConnect={handleConnect} 
      />

      {/* 메인 컨텐츠 */}
      <main className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 명령 제어 패널 */}
        <div className="bg-white rounded-xl shadow-lg p-6 col-span-1 flex flex-col gap-6">
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-3">
            {isVoiceMode ? '음성 명령 제어' : '텍스트 명령 제어'}
          </h2>
          
          {isVoiceMode && (
            <VoiceControl 
              isVoiceMode={isVoiceMode}
              isRecording={isRecording}
              autoVoice={autoVoice}
              commandInput={commandInput}
              connectionStatus={connectionStatus}
              onToggleRecording={toggleRecording}
              onToggleAutoVoice={toggleAutoVoice}
              onCommandInputChange={(e) => setCommandInput(e.target.value)}
              onSendCommand={handleSendCommand}
            />
          )}

          {!isVoiceMode && (
            <div>
              <label htmlFor="commandInput" className="block text-sm font-medium text-gray-700 mb-1">명령</label>
              <div className="flex">
                <input
                  id="commandInput"
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm bg-white"
                  placeholder="명령을 직접 입력하세요..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSendCommand()}
                />
                <button
                  onClick={handleSendCommand}
                  disabled={!commandInput.trim() || connectionStatus !== 'connected'}
                  className="bg-blue-500 text-white px-4 rounded-r-md hover:bg-blue-600 transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  전송
                </button>
              </div>
            </div>
          )}

          <DroneControls 
            isArmed={isArmed}
            droneState={droneState}
            connectionStatus={connectionStatus}
            onArmDisarm={handleArmDisarm}
          />
        </div>

        {/* 카메라 및 드론 상태 패널 */}
        <div className="col-span-2">
          <CameraControls 
            cameraState={cameraState}
            connectionStatus={connectionStatus}
            onToggleStreaming={toggleStreaming}
            onToggleRecording={toggleCameraRecording}
            onChangeCameraMode={changeCameraMode}
            onChangeCameraResolution={changeCameraResolution}
            droneState={droneState}
          />
        </div>

        {/* 시스템 콘솔 */}
        <SystemLog 
          connectionStatus={connectionStatus}
          isVoiceMode={isVoiceMode}
          autoVoice={autoVoice}
          isArmed={isArmed}
          droneState={droneState}
          isRecording={isRecording}
          commandInput={commandInput}
          cameraState={cameraState}
        />
      </main>
    </div>
  );
}
