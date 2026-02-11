import { ReactNode } from 'react';

type ButtonProps = {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  fullWidth?: boolean;
};

export function Button({
  children,
  variant = 'primary',
  onClick,
  type = 'button',
  disabled = false,
  fullWidth = false
}: ButtonProps) {
  const baseStyles = 'px-4 py-3 rounded-lg font-medium transition-colors text-body';

  const variantStyles = {
    primary: 'bg-[#1E40AF] text-white hover:bg-[#1E3A8A] disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'border border-[#E2E8F0] text-[#1E293B] hover:bg-[#F1F5F9] disabled:opacity-50 disabled:cursor-not-allowed'
  };

  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${widthStyles}`}
    >
      {children}
    </button>
  );
}
