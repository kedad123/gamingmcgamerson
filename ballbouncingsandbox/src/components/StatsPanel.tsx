import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface StatsPanelProps {
  gravity: number;
  elasticity: number;
  ballCount: number;
  ballSize: number;
  ballShape: string;
  containerShape: string;
  collisionEnabled: boolean;
  growOnBounce: boolean;
  lavaRise: boolean;
  containerShrink: boolean;
  addSidesOnBounce: boolean;
  containerAddSidesOnBounce: boolean;
  addBallOnBounce: boolean;
}

export const StatsPanel = ({
  gravity,
  elasticity,
  ballCount,
  ballSize,
  ballShape,
  containerShape,
  collisionEnabled,
  growOnBounce,
  lavaRise,
  containerShrink,
  addSidesOnBounce,
  containerAddSidesOnBounce,
  addBallOnBounce,
}: StatsPanelProps) => {
  const stats = [
    { label: "Gravity", value: gravity.toFixed(2) },
    { label: "Elasticity", value: elasticity.toFixed(2) },
    { label: "Ball Count", value: ballCount },
    { label: "Ball Size", value: `${ballSize}px` },
    { label: "Ball Shape", value: ballShape },
    { label: "Container Shape", value: containerShape },
    { label: "Ball Collision", value: collisionEnabled ? "ON" : "OFF" },
    { label: "Grow on Bounce", value: growOnBounce ? "ON" : "OFF" },
    { label: "Lava Rise", value: lavaRise ? "ON" : "OFF" },
    { label: "Container Shrink", value: containerShrink ? "ON" : "OFF" },
    { label: "Add Sides on Bounce", value: addSidesOnBounce ? "ON" : "OFF" },
    { label: "Container Add Sides", value: containerAddSidesOnBounce ? "ON" : "OFF" },
    { label: "Add Ball on Bounce", value: addBallOnBounce ? "ON" : "OFF" },
  ];

  return (
    <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/20 w-fit max-w-3xl">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Stats for Nerds</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {stats.map((stat, index) => (
          <div key={index} className="bg-background/50 rounded p-2">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-sm font-semibold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};
