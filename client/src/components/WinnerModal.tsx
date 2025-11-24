import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trophy, Crown } from "lucide-react";

interface WinnerModalProps {
  open: boolean;
  onClose: () => void;
  winnerName: string;
  handName: string;
  isTableWinner?: boolean;
}

export function WinnerModal({ open, onClose, winnerName, handName, isTableWinner = false }: WinnerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-lg text-center"
        data-testid="winner-modal"
      >
        <DialogHeader>
          <div className="flex justify-center mb-4">
            {isTableWinner ? (
              <Trophy className="w-20 h-20 text-accent animate-bounce-in" />
            ) : (
              <Crown className="w-20 h-20 text-accent animate-bounce-in" />
            )}
          </div>
          <DialogTitle className="text-3xl font-display">
            {isTableWinner ? "Table Winner!" : "Round Winner!"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Winner</div>
            <div className="text-2xl font-bold text-foreground" data-testid="winner-name">
              {winnerName}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground mb-1">Winning Hand</div>
            <div className="text-xl font-semibold text-accent" data-testid="winning-hand">
              {handName}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
