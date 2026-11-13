import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
};

export function Button({
  className = "",
  fullWidth = false,
  variant = "primary",
  ...props
}: ButtonProps) {
  const classes = [
    "button",
    `button--${variant}`,
    fullWidth ? "button--full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <button className={classes} {...props} />;
}

type CardProps = ComponentProps<"section">;

export function Card({ className = "", ...props }: CardProps) {
  return <section className={`card ${className}`.trim()} {...props} />;
}

type TextInputProps = ComponentProps<"input">;

export function TextInput({ className = "", ...props }: TextInputProps) {
  return <input className={`field ${className}`.trim()} {...props} />;
}

type DialogProps = ComponentProps<"dialog">;

export function Dialog({ className = "", ...props }: DialogProps) {
  return <dialog className={`dialog ${className}`.trim()} {...props} />;
}

type NoticeProps = ComponentProps<"div"> & {
  tone?: "error" | "success" | "info";
};

export function Notice({
  className = "",
  role,
  tone = "info",
  ...props
}: NoticeProps) {
  return (
    <div
      className={`notice notice--${tone} ${className}`.trim()}
      role={role ?? (tone === "error" ? "alert" : "status")}
      {...props}
    />
  );
}

type ToastProps = ComponentProps<"div"> & {
  tone?: "error" | "success" | "info";
};

export function Toast({
  className = "",
  role,
  tone = "info",
  ...props
}: ToastProps) {
  return (
    <div
      className={`toast toast--${tone} ${className}`.trim()}
      role={role ?? (tone === "error" ? "alert" : "status")}
      {...props}
    />
  );
}
