"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/shared/lib/utils"

/**
 * Scroll unificado de Dovela (shadcn/Radix).
 *
 * - Misma apariencia en todos los navegadores (no depende de ::-webkit-scrollbar).
 * - Usa los mismos tokens que la capa nativa de `src/shared/styles/scrollbar.css`
 *   (`--scrollbar-thumb*`), asi ambos se ven identicos en claro y oscuro.
 * - `orientation`: "vertical" (default) | "horizontal" | "both".
 * - `viewportRef` / `viewportClassName` / `viewportProps` exponen el viewport real
 *   (el que hace scroll) para listeners, `scrollTo`, refs de seccion, etc.
 */
function ScrollArea({
  className,
  viewportClassName,
  viewportRef,
  viewportProps,
  scrollbarClassName,
  orientation = "vertical",
  type = "auto",
  children,
  ref,
  ...props
}) {
  const showVertical = orientation === "vertical" || orientation === "both"
  const showHorizontal = orientation === "horizontal" || orientation === "both"

  return (
    <ScrollAreaPrimitive.Root
      ref={ref}
      type={type}
      data-slot="scroll-area"
      className={cn("relative overflow-hidden", className)}
      {...props}>
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        data-slot="scroll-area-viewport"
        {...viewportProps}
        className={cn(
          "h-full w-full rounded-[inherit] outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          viewportClassName,
          viewportProps?.className
        )}>
        {children}
      </ScrollAreaPrimitive.Viewport>
      {showVertical && <ScrollBar orientation="vertical" className={scrollbarClassName} />}
      {showHorizontal && <ScrollBar orientation="horizontal" className={scrollbarClassName} />}
      {showVertical && showHorizontal && <ScrollAreaPrimitive.Corner className="bg-transparent" />}
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({ className, orientation = "vertical", ref, ...props }) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      ref={ref}
      orientation={orientation}
      data-slot="scroll-area-scrollbar"
      className={cn(
        "group/scrollbar z-10 flex touch-none select-none bg-transparent p-[2px] transition-[opacity,background-color] duration-150",
        "data-[state=hidden]:opacity-0 data-[state=visible]:opacity-100",
        orientation === "vertical" && "h-full w-3 border-l border-l-transparent",
        orientation === "horizontal" && "h-3 flex-col border-t border-t-transparent",
        className
      )}
      {...props}>
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className={cn(
          "relative flex-1 rounded-full bg-[hsl(var(--scrollbar-thumb)/0.7)] transition-colors duration-150",
          "hover:bg-[hsl(var(--scrollbar-thumb-hover))] active:bg-[hsl(var(--scrollbar-thumb-active))]",
          // Hit-area ampliada en tactil sin alterar el grosor visual.
          "before:absolute before:left-1/2 before:top-1/2 before:size-full before:min-h-6 before:min-w-6 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"
        )} />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

export { ScrollArea, ScrollBar }
