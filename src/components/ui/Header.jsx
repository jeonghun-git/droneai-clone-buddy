import { useState } from 'react';

export default function Header({ connectionStatus, onConnect }) {
  return (
    <header className="bg-navy text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="text-2xl font-bold flex items-center">
            <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L3 9L12 14L21 9L12 4Z" fill="currentColor" />
              <path d="M3 14L12 19L21 14" fill="currentColor" opacity="0.5" />
            </svg>
            DroneVision AI Control
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button 
            className="py-2 px-4 bg-white bg-opacity-10 rounded-md text-sm font-medium hover:bg-opacity-20 transition-colors"
          >
            테스트 모드
          </button>
          <button 
            className="py-2 px-4 bg-white bg-opacity-10 rounded-md text-sm font-medium hover:bg-opacity-20 transition-colors"
            onClick={onConnect}
          >
            드론 연결
          </button>
          <div className={`
            py-2 px-4 rounded-md text-sm font-bold
            ${connectionStatus === 'connected' ? 'bg-green-500' : 
              connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}
          `}>
            {connectionStatus === 'connected' ? 'CONNECTED' : 
             connectionStatus === 'connecting' ? 'CONNECTING...' : 'DISCONNECTED'}
          </div>
        </div>
      </div>
    </header>
  );
}
