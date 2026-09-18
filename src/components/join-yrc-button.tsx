import { Button } from "@/components/ui/button";
import { tallyPopupAttributes } from "@/lib/tally";

interface JoinYrcButtonProps {
  children?: React.ReactNode;
  className?: string;
  size?: React.ComponentProps<typeof Button>["size"];
}

/**
 * Primary "Join YRC" CTA — opens the Tally signup popup.
 * Uses the default black primary button style.
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
      className={className}
    >
      {children}
    </Button>
  );
};

export { JoinYrcButton };
