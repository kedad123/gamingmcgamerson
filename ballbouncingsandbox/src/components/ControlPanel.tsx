import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RotateCcw, Pause, Play } from "lucide-react";

interface ControlPanelProps {
  gravity: number;
  setGravity: (value: number) => void;
  elasticity: number;
  setElasticity: (value: number) => void;
  ballCount: number;
  setBallCount: (value: number) => void;
  ballSize: number;
  setBallSize: (value: number) => void;
  ballShape: string;
  setBallShape: (value: string) => void;
  containerShape: string;
  setContainerShape: (value: string) => void;
  collisionEnabled: boolean;
  setCollisionEnabled: (value: boolean) => void;
  growOnBounce: boolean;
  setGrowOnBounce: (value: boolean) => void;
  lavaRise: boolean;
  setLavaRise: (value: boolean) => void;
  containerShrink: boolean;
  setContainerShrink: (value: boolean) => void;
  addSidesOnBounce: boolean;
  setAddSidesOnBounce: (value: boolean) => void;
  containerAddSidesOnBounce: boolean;
  setContainerAddSidesOnBounce: (value: boolean) => void;
  addBallOnBounce: boolean;
  setAddBallOnBounce: (value: boolean) => void;
  blackHoleMode: boolean;
  setBlackHoleMode: (value: boolean) => void;
  swordMode: boolean;
  setSwordMode: (value: boolean) => void;
  dualLaunchMode: boolean;
  setDualLaunchMode: (value: boolean) => void;
  mergeBalls: boolean;
  setMergeBalls: (value: boolean) => void;
  splitOnBounce: boolean;
  setSplitOnBounce: (value: boolean) => void;
  rpsMode: boolean;
  setRpsMode: (value: boolean) => void;
  showStats: boolean;
  setShowStats: (value: boolean) => void;
  soundsOn: boolean;
  setSoundsOn: (value: boolean) => void;
  musicOn: boolean;
  setMusicOn: (value: boolean) => void;
  onReset: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
}

export const ControlPanel = ({
  gravity,
  setGravity,
  elasticity,
  setElasticity,
  ballCount,
  setBallCount,
  ballSize,
  setBallSize,
  ballShape,
  setBallShape,
  containerShape,
  setContainerShape,
  collisionEnabled,
  setCollisionEnabled,
  growOnBounce,
  setGrowOnBounce,
  lavaRise,
  setLavaRise,
  containerShrink,
  setContainerShrink,
  addSidesOnBounce,
  setAddSidesOnBounce,
  containerAddSidesOnBounce,
  setContainerAddSidesOnBounce,
  addBallOnBounce,
  setAddBallOnBounce,
  blackHoleMode,
  setBlackHoleMode,
  swordMode,
  setSwordMode,
  dualLaunchMode,
  setDualLaunchMode,
  mergeBalls,
  setMergeBalls,
  splitOnBounce,
  setSplitOnBounce,
  rpsMode,
  setRpsMode,
  showStats,
  setShowStats,
  soundsOn,
  setSoundsOn,
  musicOn,
  setMusicOn,
  onReset,
  isPaused,
  onTogglePause,
}: ControlPanelProps) => {
  return (
    <Card className="p-6 space-y-6 bg-card/80 backdrop-blur-sm border-primary/20">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Physics Controls</h2>
        <div className="flex gap-2">
          <div className="flex flex-col items-center gap-1">
            <Button
              onClick={onTogglePause}
              variant="outline"
              size="sm"
              className="gap-2 transition-smooth hover:border-primary"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isPaused ? "Resume" : "Pause"}
            </Button>
            <span className="text-[10px] text-muted-foreground">Press P</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Button
              onClick={onReset}
              variant="outline"
              size="sm"
              className="gap-2 transition-smooth hover:border-primary"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            <span className="text-[10px] text-muted-foreground">Press R</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="gravity" className="text-sm font-medium">
              Gravity
            </Label>
            <span className="text-sm text-muted-foreground">{gravity.toFixed(2)}</span>
          </div>
          <Slider
            id="gravity"
            min={0}
            max={2}
            step={0.1}
            value={[gravity]}
            onValueChange={(value) => setGravity(value[0])}
            className="transition-smooth"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="elasticity" className="text-sm font-medium">
              Elasticity
            </Label>
            <span className="text-sm text-muted-foreground">{elasticity.toFixed(2)}</span>
          </div>
          <Slider
            id="elasticity"
            min={0}
            max={1}
            step={0.05}
            value={[elasticity]}
            onValueChange={(value) => setElasticity(value[0])}
            className="transition-smooth"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="ballCount" className="text-sm font-medium">
              Ball Count
            </Label>
            <span className="text-sm text-muted-foreground">{ballCount}</span>
          </div>
          <Slider
            id="ballCount"
            min={1}
            max={50}
            step={1}
            value={[ballCount]}
            onValueChange={(value) => setBallCount(value[0])}
            className="transition-smooth"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="ballSize" className="text-sm font-medium">
              Ball Size
            </Label>
            <span className="text-sm text-muted-foreground">{ballSize}px</span>
          </div>
          <Slider
            id="ballSize"
            min={5}
            max={40}
            step={1}
            value={[ballSize]}
            onValueChange={(value) => setBallSize(value[0])}
            className="transition-smooth"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ballShape" className="text-sm font-medium">
            Ball Shape
          </Label>
          <Select value={ballShape} onValueChange={setBallShape}>
            <SelectTrigger id="ballShape">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="circle">Circle</SelectItem>
              <SelectItem value="square">Square</SelectItem>
              <SelectItem value="triangle">Triangle</SelectItem>
              <SelectItem value="pentagon">Pentagon</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="containerShape" className="text-sm font-medium">
            Container Shape
          </Label>
          <Select value={containerShape} onValueChange={setContainerShape}>
            <SelectTrigger id="containerShape">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="square">Square</SelectItem>
              <SelectItem value="circle">Circle</SelectItem>
              <SelectItem value="triangle">Triangle</SelectItem>
              <SelectItem value="pentagon">Pentagon</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="collision" className="text-sm font-medium">
            Ball-to-Ball Collision
          </Label>
          <Switch
            id="collision"
            checked={collisionEnabled}
            onCheckedChange={(checked) => {
              setCollisionEnabled(checked);
              if (!checked) {
                setMergeBalls(false);
                setRpsMode(false);
              }
            }}
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="growOnBounce" className="text-sm font-medium">
            Grow on Bounce
          </Label>
          <Switch
            id="growOnBounce"
            checked={growOnBounce}
            onCheckedChange={setGrowOnBounce}
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="lavaRise" className="text-sm font-medium">
            Lava Rise
          </Label>
          <Switch
            id="lavaRise"
            checked={lavaRise}
            onCheckedChange={setLavaRise}
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="containerShrink" className="text-sm font-medium">
            Container Shrink on Bounce
          </Label>
          <Switch
            id="containerShrink"
            checked={containerShrink}
            onCheckedChange={setContainerShrink}
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="addSidesOnBounce" className="text-sm font-medium">
            Add Sides on Bounce
          </Label>
          <Switch
            id="addSidesOnBounce"
            checked={addSidesOnBounce}
            onCheckedChange={setAddSidesOnBounce}
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="containerAddSidesOnBounce" className="text-sm font-medium">
            Container Add Sides on Bounce
          </Label>
          <Switch
            id="containerAddSidesOnBounce"
            checked={containerAddSidesOnBounce}
            onCheckedChange={setContainerAddSidesOnBounce}
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="addBallOnBounce" className="text-sm font-medium">
            Add Ball on Bounce
          </Label>
          <Switch
            id="addBallOnBounce"
            checked={addBallOnBounce}
            onCheckedChange={setAddBallOnBounce}
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="blackHoleMode" className="text-sm font-medium">
            Black Hole Mode
          </Label>
          <Switch
            id="blackHoleMode"
            checked={blackHoleMode}
            onCheckedChange={setBlackHoleMode}
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="swordMode" className="text-sm font-medium">
            Sword Mode
          </Label>
          <Switch
            id="swordMode"
            checked={swordMode}
            onCheckedChange={setSwordMode}
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="dualLaunchMode" className="text-sm font-medium">
            Dual Launch Mode
          </Label>
          <Switch
            id="dualLaunchMode"
            checked={dualLaunchMode}
            onCheckedChange={setDualLaunchMode}
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="mergeBalls" className="text-sm font-medium">
            Merge Balls on Collision
          </Label>
          <Switch
            id="mergeBalls"
            checked={mergeBalls}
            onCheckedChange={(checked) => {
              setMergeBalls(checked);
              if (checked) {
                setCollisionEnabled(true);
                setSplitOnBounce(false);
              }
            }}
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="splitOnBounce" className="text-sm font-medium">
            Split on Bounce
          </Label>
          <Switch
            id="splitOnBounce"
            checked={splitOnBounce}
            onCheckedChange={(checked) => {
              setSplitOnBounce(checked);
              if (checked) {
                setMergeBalls(false);
              }
            }}
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="rpsMode" className="text-sm font-medium">
            RPS Mode (Rock Paper Scissors)
          </Label>
          <Switch
            id="rpsMode"
            checked={rpsMode}
            onCheckedChange={(checked) => {
              setRpsMode(checked);
              if (checked) {
                setCollisionEnabled(true);
                setMergeBalls(false);
              }
            }}
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="soundsOn" className="text-sm font-medium">
            Sound Effects
          </Label>
          <Switch
            id="soundsOn"
            checked={soundsOn}
            onCheckedChange={setSoundsOn}
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="musicOn" className="text-sm font-medium">
            Background Music
          </Label>
          <Switch
            id="musicOn"
            checked={musicOn}
            onCheckedChange={setMusicOn}
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="showStats" className="text-sm font-medium">
            Show Stats for Nerds
          </Label>
          <Switch
            id="showStats"
            checked={showStats}
            onCheckedChange={setShowStats}
          />
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Experiment with different shapes and collision physics to create unique simulations.
        </p>
      </div>
    </Card>
  );
};
