import React from 'react';

type CustomButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
export default function EmptyButton({ style, ...props }: CustomButtonProps) {
  return (
    <button
      style={{
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        ...style,
      }}
      {...props}
    />
  );
}
