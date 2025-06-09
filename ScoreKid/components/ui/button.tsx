import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";
import { usePlatform } from "../../contexts/PlatformContext";
import { triggerHapticFeedback } from "../../utils/platformDetection";

import { cn } from "./utils";

// Base button variants
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-[0.98] touch:active:scale-[0.98] mobile:min-h-[44px] mobile:min-w-[44px]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 android:shadow-md ios:border ios:border-primary/20",
        destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 android:shadow-md ios:border ios:border-destructive/20",
        outline: "border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 android:border-2 ios:border",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 android:shadow-sm ios:border ios:border-secondary/30",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 ios:hover:bg-accent/20 android:hover:bg-accent/10",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3 mobile:h-11 mobile:px-6",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 mobile:h-10 mobile:px-4",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4 mobile:h-12 mobile:px-8",
        icon: "size-9 rounded-md mobile:size-11",
      },
      platform: {
        ios: "ios:rounded-xl ios:font-semibold ios:tracking-tight",
        android: "android:rounded android:font-medium android:tracking-wide android:uppercase android:text-xs",
        web: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      platform: "web",
    },
  },
);

// iOS-specific button variants
const iosButtonVariants = cva("", {
  variants: {
    variant: {
      default: "bg-blue-500 text-white border border-blue-600/30 active:bg-blue-600",
      destructive: "bg-red-500 text-white border border-red-600/30 active:bg-red-600",
      outline: "bg-transparent text-blue-500 border border-blue-500/30 active:bg-blue-50 dark:active:bg-blue-950",
      secondary: "bg-gray-100 text-gray-900 border border-gray-200 active:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:active:bg-gray-700",
      ghost: "bg-transparent text-blue-500 active:bg-blue-50 dark:active:bg-blue-950",
      link: "text-blue-500 active:text-blue-600",
    }
  }
});

// Android/Material button variants
const materialButtonVariants = cva("", {
  variants: {
    variant: {
      default: "bg-blue-600 text-white shadow-md hover:shadow-lg active:shadow-sm",
      destructive: "bg-red-600 text-white shadow-md hover:shadow-lg active:shadow-sm",
      outline: "bg-transparent text-blue-600 border-2 border-blue-600 active:bg-blue-50 dark:active:bg-blue-950",
      secondary: "bg-gray-200 text-gray-900 shadow-sm hover:shadow-md active:shadow-none dark:bg-gray-700 dark:text-gray-100",
      ghost: "bg-transparent text-blue-600 active:bg-blue-50 dark:active:bg-blue-950",
      link: "text-blue-600 active:text-blue-700",
    }
  }
});

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
      haptic?: boolean;
    }
>(({ className, variant, size, asChild = false, haptic = true, onClick, ...props }, ref) => {
  const { platform, theme, isTouch } = usePlatform();
  const Comp = asChild ? Slot : "button";

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Trigger haptic feedback if enabled and on touch device
    if (haptic && isTouch) {
      if (variant === 'destructive') {
        triggerHapticFeedback('medium');
      } else {
        triggerHapticFeedback('light');
      }
    }

    // Call original onClick
    if (onClick) {
      onClick(event);
    }
  };

  // Determine platform-specific styles
  let platformVariant = platform as 'ios' | 'android' | 'web';
  let platformSpecificClasses = '';

  if (theme === 'cupertino') {
    platformSpecificClasses = iosButtonVariants({ variant });
  } else if (theme === 'material') {
    platformSpecificClasses = materialButtonVariants({ variant });
  }

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, platform: platformVariant, className }),
        platformSpecificClasses
      )}
      ref={ref}
      onClick={handleClick}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };