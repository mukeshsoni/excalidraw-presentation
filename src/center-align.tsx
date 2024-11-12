import React from 'react';

export default function CenterAlign({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        position: 'absolute',
        boxShadow: '0px 1px 4px 0px #cccccc',
      }}
    >
      {children}
    </div>
  );
}
