import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

// @ts-ignore
const Avatar = React.forwardRef<
  // @ts-ignore
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  // @ts-ignore
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  // @ts-ignore
  <AvatarPrimitive.Root
    // @ts-ignore
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

// @ts-ignore
const AvatarImage = React.forwardRef<
  // @ts-ignore
  React.ComponentRef<typeof AvatarPrimitive.Image>,
  // @ts-ignore
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  // @ts-ignore
  <AvatarPrimitive.Image
    // @ts-ignore
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

// @ts-ignore
const AvatarFallback = React.forwardRef<
  // @ts-ignore
  React.ComponentRef<typeof AvatarPrimitive.Fallback>,
  // @ts-ignore
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  // @ts-ignore
  <AvatarPrimitive.Fallback
    // @ts-ignore
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
