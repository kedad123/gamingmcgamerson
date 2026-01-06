import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { toast } from "sonner";

interface DevDialogProps {
  onUnlockAll: () => void;
  onResetAll: () => void;
}

export const DevDialog = ({ onUnlockAll, onResetAll }: DevDialogProps) => {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "evj@gr") {
      setAuthenticated(true);
      onUnlockAll();
      setPassword("");
      toast.success("All difficulties unlocked!");
    } else {
      toast.error("Incorrect password");
    }
  };

  const handleReset = () => {
    localStorage.removeItem("calculator-records");
    localStorage.removeItem("unlockedDifficulties");
    onResetAll();
    setOpen(false);
    setAuthenticated(false);
    toast.success("All game data reset!");
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setAuthenticated(false);
      setPassword("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="fixed bottom-4 right-4 opacity-30 hover:opacity-100 transition-opacity"
        >
          <Settings className="w-4 h-4 mr-1" />
          Dev
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Developer Access</DialogTitle>
        </DialogHeader>
        {!authenticated ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
              <Button type="submit" className="w-full">
                Submit
              </Button>
            </form>
            <p className="text-sm text-muted-foreground text-center mt-2">
              (tell me my username on Discord)
            </p>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Developer tools unlocked
            </p>
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleReset}
            >
              Reset All Game Data
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
