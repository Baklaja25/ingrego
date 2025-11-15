"use client"

import * as React from "react"
import Image, { type StaticImageData } from "next/image"
import { cn } from "@/lib/utils"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt?: string
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#FBEED7] text-[#FF8C42]",
          className
        )}
        aria-label={alt}
        {...props}
      >
        {src ? (
          <Image
            src={src}
            alt={alt ?? ""}
            fill
            sizes="40px"
            className="object-cover"
            unoptimized
          />
        ) : (
          children
        )}
      </div>
    )
  }
)
Avatar.displayName = "Avatar"

export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {}

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center text-sm font-medium uppercase",
        className
      )}
      {...props}
    />
  )
)
AvatarFallback.displayName = "AvatarFallback"

type AvatarImageSrc = string | StaticImageData | null | undefined

export interface AvatarImageProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Image>, "src" | "alt"> {
  src?: AvatarImageSrc
  alt?: string
}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  (
    {
      className,
      src,
      alt = "",
      unoptimized = true,
      width,
      height,
      fill,
      sizes,
      ...props
    },
    ref
  ) => {
    if (!src) {
      return null
    }

    if (fill) {
      return (
        <Image
          ref={ref}
          src={src}
          alt={alt}
          className={cn("h-full w-full object-cover", className)}
          unoptimized={unoptimized}
          fill
          sizes={sizes ?? "64px"}
          {...props}
        />
      )
    }

    const resolvedWidth = width ?? 64
    const resolvedHeight = height ?? 64

    return (
      <Image
        ref={ref}
        src={src}
        alt={alt}
        className={cn("h-full w-full object-cover", className)}
        unoptimized={unoptimized}
        width={resolvedWidth}
        height={resolvedHeight}
        {...props}
      />
    )
  }
)
AvatarImage.displayName = "AvatarImage"

export { Avatar, AvatarFallback, AvatarImage }


