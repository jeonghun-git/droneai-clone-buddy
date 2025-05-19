import { useState } from 'react';

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
      <header className="bg-gray-800 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between">
          {/* 1. Logo and Title */}
          <div className="flex items-center gap-2 mb-2 lg:mb-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
            <span className="text-2xl font-bold">DroneVision AI Control</span>
          </div>
          
          {/* 2. Group for all controls (Mode Toggle, Connect Button, Status) */}
          <div className="w-full lg:w-auto flex items-center justify-between gap-x-4 mt-2 lg:mt-0">
            {/* Sub-group for Mode Toggle and Connect Button */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsVoiceMode(!isVoiceMode)}
                className="px-3 py-1.5 bg-white text-gray-700 rounded-md text-sm font-semibold hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                {isVoiceMode ? '⌨️ 텍스트 모드' : '🎤 음성 모드'}
              </button>
              <button 
                onClick={handleConnect}
                className="bg-white text-gray-700 px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                {connectionStatus === 'connected' ? '연결 해제' : '드론 연결'}
              </button>
            </div>
            
            {/* Status Indicator */}
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              connectionStatus === 'connected' ? 'bg-green-500 text-white' : 
              connectionStatus === 'connecting' ? 'bg-yellow-400 text-yellow-900 animate-pulse' : 'bg-red-500 text-white'
            }`}>
              {connectionStatus}
            </span>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 명령 제어 패널 */}
        <div className="bg-white rounded-xl shadow-lg p-6 col-span-1 flex flex-col gap-6">
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-3">
            {isVoiceMode ? '음성 명령 제어' : '텍스트 명령 제어'}
          </h2>
          
          {isVoiceMode && (
            <div className="flex items-center gap-3">
              <button
                onClick={toggleRecording}
                disabled={connectionStatus !== 'connected'}
                className={`py-2.5 rounded-md flex items-center justify-center gap-2 w-auto px-6 text-xs font-semibold transition-colors ${
                  isRecording
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                } ${connectionStatus !== 'connected' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isRecording ? (
                  <>
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-200"></span>
                    </span>
                    녹음 중지
                  </>
                ) : (
                  '🎤 음성 녹음'
                )}
              </button>
              
              <button
                onClick={toggleAutoVoice}
                disabled={connectionStatus !== 'connected'}
                title={autoVoice ? "자동 음성 인식 켜짐" : "자동 음성 인식 꺼짐"}
                className={`py-2.5 rounded-md flex items-center justify-center gap-2 w-auto px-5 text-xs font-semibold transition-colors ${
                  autoVoice
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                } ${connectionStatus !== 'connected' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {autoVoice ? '🔊 자동 ON' : '🔈 자동 OFF'}
              </button>
            </div>
          )}

          <div>
            <label htmlFor="commandInput" className="block text-sm font-medium text-gray-700 mb-1">명령</label>
            <div className="flex">
              <input
                id="commandInput"
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                className={`flex-1 p-3 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm ${
                  isVoiceMode && isRecording ? 'bg-gray-100 cursor-wait' : 'bg-white'
                }`}
                placeholder={
                  isVoiceMode 
                    ? isRecording ? '음성 인식 중...' : '음성 녹음 버튼을 누르세요'
                    : '명령을 직접 입력하세요...'
                }
                readOnly={isVoiceMode && isRecording}
                onKeyDown={(e) => e.key === 'Enter' && handleSendCommand()}
              />
              <button
                onClick={handleSendCommand}
                disabled={!commandInput.trim() || (isVoiceMode && isRecording) || connectionStatus !== 'connected'}
                className="bg-blue-500 text-white px-4 rounded-r-md hover:bg-blue-600 transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                전송
              </button>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-md font-semibold text-gray-700 mb-2">빠른 실행</h3>
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={handleArmDisarm}
                disabled={connectionStatus !== 'connected' || (droneState.isFlying && isArmed)}
                className={`py-2.5 rounded-md font-semibold text-xs text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isArmed
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isArmed ? '✖️ DISARM' : '✔️ ARM'}
              </button>
              <button 
                onClick={() => { if (!isArmed || droneState.isFlying || connectionStatus !== 'connected') return; setCommandInput('이륙'); handleSendCommand(); }}
                disabled={connectionStatus !== 'connected' || !isArmed || droneState.isFlying}
                className="py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md font-semibold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🚀 이륙
              </button>
              <button 
                onClick={() => { if (!isArmed || !droneState.isFlying || connectionStatus !== 'connected') return; setCommandInput('착륙'); handleSendCommand(); }}
                disabled={connectionStatus !== 'connected' || !isArmed || !droneState.isFlying}
                className="py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-semibold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🪂 착륙
              </button>
            </div>
          </div>
        </div>

        {/* 카메라 및 드론 상태 패널 */}
        <div className="bg-white rounded-xl shadow-lg p-6 col-span-2 flex flex-col gap-6">
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
              카메라 & 드론 상태
            </h2>
            <div className="text-sm bg-gray-100 px-3 py-1.5 rounded-full font-medium text-gray-700">
              🔋 배터리: {batteryLevel}%
            </div>
          </div>
          
          <div className="bg-black rounded-lg aspect-video min-h-72 flex items-center justify-center relative overflow-hidden">
             {connectionStatus === 'connected' && cameraState.streaming ? (
              <img src="/api/placeholder/640/360" alt="Live Stream Placeholder" className="w-full h-full object-cover"/>
            ) : (
              <div className="text-gray-500 flex flex-col items-center gap-2 py-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 21.02a5 5 0 0 0-8.4-6.04l-1.27-.57"></path><path d="M10.73 21.02a5 5 0 0 1 .47-8.94l1.27.57"></path><path d="M13.27 2.98a5 5 0 0 0 8.4 6.04l1.27.57"></path><path d="M13.27 2.98a5 5 0 0 1-.47 8.94l-1.27-.57"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>
                <span>{connectionStatus !== 'connected' ? '드론 연결 필요' : '스트림 시작 필요'}</span>
              </div>
            )}
            {connectionStatus === 'connected' && cameraState.streaming && (
                <>
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {cameraState.resolution} @ 30fps | {cameraState.mode === 'tracking' ? '개체 추적 모드' : '일반 모드'}
                  </div>
                  {cameraState.recording && (
                    <div className="absolute top-3 right-3 bg-red-600 text-white text-xs px-2.5 py-1 rounded-md flex items-center gap-1 animate-pulse">
                      <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>
                      REC
                    </div>
                  )}
                </>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={toggleStreaming}
              disabled={connectionStatus !== 'connected'}
              className={`py-2.5 rounded-md font-semibold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                cameraState.streaming ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {cameraState.streaming ? '⏹️ 스트림 중지' : '▶️ 스트림 시작'}
            </button>
            <button 
              onClick={toggleCameraRecording}
              disabled={connectionStatus !== 'connected' || !cameraState.streaming}
              className={`py-2.5 rounded-md font-semibold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                cameraState.recording ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cameraState.recording ? '🎥 녹화 중지' : '🎬 녹화 시작'}
            </button>
            <button 
              onClick={changeCameraMode}
              disabled={connectionStatus !== 'connected'}
              className="py-2.5 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-md font-semibold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {cameraState.mode === 'tracking' ? '🎯 추적 모드' : '👁️ 일반 모드'}
            </button>
            <select 
              value={cameraState.resolution}
              onChange={changeCameraResolution}
              disabled={connectionStatus !== 'connected'}
              className="py-2.5 px-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-md font-semibold text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="720p">HD (720p)</option>
              <option value="1080p">FHD (1080p)</option>
              <option value="4K">UHD (4K)</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="text-xs text-gray-500 uppercase tracking-wider">위치 (Lat, Lng)</div>
              <div className="font-semibold text-sm mt-1">
                {droneState.gps.lat.toFixed(4)}, {droneState.gps.lng.toFixed(4)}
              </div>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="text-xs text-gray-500 uppercase tracking-wider">고도 / 속도</div>
              <div className="font-semibold text-sm mt-1">
                {droneState.altitude.toFixed(1)}m / {droneState.speed.toFixed(1)}m/s
              </div>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="text-xs text-gray-500 uppercase tracking-wider">GPS 위성</div>
              <div className="font-semibold text-sm mt-1">
                {droneState.gps.satellites} <span className={droneState.gps.satellites > 6 ? 'text-green-500' : 'text-orange-500'}>({droneState.gps.satellites > 6 ? '안정적' : '불안정'})</span>
              </div>
            </div>
          </div>
        </div>

        {/* 시스템 콘솔 */}
        <div className="bg-white rounded-xl shadow-lg p-6 col-span-full">
          <div className="flex justify-between items-center border-b pb-3 mb-3">
            <h2 className="text-xl font-semibold text-gray-700">📜 시스템 로그</h2>
            <div className="text-xs text-gray-500">{new Date().toLocaleString()}</div>
          </div>
          <div className="bg-gray-800 text-gray-300 font-mono text-xs p-4 rounded-md h-48 overflow-y-auto leading-relaxed">
            <p><span className="text-blue-400">$ DroneVision AI Control v1.0 initialized.</span></p>
            <p><span className={connectionStatus === 'connected' ? 'text-green-400' : connectionStatus === 'connecting' ? 'text-yellow-400 animate-pulse' : 'text-red-400'}>$ Connection: {connectionStatus.toUpperCase()}</span></p>
            <p><span className="text-cyan-400">$ Mode: {isVoiceMode ? 'Voice Recognition' : 'Manual Text Input'}</span></p>
            {isVoiceMode && <p><span className="text-cyan-400">$ Voice Setting: {autoVoice ? 'Auto Transcription ON' : 'Auto Transcription OFF'}</span></p>}
            <p><span className="text-purple-400">$ Drone Status: {isArmed ? 'ARMED' : 'DISARMED'} | {droneState.isFlying ? `FLYING (Alt: ${droneState.altitude}m, Spd: ${droneState.speed}m/s)` : 'IDLE'}</span></p>
            {!isRecording && commandInput && <p><span className="text-lime-400">$ Last Command Sent: "{commandInput}"</span></p>}
            {isRecording && <p><span className="text-pink-400 animate-pulse">$ Voice input active...Listening...</span></p>}
            {cameraState.streaming && <p><span className="text-teal-400">$ Camera Stream: ACTIVE | Mode: {cameraState.mode} | Resolution: {cameraState.resolution}</span></p>}
            {cameraState.recording && <p><span className="text-red-400 animate-pulse">$ Camera Recording: ACTIVE</span></p>}
          </div>
        </div>
      </main>
    </div>
  );
}
