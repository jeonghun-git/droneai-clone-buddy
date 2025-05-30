import Header from './components/ui/Header';
import VoiceControl from './components/drone/VoiceControl';
import DroneControls from './components/drone/DroneControls';
import CameraControls from './components/camera/CameraControls';
import SystemLog from './components/ui/SystemLog';

// Custom Hooks
import { useDroneState } from './hooks/useDroneState';
import { useCameraState } from './hooks/useCameraState';
import { useVoiceControl } from './hooks/useVoiceControl';

export default function DroneControlUI() {
  // Custom Hook을 통한 상태 관리
  const drone = useDroneState();
  const camera = useCameraState(drone.connectionStatus);
  const voice = useVoiceControl(drone.connectionStatus, drone.updateDroneFromCommand);

  // 연결 상태 변경 시 카메라 상태 초기화
  const handleConnect = () => {
    if (drone.connectionStatus === 'connected') {
      camera.resetCameraState();
    }
    drone.handleConnect();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* 헤더 */}
      <Header 
        connectionStatus={drone.connectionStatus} 
        onConnect={handleConnect} 
      />

      {/* 메인 컨텐츠 */}
      <main className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 명령 제어 패널 */}
        <div className="bg-white rounded-xl shadow-lg p-6 col-span-1 flex flex-col gap-6">
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-3">
            {voice.isVoiceMode ? '음성 명령 제어' : '텍스트 명령 제어'}
          </h2>
          
          {voice.isVoiceMode && (
            <VoiceControl 
              isVoiceMode={voice.isVoiceMode}
              isRecording={voice.isRecording}
              autoVoice={voice.autoVoice}
              commandInput={voice.commandInput}
              connectionStatus={drone.connectionStatus}
              onToggleRecording={voice.toggleRecording}
              onToggleAutoVoice={voice.toggleAutoVoice}
              onCommandInputChange={(e) => voice.handleCommandInputChange(e.target.value)}
              onSendCommand={voice.handleSendCommand}
            />
          )}

          {!voice.isVoiceMode && (
            <div>
              <label htmlFor="commandInput" className="block text-sm font-medium text-gray-700 mb-1">명령</label>
              <div className="flex">
                <input
                  id="commandInput"
                  type="text"
                  value={voice.commandInput}
                  onChange={(e) => voice.handleCommandInputChange(e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm bg-white"
                  placeholder="명령을 직접 입력하세요..."
                  onKeyDown={(e) => e.key === 'Enter' && voice.handleSendCommand()}
                />
                <button
                  onClick={voice.handleSendCommand}
                  disabled={!voice.commandInput.trim() || drone.connectionStatus !== 'connected'}
                  className="bg-blue-500 text-white px-4 rounded-r-md hover:bg-blue-600 transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  전송
                </button>
              </div>
            </div>
          )}

          <DroneControls 
            isArmed={drone.isArmed}
            droneState={drone.droneState}
            connectionStatus={drone.connectionStatus}
            onArmDisarm={drone.handleArmDisarm}
          />
        </div>

        {/* 카메라 및 드론 상태 패널 */}
        <div className="col-span-2">
          <CameraControls 
            cameraState={camera.cameraState}
            connectionStatus={drone.connectionStatus}
            onToggleStreaming={camera.toggleStreaming}
            onToggleRecording={camera.toggleRecording}
            onChangeCameraMode={camera.changeCameraMode}
            onChangeCameraResolution={(e) => camera.changeCameraResolution(e.target.value)}
            droneState={drone.droneState}
          />
        </div>

        {/* 시스템 콘솔 */}
        <SystemLog 
          connectionStatus={drone.connectionStatus}
          isVoiceMode={voice.isVoiceMode}
          autoVoice={voice.autoVoice}
          isArmed={drone.isArmed}
          droneState={drone.droneState}
          isRecording={voice.isRecording}
          commandInput={voice.commandInput}
          cameraState={camera.cameraState}
        />
      </main>
    </div>
  );
}
