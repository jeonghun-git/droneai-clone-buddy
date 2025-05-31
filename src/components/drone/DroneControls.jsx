
import { useState } from 'react';

export default function DroneControls({ 
  isArmed, 
  droneState, 
  connectionStatus,
  onArmDisarm
}) {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-700 mb-4">빠른 실행</h3>
      <div className="flex space-x-2">
        <button 
          onClick={onArmDisarm}
          disabled={connectionStatus !== 'connected'}
          className={`
            flex items-center justify-center px-4 py-1.5 rounded-md text-sm font-medium
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
          className="flex items-center justify-center px-4 py-1.5 bg-indigo-500 text-white rounded-md text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🚀 이륙
        </button>
        <button 
          disabled={connectionStatus !== 'connected' || !droneState.isFlying}
          className="flex items-center justify-center px-4 py-1.5 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🛬 착륙
        </button>
      </div>
    </div>
  );
}
