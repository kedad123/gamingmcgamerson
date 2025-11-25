import { useState, useEffect } from "react";
import { SimulationCanvas } from "@/components/SimulationCanvas";
import { ControlPanel } from "@/components/ControlPanel";
import { StatsPanel } from "@/components/StatsPanel";
import { setSoundsEnabled, setMusicEnabled } from "@/lib/soundEffects";

const Index = () => {
  const [gravity, setGravity] = useState(0.5);
  const [elasticity, setElasticity] = useState(0.8);
  const [ballCount, setBallCount] = useState(10);
  const [ballSize, setBallSize] = useState(15);
  const [ballShape, setBallShape] = useState("circle");
  const [containerShape, setContainerShape] = useState("square");
  const [collisionEnabled, setCollisionEnabled] = useState(false);
  const [growOnBounce, setGrowOnBounce] = useState(false);
  const [lavaRise, setLavaRise] = useState(false);
  const [containerShrink, setContainerShrink] = useState(false);
  const [addSidesOnBounce, setAddSidesOnBounce] = useState(false);
  const [containerAddSidesOnBounce, setContainerAddSidesOnBounce] = useState(false);
  const [addBallOnBounce, setAddBallOnBounce] = useState(false);
  const [blackHoleMode, setBlackHoleMode] = useState(false);
  const [swordMode, setSwordMode] = useState(false);
  const [dualLaunchMode, setDualLaunchMode] = useState(false);
  const [mergeBalls, setMergeBalls] = useState(false);
  const [splitOnBounce, setSplitOnBounce] = useState(false);
  const [rpsMode, setRpsMode] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [soundsOn, setSoundsOn] = useState(true);
  const [musicOn, setMusicOn] = useState(false);

  const handleReset = () => {
    setResetTrigger((prev) => prev + 1);
  };

  const handleTogglePause = () => {
    setIsPaused((prev) => !prev);
  };


  // Auto-enable collision when RPS mode is turned on
  useEffect(() => {
    if (rpsMode && !collisionEnabled) {
      setCollisionEnabled(true);
    }
  }, [rpsMode]);

  // Auto-disable RPS mode when collision is turned off
  useEffect(() => {
    if (!collisionEnabled && rpsMode) {
      setRpsMode(false);
    }
  }, [collisionEnabled]);

  useEffect(() => {
    setSoundsEnabled(soundsOn);
  }, [soundsOn]);

  useEffect(() => {
    setMusicEnabled(musicOn);
  }, [musicOn]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'r') {
        handleReset();
      } else if (event.key.toLowerCase() === 'p') {
        handleTogglePause();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
            Bouncing Balls Physics Simulator
          </h1>
          <p className="text-muted-foreground">
            Adjust the variables and watch the physics in action
          </p>
        </header>

        <div className="grid lg:grid-cols-[1fr_350px] gap-6">
          <div className="h-[500px] md:h-[600px]">
            <SimulationCanvas
              gravity={gravity}
              elasticity={elasticity}
              ballCount={ballCount}
              ballSize={ballSize}
              ballShape={ballShape}
            containerShape={containerShape}
            collisionEnabled={collisionEnabled}
            growOnBounce={growOnBounce}
            lavaRise={lavaRise}
            containerShrink={containerShrink}
            addSidesOnBounce={addSidesOnBounce}
            containerAddSidesOnBounce={containerAddSidesOnBounce}
            addBallOnBounce={addBallOnBounce}
            blackHoleMode={blackHoleMode}
            swordMode={swordMode}
            dualLaunchMode={dualLaunchMode}
            mergeBalls={mergeBalls}
            splitOnBounce={splitOnBounce}
            rpsMode={rpsMode}
            resetTrigger={resetTrigger}
            isPaused={isPaused}
            />
          </div>

          <div className="lg:h-[600px]">
            <ControlPanel
              gravity={gravity}
              setGravity={setGravity}
              elasticity={elasticity}
              setElasticity={setElasticity}
              ballCount={ballCount}
              setBallCount={setBallCount}
              ballSize={ballSize}
              setBallSize={setBallSize}
              ballShape={ballShape}
              setBallShape={setBallShape}
              containerShape={containerShape}
              setContainerShape={setContainerShape}
            collisionEnabled={collisionEnabled}
            setCollisionEnabled={setCollisionEnabled}
            growOnBounce={growOnBounce}
            setGrowOnBounce={setGrowOnBounce}
            lavaRise={lavaRise}
            setLavaRise={setLavaRise}
            containerShrink={containerShrink}
            setContainerShrink={setContainerShrink}
            addSidesOnBounce={addSidesOnBounce}
            setAddSidesOnBounce={setAddSidesOnBounce}
            containerAddSidesOnBounce={containerAddSidesOnBounce}
            setContainerAddSidesOnBounce={setContainerAddSidesOnBounce}
            addBallOnBounce={addBallOnBounce}
            setAddBallOnBounce={setAddBallOnBounce}
            blackHoleMode={blackHoleMode}
            setBlackHoleMode={setBlackHoleMode}
            swordMode={swordMode}
            setSwordMode={setSwordMode}
            dualLaunchMode={dualLaunchMode}
            setDualLaunchMode={setDualLaunchMode}
            mergeBalls={mergeBalls}
            setMergeBalls={setMergeBalls}
            splitOnBounce={splitOnBounce}
            setSplitOnBounce={setSplitOnBounce}
            rpsMode={rpsMode}
            setRpsMode={setRpsMode}
            showStats={showStats}
            setShowStats={setShowStats}
            soundsOn={soundsOn}
            setSoundsOn={setSoundsOn}
            musicOn={musicOn}
            setMusicOn={setMusicOn}
            onReset={handleReset}
            isPaused={isPaused}
            onTogglePause={handleTogglePause}
            />
          </div>
        </div>

        {showStats && (
          <StatsPanel
            gravity={gravity}
            elasticity={elasticity}
            ballCount={ballCount}
            ballSize={ballSize}
            ballShape={ballShape}
            containerShape={containerShape}
            collisionEnabled={collisionEnabled}
            growOnBounce={growOnBounce}
            lavaRise={lavaRise}
            containerShrink={containerShrink}
            addSidesOnBounce={addSidesOnBounce}
            containerAddSidesOnBounce={containerAddSidesOnBounce}
            addBallOnBounce={addBallOnBounce}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
