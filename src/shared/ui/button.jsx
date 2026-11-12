import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/shared/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium text-foreground border-0 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-65 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background text-foreground hover:bg-muted hover:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "text-foreground hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Accessible-name fallback for icon-only buttons (legacy action columns render
// <Button><Icon name="edit" /></Button> with no text). Only applies when the single
// child is an icon with a known name and the caller gave no aria-label / title.
const ICON_ONLY_LABELS = {
  edit: "Editar", pencil: "Editar", pen: "Editar", Pencil: "Editar",
  "trash-alt": "Eliminar", trash: "Eliminar", Trash2: "Eliminar",
  search: "Consultar", eye: "Ver", Eye: "Ver",
  download: "Descargar", "cloud-download-alt": "Descargar", Download: "Descargar",
  plus: "Añadir", "plus-circle": "Añadir", Plus: "Añadir",
  times: "Cerrar", "times-circle": "Cerrar", X: "Cerrar",
  MoreHorizontal: "Más acciones", MoreVertical: "Más acciones",
  "chevron-left": "Anterior", "chevron-right": "Siguiente",
}

function getIconOnlyLabel(children) {
  const items = React.Children.toArray(children)
  if (items.length !== 1 || !React.isValidElement(items[0])) return undefined
  const iconName = items[0].props?.name
  return typeof iconName === "string" ? ICON_ONLY_LABELS[iconName] : undefined
}

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  const hasAccessibleName = props["aria-label"] || props["aria-labelledby"] || props.title
  const iconOnlyLabel = asChild || hasAccessibleName ? undefined : getIconOnlyLabel(props.children)
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      aria-label={iconOnlyLabel}
      title={iconOnlyLabel}
      {...props} />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
