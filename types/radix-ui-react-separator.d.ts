declare module "@radix-ui/react-separator" {
  import * as React from "react"

  export interface SeparatorProps extends React.ComponentPropsWithoutRef<"div"> {
    decorative?: boolean
    orientation?: "horizontal" | "vertical"
  }

  export const Root: React.ForwardRefExoticComponent<
    SeparatorProps & React.RefAttributes<HTMLDivElement>
  >
}





















