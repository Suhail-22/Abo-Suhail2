
import React from 'react';

interface OverlayProps {
  show: boolean;
  onClick: () => void;
  zIndex?: string;
  position?: 'absolute' | 'fixed';
}

const Overlay: React.FC<OverlayProps> = ({ show, onClick, zIndex = 'z-40', position = 'absolute' }) => {
  return (
    <div
      onClick={onClick}
      className={`${position} inset-0 bg-black/70 transition-opacity duration-300 ${show ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} ${zIndex}`}
    />
  );
};

export default Overlay;