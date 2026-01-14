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
    if (!broadcastMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }
    const success = await sendGlobalBroadcast(broadcastMessage, parseInt(broadcastDuration) || 24);
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
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              className="text-sm"
              rows={2}
            />
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
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="text-sm mb-2"
              rows={2}
            />

            <div className="flex items-center gap-2 mb-3">
              <Label htmlFor="duration" className="text-xs">Duration (hours):</Label>
              <Input
                id="duration"
                type="number"
                value={broadcastDuration}
                onChange={(e) => setBroadcastDuration(e.target.value)}
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
