import { useState } from 'react';

export default function DroneControls({ 
  isArmed, 
  droneState, 
  connectionStatus,
  onArmDisarm
}) {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium text-gray-700 mb-2">빠른 실행</h3>
      <div className="grid grid-cols-3 gap-2">
        <button 
          onClick={onArmDisarm}
          disabled={connectionStatus !== 'connected'}
          className={`
            py-3 flex justify-center items-center rounded-md font-medium
            ${isArmed 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          ✓ ARM
        </button>
        <button 
          disabled={connectionStatus !== 'connected' || !isArmed}
          className="py-3 bg-indigo-500 text-white rounded-md font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🚀 이륙
        </button>
        <button 
          disabled={connectionStatus !== 'connected' || !droneState.isFlying}
          className="py-3 bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🛬 착륙
        </button>
      </div>
    </div>
  );
}
