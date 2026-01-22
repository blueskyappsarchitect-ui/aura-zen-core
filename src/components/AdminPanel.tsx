import { useState } from "react";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, AlertTriangle, Megaphone, Shield } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";

// Input validation constants
const MAX_MESSAGE_LENGTH = 500;
const MAX_BROADCAST_DURATION = 168; // 1 week in hours
const MIN_BROADCAST_DURATION = 1;

const AdminPanel = () => {
  const { 
    isAdmin, 
    isLoading,
    maintenanceMode, 
    globalBroadcast,
    toggleMaintenanceMode, 
    sendGlobalBroadcast,
    dismissBroadcast 
  } = useAdminSettings();

  const [maintenanceMessage, setMaintenanceMessage] = useState(maintenanceMode.message);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastDuration, setBroadcastDuration] = useState("24");

  // Don't render anything while checking admin status or if not admin
  if (isLoading || !isAdmin) return null;

  const handleMaintenanceToggle = async (enabled: boolean) => {
    const success = await toggleMaintenanceMode(enabled, maintenanceMessage);
    if (success) {
      toast.success(enabled ? "Maintenance mode enabled" : "Maintenance mode disabled");
    } else {
      toast.error("Failed to update maintenance mode");
    }
  };

  const handleSendBroadcast = async () => {
    const trimmedMessage = broadcastMessage.trim();
    
    if (!trimmedMessage) {
      toast.error("Please enter a message");
      return;
    }
    
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      toast.error(`Message must be less than ${MAX_MESSAGE_LENGTH} characters`);
      return;
    }
    
    const duration = parseInt(broadcastDuration) || 24;
    const validDuration = Math.max(MIN_BROADCAST_DURATION, Math.min(MAX_BROADCAST_DURATION, duration));
    
    const success = await sendGlobalBroadcast(
      trimmedMessage.slice(0, MAX_MESSAGE_LENGTH), 
      validDuration
    );
    if (success) {
      toast.success("Broadcast sent to all users!");
      setBroadcastMessage("");
    } else {
      toast.error("Failed to send broadcast");
    }
  };

  const handleDismissBroadcast = async () => {
    const success = await dismissBroadcast();
    if (success) {
      toast.success("Broadcast dismissed");
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="fixed top-20 left-4 z-50 bg-purple-100/80 hover:bg-purple-200/80 backdrop-blur-sm"
        >
          <Shield className="w-5 h-5 text-purple-600" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Admin Panel
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Maintenance Mode */}
          <div className="p-4 rounded-xl border bg-orange-50 border-orange-200">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-orange-800">Maintenance Mode</h3>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <Label htmlFor="maintenance-toggle">Enable</Label>
              <Switch 
                id="maintenance-toggle"
                checked={maintenanceMode.enabled}
                onCheckedChange={handleMaintenanceToggle}
              />
            </div>

            <Textarea
              placeholder="Maintenance message for users..."
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
              maxLength={MAX_MESSAGE_LENGTH}
              className="text-sm"
              rows={2}
            />
            <span className="text-xs text-muted-foreground mt-1">
              {maintenanceMessage.length}/{MAX_MESSAGE_LENGTH}
            </span>
          </div>

          {/* Global Broadcast */}
          <div className="p-4 rounded-xl border bg-blue-50 border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Megaphone className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-800">Global Broadcast</h3>
            </div>

            {globalBroadcast.active && (
              <div className="mb-3 p-2 rounded-lg bg-blue-100 text-blue-800 text-sm">
                <p className="font-medium">Active: "{globalBroadcast.message}"</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2 w-full"
                  onClick={handleDismissBroadcast}
                >
                  Dismiss
                </Button>
              </div>
            )}

            <Textarea
              placeholder="Broadcast message to all users..."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
              maxLength={MAX_MESSAGE_LENGTH}
              className="text-sm mb-2"
              rows={2}
            />
            <span className="text-xs text-muted-foreground mb-2">
              {broadcastMessage.length}/{MAX_MESSAGE_LENGTH}
            </span>

            <div className="flex items-center gap-2 mb-3">
              <Label htmlFor="duration" className="text-xs">Duration (hours):</Label>
              <Input
                id="duration"
                type="number"
                min={MIN_BROADCAST_DURATION}
                max={MAX_BROADCAST_DURATION}
                value={broadcastDuration}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || MIN_BROADCAST_DURATION;
                  setBroadcastDuration(String(Math.max(MIN_BROADCAST_DURATION, Math.min(MAX_BROADCAST_DURATION, val))));
                }}
                className="w-20 text-sm"
              />
            </div>

            <Button 
              onClick={handleSendBroadcast}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Megaphone className="w-4 h-4 mr-2" />
              Send Broadcast
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AdminPanel;
