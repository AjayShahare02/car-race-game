import React, { useState, useEffect, useRef } from "react";
import "./App.css";

export default function App() {
  const [isLaunched, setIsLaunched] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const [carAngle, setCarAngle] = useState(0);
  const [lapCount, setLapCount] = useState(0);
  const [isNitroActive, setIsNitroActive] = useState(false);

  // Outer Track AI Car States
  const [outerCarAngle, setOuterCarAngle] = useState(0);
  const [outerLapCount, setOuterLapCount] = useState(0);
  const [outerVelocity, setOuterVelocity] = useState(20); 
  const [isOuterNitroActive, setIsOuterNitroActive] = useState(false); // AI Nitro Track Trigger
  const [winner, setWinner] = useState(null);

  // Track key press state to prevent automatic driving
  const keysPressed = useRef({});

  // Loop to periodically change the AI car's speed randomly between 20, 30, 50, and 40 km/h
  useEffect(() => {
    if (!isLaunched || winner) return;

    const speedInterval = setInterval(() => {
      const speeds = [100, 60, 60, 100, 50];
      const randomSpeed = speeds[Math.floor(Math.random() * speeds.length)];
      setOuterVelocity(randomSpeed);
    }, 1500); // Changes speed every 1.5 seconds

    return () => clearInterval(speedInterval);
  }, [isLaunched, winner]);

  // Core Physics, Translation, and AI Nitro Zone Boundary Verification Loop
  useEffect(() => {
    if (winner) return; // Freeze game actions if a champion is found

    let interval = setInterval(() => {
      if (isLaunched) {
        // ---------------- OUTER TRACK AI CAR PHYSICS (Dynamic Speed & Mid-Track Nitro) ----------------
        setOuterCarAngle((prevAngle) => {
          const nextAngle = prevAngle - (outerVelocity * 0.04);
          
          // Normalized angle tracking system to monitor middle track alignment zones
          const currentNormalizedAngle = (nextAngle + 360) % 360;
          
          // Trigger AI Nitro in the middle section of the circle path (e.g. between 90 and 270 degrees) if driving fast
          if (outerVelocity >= 50 && currentNormalizedAngle > 90 && currentNormalizedAngle < 270) {
            setIsOuterNitroActive(true);
          } else {
            setIsOuterNitroActive(false);
          }

          if (prevAngle > 0 && nextAngle <= 0) {
            setOuterLapCount((l) => {
              const nextLap = Math.min(l + 1, 6); // Updated max laps to 6
              if (nextLap === 6) setWinner("OUTER TRACK CAR");
              return nextLap;
            });
          }
          return (nextAngle + 360) % 360;
        });

        // ---------------- INNER TRACK PLAYER CAR PHYSICS ----------------
        const isAccelerating = keysPressed.current["KeyW"] || keysPressed.current["ArrowUp"];

        if (isAccelerating) {
          const targetMaxSpeed = isNitroActive ? 140 : 60;
          setVelocity((prevSpeed) => Math.min(prevSpeed + 3, targetMaxSpeed));

          setCarAngle((prevAngle) => {
            const nextAngle = prevAngle - (velocity * 0.04);
            if (prevAngle > 0 && nextAngle <= 0) {
              setLapCount((l) => {
                const nextLap = Math.min(l + 1, 6); // Updated max laps to 6
                if (nextLap === 6) setWinner("INNER TRACK CAR");
                return nextLap;
              });
            }
            return (nextAngle + 360) % 360;
          });
        } else {
          // Smooth passive deceleration
          setVelocity((prevSpeed) => Math.max(prevSpeed - 4, 0));
          if (velocity > 0) {
            setCarAngle((prevAngle) => {
              const nextAngle = prevAngle - (velocity * 0.04);
              if (prevAngle > 0 && nextAngle <= 0) {
                setLapCount((l) => {
                  const nextLap = Math.min(l + 1, 6); // Updated max laps to 6
                  if (nextLap === 6) setWinner("INNER TRACK CAR");
                  return nextLap;
                });
              }
              return (nextAngle + 360) % 360;
            });
          }
        }
      }
    }, 16); // ~60 FPS update calculation rate

    return () => clearInterval(interval);
  }, [isLaunched, isNitroActive, velocity, outerVelocity, winner]);

  // Bind active keyboard action triggers
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current[e.code] = true;
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

  const startAccelerating = () => {
    keysPressed.current["KeyW"] = true;
  };

  const stopAccelerating = () => {
    keysPressed.current["KeyW"] = false;
  };

  const triggerBrake = () => {
    setVelocity(0);
  };

  const resetGame = () => {
    setVelocity(0);
    setCarAngle(0);
    setOuterCarAngle(0);
    setLapCount(0);
    setOuterLapCount(0);
    setWinner(null);
    setIsNitroActive(false);
    setIsOuterNitroActive(false);
    setIsLaunched(false);
    setOuterVelocity(20);
  };

  // Shared reusable Vector Car Graphic
  const renderCarSVG = (color) => (
    <svg viewBox="0 0 120 60" className="vector-car-graphic">
      {/* Wheels */}
      <circle cx="30" cy="50" r="10" fill="#111" stroke="#eee" strokeWidth="2"/>
      <circle cx="30" cy="50" r="4" fill="#aaa"/>
      <circle cx="90" cy="50" r="10" fill="#111" stroke="#eee" strokeWidth="2"/>
      <circle cx="90" cy="50" r="4" fill="#aaa"/>
      
      {/* Car Base Body */}
      <path d="M 5,45 L 5,35 Q 10,25 25,25 L 40,25 Q 50,12 65,12 L 90,12 Q 105,22 112,32 L 115,45 Z" fill={color} />
      
      {/* Windows */}
      <path d="M 43,23 L 53,16 L 68,16 L 68,23 Z" fill="#2d3748" opacity="0.8"/>
      <path d="M 72,23 L 72,16 L 88,16 Q 96,22 98,23 Z" fill="#2d3748" opacity="0.8"/>
      
      {/* Checkered Roof Detail */}
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
  );

  return (
    <div className="track-container">
      {/* Top Header Deck Dashboard */}
      <div className="header-panel">
        <div className="brand-title">
          <h2>⚡ CAR RACING TRACK</h2>
          <small>👉 HOLD <kbd>W</kbd> or <kbd>▲</kbd> to drive manually! Release to stop.</small>
        </div>
        <button className={`launch-btn ${isLaunched ? "ready" : ""}`} onClick={handleLaunch} disabled={isLaunched}>
          {isLaunched ? "ENGINE READY" : "LAUNCH ENGINE"}
        </button>
      </div>

      {/* Expanded Dual-Circuit Racing Grid */}
      <div className="track-wrapper">
        
        {/* OUTER TRACK RING */}
        <div className="outer-track">
          <div className="finish-line"></div>
        </div>

        {/* OUTER CAR TRACK ORBIT SLOT */}
        <div 
          className="car-orbit-slot outer-slot" 
          style={{ transform: `rotate(${outerCarAngle}deg)` }}
        >
          <div className="car complex-car">
            {renderCarSVG("#e53e3e")}
            {/* Outer track dynamic mini-nitro flame setup */}
            {isOuterNitroActive && (
              <div className="nitro-fire-container">
                <span className="flame flame-core"></span>
                <span className="flame flame-outer"></span>
                <span className="flame flame-burst"></span>
              </div>
            )}
          </div>
        </div>

        {/* INNER TRACK AND HUB CONTAINER */}
        <div className="circular-track">
          <div className="finish-line"></div>

          {/* INNER CAR TRACK ORBIT SLOT */}
          <div 
            className="car-orbit-slot inner-slot" 
            style={{ transform: `rotate(${carAngle}deg)` }}
          >
            <div className="car player-car">
              {renderCarSVG("#e53e3e")}
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
            <div className="lap-row">
              <div className="lap-display-box">
                <small>INNER</small>
                <span className="lap-number">{lapCount}<span className="total-laps">/6</span></span>
              </div>
              <div className="lap-display-box">
                <small>OUTER</small>
                <span className="lap-number">{outerLapCount}<span className="total-laps">/6</span></span>
              </div>
            </div>
          </div>

        </div>

        {/* WINNER POPUP OVERLAY */}
        {winner && (
          <div className="winner-overlay">
            <div className="winner-card">
              <div className="winner-title">🏁 RACE FINISHED!</div>
              <div className="winner-subtitle">🏆 {winner} WINS THE RACE!</div>
              <button className="restart-btn" onClick={resetGame}>PLAY AGAIN</button>
            </div>
          </div>
        )}
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
          disabled={!isLaunched}
        >
          🚀 HOLD TO DRIVE
        </button>
        <button className="action-btn brake-action" onClick={triggerBrake} disabled={!isLaunched}>
          {`🛑 BRAKE`}
        </button>
      </div>

      {/* Control Panel Footer Telemetry view */}
      <div className="bottom-dashboard">
        <div className="velocity-display">
          <span className="label">LIVE DIGITAL VELOCITY</span>
          <div style={{ display: "flex", gap: "15px", marginTop: "4px" }}>
            <span className="value" style={{ fontSize: "20px" }}><small style={{ display: "block", fontSize: "10px", color: "#4b5970" }}>INNER</small>{velocity} <small style={{ fontSize: "11px" }}>KM/H</small></span>
            <span className="value" style={{ fontSize: "20px", color: "#00b0ff" }}><small style={{ display: "block", fontSize: "10px", color: "#4b5970" }}>OUTER</small>{isLaunched ? outerVelocity : 0} <small style={{ fontSize: "11px" }}>KM/H</small></span>
          </div>
        </div>

        <button 
          className={`nitro-toggle-btn ${isNitroActive ? "nitro-engaged" : ""}`} 
          onClick={toggleNitro}
          disabled={!isLaunched}
        >
          {isNitroActive ? "💥 NITRO ACTIVE (MAX 140 KM/H)" : "ARM NITRO OVERDRIVE"}
        </button>
      </div>
      
     <div className="credits-text">
  DESIGNED & CREATED BY <span style={{ color: "#00a2ff", fontWeight: 600 }}>AJAY SAHARE</span> | <a href="https://github.com/AjayShahare02/two_car-race-game.git" target="_blank" rel="noopener noreferrer" className="github-link">GitHub</a>
  <br /><small>V1.2 Premium Professional Manual Control Engine</small>
</div>
    </div>
  );
}