import React, { useState, useEffect, useRef } from "react";
import "./App.css";

export default function App() {
  const [isLaunched, setIsLaunched] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const [carAngle, setCarAngle] = useState(0);
  const [lapCount, setLapCount] = useState(0);
  const [isNitroActive, setIsNitroActive] = useState(false);

  // Track key press state to prevent automatic driving
  const keysPressed = useRef({});

  // Core Physics and Translation Loop
  useEffect(() => {
    let interval = setInterval(() => {
      // ONLY move if the game engine is launched AND the forward acceleration key is being held down
      const isAccelerating = keysPressed.current["KeyW"] || keysPressed.current["ArrowUp"];

      if (isLaunched && isAccelerating) {
        // Set target speed based on nitro status
        const targetMaxSpeed = isNitroActive ? 140 : 60;
        
        // Smooth acceleration physics
        setVelocity((prevSpeed) => Math.min(prevSpeed + 3, targetMaxSpeed));

        // Update car angle position along the track circuit (Moving left / counter-clockwise)
        setCarAngle((prevAngle) => {
          const nextAngle = prevAngle - (velocity * 0.04);
          
          // Lap counter checker when car crosses the finish line boundary going counter-clockwise
          if (prevAngle > 0 && nextAngle <= 0) {
            setLapCount((l) => Math.min(l + 1, 3));
          }
          return (nextAngle + 360) % 360;
        });
      } else {
        // Smooth passive deceleration when you release the acceleration key
        setVelocity((prevSpeed) => Math.max(prevSpeed - 4, 0));
        
        if (velocity > 0) {
          setCarAngle((prevAngle) => (prevAngle - (velocity * 0.04) + 360) % 360);
        }
      }
    }, 16); // ~60 FPS update calculation rate

    return () => clearInterval(interval);
  }, [isLaunched, isNitroActive, velocity]);

  // Bind active keyboard action triggers
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current[e.code] = true;

      // Emergency Brake System
      if (e.code === "Space") {
        e.preventDefault();
        setVelocity(0);
      }
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.code] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleLaunch = () => {
    setIsLaunched(true);
  };

  const toggleNitro = () => {
    setIsNitroActive(!isNitroActive);
  };

  // On-screen control helpers for touch devices
  const startAccelerating = () => {
    keysPressed.current["KeyW"] = true;
  };

  const stopAccelerating = () => {
    keysPressed.current["KeyW"] = false;
  };

  const triggerBrake = () => {
    setVelocity(0);
  };

  return (
    <div className="track-container">
      {/* Top Header Deck Dashboard */}
      <div className="header-panel">
        <div className="brand-title">
          <h2>⚡ CAR RACING TRACK</h2>
          <small>👉 HOLD <kbd>W</kbd> or <kbd>▲</kbd> to drive manually! Release to stop.</small>
        </div>
        <button className={`launch-btn ${isLaunched ? "ready" : ""}`} onClick={handleLaunch}>
          {isLaunched ? "ENGINE READY" : "LAUNCH ENGINE"}
        </button>
      </div>

      {/* Enlarged Racing Circuit Grid */}
      <div className="track-wrapper">
        <div className="circular-track">
          
          {/* Checkered Finish Line Banner */}
          <div className="finish-line"></div>

          {/* ACTIVE RACING CAR ORBIT CONTAINER */}
          <div 
            className="car-orbit-slot" 
            style={{ transform: `rotate(${carAngle}deg)` }}
          >
            <div className="car player-car">
              {/* Detailed custom Red Vector Sedan matching the reference design image */}
              <svg viewBox="0 0 120 60" className="vector-car-graphic">
                {/* Wheels */}
                <circle cx="30" cy="50" r="10" fill="#111" stroke="#eee" strokeWidth="2"/>
                <circle cx="30" cy="50" r="4" fill="#aaa"/>
                <circle cx="90" cy="50" r="10" fill="#111" stroke="#eee" strokeWidth="2"/>
                <circle cx="90" cy="50" r="4" fill="#aaa"/>
                
                {/* Car Base Body */}
                <path d="M 5,45 L 5,35 Q 10,25 25,25 L 40,25 Q 50,12 65,12 L 90,12 Q 105,22 112,32 L 115,45 Z" fill="#e53e3e" />
                
                {/* Windows */}
                <path d="M 43,23 L 53,16 L 68,16 L 68,23 Z" fill="#2d3748" opacity="0.8"/>
                <path d="M 72,23 L 72,16 L 88,16 Q 96,22 98,23 Z" fill="#2d3748" opacity="0.8"/>
                
                {/* Checkered Taxi/Racer Graphic Roof Detail */}
                <rect x="58" y="8" width="6" height="4" fill="#fff" />
                <rect x="64" y="8" width="6" height="4" fill="#000" />
                <rect x="70" y="8" width="6" height="4" fill="#fff" />
                <rect x="58" y="10" width="6" height="2" fill="#000" />
                <rect x="64" y="10" width="6" height="2" fill="#fff" />
                <rect x="70" y="10" width="6" height="2" fill="#000" />
                
                {/* Lights */}
                <path d="M 5,35 L 9,35 L 9,39 L 5,39 Z" fill="#ecc94b"/>
                <path d="M 112,32 L 115,34 L 114,38 L 111,36 Z" fill="#ecc94b"/>
              </svg>

              {/* Nitro Exhaust Flames ignite ONLY when driving forward with Nitro engaged */}
              {isNitroActive && velocity > 20 && (
                <div className="nitro-fire-container">
                  <span className="flame flame-core"></span>
                  <span className="flame flame-outer"></span>
                  <span className="flame flame-burst"></span>
                </div>
              )}
            </div>
          </div>

          {/* Core Info lap statistics circle hub */}
          <div className="inner-dashboard">
            <span className="lap-label">🔥 LAP COUNTER</span>
            <span className="lap-number">{lapCount}<span className="total-laps">/3</span></span>
          </div>

        </div>
      </div>

      {/* On-Screen Touch Input Controls Panel */}
      <div className="mobile-action-controls">
        <button 
          className="action-btn drive-action"
          onTouchStart={startAccelerating}
          onTouchEnd={stopAccelerating}
          onMouseDown={startAccelerating}
          onMouseUp={stopAccelerating}
          onMouseLeave={stopAccelerating}
        >
          🚀 HOLD TO DRIVE
        </button>
        <button className="action-btn brake-action" onClick={triggerBrake}>
          🛑 BRAKE
        </button>
      </div>

      {/* Control Panel Footer Telemetry view */}
      <div className="bottom-dashboard">
        <div className="velocity-display">
          <span className="label">LIVE DIGITAL VELOCITY</span>
          <span className="value">{velocity} <small>KM/H</small></span>
        </div>

        <button 
          className={`nitro-toggle-btn ${isNitroActive ? "nitro-engaged" : ""}`} 
          onClick={toggleNitro}
        >
          {isNitroActive ? "💥 NITRO ACTIVE (MAX 140 KM/H)" : "ARM NITRO OVERDRIVE"}
        </button>
      </div>
      
      <div className="credits-text">
        DESIGNED & CREATED BY <span>AJAY SAHARE</span>
        <br /><small>V1.2 Premium Professional Manual Control Engine</small>
      </div>
    </div>
  );
}