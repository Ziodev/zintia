import React from 'react';

interface LogoProps {
  /** * Permite inyectar clases de Tailwind para controlar el tamaño general 
   * Ejemplo: h-8 en móvil, md:h-10 en desktop 
   */
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = 'h-8' }) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Isotipo: Z Abstracta / Onda de Streaming */}
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
      >
        <path
          d="M8 24L14 8H24L18 24H8Z"
          className="fill-rose-500"
        />
        <path
          d="M6 18L10 8H16L12 18H6Z"
          className="fill-rose-500/50"
        />
        <path
          d="M14 24L18 14H24L20 24H14Z"
          className="fill-fuchsia-500"
        />
      </svg>

      {/* Tipografía Premium */}
      <div className="flex items-baseline font-sans tracking-tight">
        {/* Marca principal - Peso visual fuerte */}
        <span className="font-extrabold text-slate-50 text-2xl leading-none">
          Zintia
        </span>
        {/* Vertical/Descriptivo - Peso visual ligero */}
        <span className="font-normal text-slate-400 text-2xl leading-none ml-[1px]">
          Vids
        </span>
        {/* Punto de acento - Cierra el diseño */}
        <span className="text-rose-500 font-black text-2xl leading-none ml-0.5">
          .
        </span>
      </div>
    </div>
  );
};
