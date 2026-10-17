"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { Icon } from "@/components/ui/icon"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <Icon name="check_circle" className="size-icon-md" />
        ),
        info: (
          <Icon name="info" className="size-icon-md" />
        ),
        warning: (
          <Icon name="warning" className="size-icon-md" />
        ),
        error: (
          <Icon name="dangerous" className="size-icon-md" />
        ),
        loading: (
          <Icon name="progress_activity" className="size-icon-md animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
