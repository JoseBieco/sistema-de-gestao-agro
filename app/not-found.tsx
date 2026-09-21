import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Tractor, 
  MapPinOff, 
  Sprout, 
  Cloud, 
  Trees, 
  ArrowLeft,
  Wheat,
  Wind
} from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden selection:bg-primary/20">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-cloud-slow {
          0% { transform: translateX(-10vw); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateX(110vw); opacity: 0; }
        }
        @keyframes float-cloud-fast {
          0% { transform: translateX(-10vw); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateX(110vw); opacity: 0; }
        }
        @keyframes tractor-bump {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-4px) rotate(1deg); }
        }
        @keyframes wind-blow {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(15px); }
        }
        .cloud-slow { animation: float-cloud-slow 40s linear infinite; }
        .cloud-fast { animation: float-cloud-fast 25s linear infinite; }
        .tractor-body { animation: tractor-bump 0.5s ease-in-out infinite; }
        .wind-anim { animation: wind-blow 3s ease-in-out infinite; }
      `}} />

      {/* Atmospheric Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Sun / Moon glow */}
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] bg-warning/20 rounded-full blur-3xl opacity-50 dark:opacity-20" />
        
        {/* Clouds */}
        <div className="absolute top-[15%] left-0 text-primary/10 cloud-slow" style={{ animationDelay: '0s' }}>
          <Cloud className="w-24 h-24 sm:w-32 sm:h-32" fill="currentColor" />
        </div>
        <div className="absolute top-[25%] left-0 text-primary/10 cloud-fast" style={{ animationDelay: '-15s' }}>
          <Cloud className="w-16 h-16 sm:w-20 sm:h-20" fill="currentColor" />
        </div>
        <div className="absolute top-[10%] left-0 text-primary/10 cloud-slow" style={{ animationDelay: '-20s', top: '8%' }}>
          <Cloud className="w-32 h-32 sm:w-48 sm:h-48" fill="currentColor" />
        </div>
        
        {/* Wind */}
        <div className="absolute top-[20%] right-[30%] text-foreground/10 flex flex-col gap-4">
           <Wind className="w-8 h-8 wind-anim" style={{ animationDelay: '0ms' }} />
           <Wind className="w-6 h-6 wind-anim ml-8" style={{ animationDelay: '500ms' }} />
        </div>

        {/* Decorative Trees */}
        <div className="absolute bottom-[8%] left-[5%] text-primary/10 dark:text-primary/5">
          <Trees className="w-32 h-32 sm:w-48 sm:h-48" />
        </div>
        <div className="absolute bottom-[5%] right-[2%] text-primary/10 dark:text-primary/5">
          <Trees className="w-40 h-40 sm:w-64 sm:h-64" />
        </div>
      </div>

      {/* Main Content Container */}
      <div className="z-10 flex flex-col items-center justify-center p-6 text-center max-w-2xl w-full">
        
        {/* The 404 Typographic Art */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
          <span className="text-[120px] sm:text-[200px] font-black text-primary/90 tracking-tighter leading-none drop-shadow-sm select-none">
            4
          </span>
          
          {/* Animated 0 */}
          <div className="relative flex items-center justify-center w-28 h-28 sm:w-44 sm:h-44 rounded-full border-[10px] sm:border-[16px] border-primary/20 bg-background shadow-inner overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5"></div>
            
            <div className="tractor-body relative z-10 text-primary">
              <Tractor className="w-14 h-14 sm:w-24 sm:h-24 drop-shadow-md" strokeWidth={1.5} />
            </div>
            
            {/* Ground / Dirt line */}
            <div className="absolute bottom-0 w-full h-[30%] bg-primary/10 border-t-2 border-primary/20 flex justify-around items-start pt-1">
              <div className="w-2 h-1 rounded-full bg-primary/30 animate-pulse"></div>
              <div className="w-1 h-1 rounded-full bg-primary/30 animate-pulse delay-75"></div>
              <div className="w-3 h-1 rounded-full bg-primary/30 animate-pulse delay-150"></div>
            </div>
          </div>
          
          <span className="text-[120px] sm:text-[200px] font-black text-primary/90 tracking-tighter leading-none drop-shadow-sm select-none">
            4
          </span>
        </div>

        {/* Text content card-like area */}
        <div className="space-y-6 relative bg-background/60 backdrop-blur-md p-8 rounded-3xl border border-border/50 shadow-xl dark:shadow-none">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-destructive/10 text-destructive p-3 rounded-2xl border border-destructive/20 shadow-sm">
            <MapPinOff className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          
          <div className="space-y-2 mt-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Eita! Pasto não encontrado.
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto">
              A página que você está procurando parece ter fugido do cercado ou foi movida para outra baia.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="rounded-full w-full sm:w-auto h-12 px-8 font-semibold shadow-md hover:shadow-lg transition-all group cursor-pointer">
              <Link href="/">
                <ArrowLeft className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Voltar para a Sede
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Footer decorative grass */}
      <div className="absolute bottom-0 left-0 w-full h-12 flex items-end overflow-hidden opacity-40 dark:opacity-20 pointer-events-none">
        <div className="w-full flex justify-between px-2 sm:px-10 pb-1">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="flex items-end text-primary" style={{ animation: `bounce \${2 + (i % 3)}s infinite`}}>
              {i % 3 === 0 ? (
                <Wheat className="w-6 h-10 sm:w-8 sm:h-12" strokeWidth={1} />
              ) : (
                <Sprout className="w-5 h-6 sm:w-6 sm:h-8" strokeWidth={1.5} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
