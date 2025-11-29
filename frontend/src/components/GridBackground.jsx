import Book from '../assets/Book.svg';
import Laptop from '../assets/Laptop.svg';
import Pencil from '../assets/pencil.svg';
import Hat from '../assets/hat.svg';

function GridBackground() {
  return (
    <>
    
 
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        className="fixed inset-0 -z-10"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="5"
            />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="#0d0d0d" />
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Vignette */}
      <div className="fixed inset-0 -z-10 pointer-events-none bg-linear-to-br from-black/60 via-transparent to-black/70"></div>

      {/* Study Icons */}
      <div className="absolute top-0 left-0 w-full h-screen -z-10 overflow-hidden pointer-events-none hidden md:block">
        <img
          src={Book}
          className="absolute top-[30%] left-[10%] w-16 md:w-24 opacity-20 animate-float-slow"
        />
        <img
          src={Laptop}
          className="absolute top-[70%] left-[80%] w-16 md:w-24 opacity-20 animate-float-slow"
        />
        <img
          src={Pencil}
          className="absolute top-[60%] left-[20%] w-20 md:w-32 opacity-20 animate-float-slow rotate-275"
        />
        <img
          src={Hat}
          className="absolute top-[30%] left-[80%] w-16 md:w-24 opacity-20 animate-float-slow rotate-20"
        />
      </div>
    </>
  );
}
export default GridBackground;