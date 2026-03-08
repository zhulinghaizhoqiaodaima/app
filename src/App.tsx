import { useEffect, useState } from 'react';
import { GameBoard } from '@/sections/GameBoard';
import './App.css';

function App() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const scaleX = window.innerWidth / 1440;
      const scaleY = window.innerHeight / 2560;
      // Adjust scale based on the smallest dimension to ensure it fits screen
      setScale(Math.min(scaleX, scaleY));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-black flex items-center justify-center">
      <div
        className="relative origin-center bg-white overflow-hidden shadow-2xl"
        style={{
          width: '1440px',
          height: '2560px',
          transform: `scale(${scale})`
        }}
      >
        <GameBoard />
      </div>
    </div>
  );
}

export default App;
