"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Crown, Check, Sparkles } from "lucide-react"
import { upgradeUserToPro } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  onUpgradeComplete: () => void
}

export function UpgradeModal({ isOpen, onClose, onUpgradeComplete }: UpgradeModalProps) {
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const handleUpgrade = async () => {
    setIsUpgrading(true)

    // Simulate upgrade process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const success = upgradeUserToPro()

    if (success) {
      setIsSuccess(true)
      toast({
        title: "Welcome to Pro! 🎉",
        description: "You now have access to all premium features.",
        variant: "default",
      })

      // Wait a moment to show success, then close and refresh
      setTimeout(() => {
        setIsSuccess(false)
        setIsUpgrading(false)
        onUpgradeComplete()
        onClose()
      }, 2000)
    } else {
      setIsUpgrading(false)
      toast({
        title: "Upgrade failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleClose = () => {
    if (!isUpgrading) {
      onClose()
    }
  }

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Welcome to Pro!</h3>
            <p className="text-muted-foreground">
              Your account has been upgraded successfully. Enjoy all premium features!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription>Unlock all premium features and get the most out of GrantPilot</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm">Full grant details and descriptions</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm">Save unlimited grants</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm">Track application progress</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm">AI-powered writing assistance</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm">Priority customer support</span>
            </div>
          </div>

          <div className="bg-primary/5 p-4 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">$29/month</div>
              <div className="text-sm text-muted-foreground">Cancel anytime</div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleClose} disabled={isUpgrading} className="flex-1 bg-transparent">
            Maybe Later
          </Button>
          <Button
            onClick={handleUpgrade}
            disabled={isUpgrading}
            className="flex-1 bg-gradient-to-r from-primary to-primary/80"
          >
            {isUpgrading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Upgrading...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Upgrade Now
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
