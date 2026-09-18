import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { tallyPopupAttributes } from "@/lib/tally";

interface JoinYrcButtonProps {
  children?: React.ReactNode;
  className?: string;
  size?: React.ComponentProps<typeof Button>["size"];
}

/**
 * Primary "Join YRC" CTA — opens the Tally signup popup.
 * Uses the YRC yellow accent as the site's primary action color.
 */
const JoinYrcButton = ({
  children = "Join YRC",
  className,
  size = "lg",
}: JoinYrcButtonProps) => {
  return (
    <Button
      size={size}
      {...tallyPopupAttributes}
      className={cn(
        "bg-yrc-accent text-yrc-accent-foreground hover:bg-yrc-accent/80",
        className,
      )}
    >
      {children}
    </Button>
  );
};

export { JoinYrcButton };
