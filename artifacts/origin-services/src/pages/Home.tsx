import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, Zap, Shield, ChevronRight, Mail, Clock, ExternalLink, RefreshCw, CheckCircle } from "lucide-react";
import { SiDiscord, SiTelegram, SiInstagram, SiSteam, SiGoogle, SiEpicgames, SiGogdotcom, SiFacebook } from "react-icons/si";
import { useQuery } from "@tanstack/react-query";

interface FreeGame {
  id: number;
  title: string;
  thumbnail: string;
  image: string;
  description: string;
  platforms: string;
  store: string;
  endDate: string;
  openGiveawayUrl: string;
  worth: string;
  type: string;
}

function useCountdown(endDate: string) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!endDate || endDate === "N/A") {
      setTimeLeft("Limited Time");
      return;
    }

    const update = () => {
      const end = new Date(endDate).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m left`);
      } else {
        setTimeLeft(`${minutes}m left`);
      }
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [endDate]);

  return timeLeft;
}

function StoreIcon({ store }: { store: string }) {
  const s = store?.toLowerCase() ?? "";
  if (s.includes("epic")) return <SiEpicgames className="w-4 h-4" />;
  if (s.includes("steam")) return <SiSteam className="w-4 h-4" />;
  if (s.includes("gog")) return <SiGogdotcom className="w-4 h-4" />;
  return null;
}

function GameCard({ game, index }: { game: FreeGame; index: number }) {
  const timeLeft = useCountdown(game.endDate);
  const isUrgent = timeLeft.includes("h") && !timeLeft.includes("d");

  return (
    <motion.a
      href={game.openGiveawayUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: (index % 4) * 0.07 }}
      whileHover={{ scale: 1.02 }}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative"
      data-testid={`game-card-${game.id}`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" />
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
        <img
          src={game.thumbnail}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225' viewBox='0 0 400 225'%3E%3Crect fill='%23f3f4f6' width='400' height='225'/%3E%3C/svg%3E";
          }}
        />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium z-20">
          <StoreIcon store={game.store} />
          <span>{game.store}</span>
        </div>
        {game.worth && game.worth !== "N/A" && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-primary to-blue-400 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-md z-20">
            {game.worth}
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 relative z-20 bg-white">
        <h3 className="font-semibold text-gray-900 text-base leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {game.title}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-2 flex-1 mb-4">{game.description}</p>

        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
              isUrgent
                ? "bg-red-50 text-red-600"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            <Clock className="w-3 h-3" />
            {timeLeft}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-gray-400 group-hover:text-primary transition-colors font-medium">
            Claim <ExternalLink className="w-3 h-3" />
          </span>
        </div>
      </div>
    </motion.a>
  );
}

function GamesSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
          <div className="aspect-[16/9] bg-gray-100" />
          <div className="p-5 space-y-3">
            <div className="h-4 bg-gray-100 rounded-full w-3/4" />
            <div className="h-3 bg-gray-100 rounded-full w-full" />
            <div className="h-3 bg-gray-100 rounded-full w-2/3" />
            <div className="flex justify-between pt-2">
              <div className="h-6 bg-gray-100 rounded-full w-24" />
              <div className="h-6 bg-gray-100 rounded-full w-14" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export default function Home() {
  const { data: games, isLoading, isError, refetch } = useQuery<FreeGame[]>({
    queryKey: ["free-games"],
    queryFn: async () => {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const res = await fetch(`${base}/api/games/free`);
      if (!res.ok) throw new Error("Failed to fetch games");
      return res.json();
    },
    staleTime: 1000 * 60 * 15,
    retry: 2,
  });

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-white overflow-x-hidden font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-lg border-b border-gray-100/50 shadow-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <span className="font-display font-black text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500" data-testid="nav-logo">
            ORIGINSERVICES
          </span>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#free-games" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors" data-testid="nav-link-games">Free Games</a>
            <a href="#accounts" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors" data-testid="nav-link-accounts">Accounts</a>
            <a href="#contact" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors" data-testid="nav-link-contact">Contact</a>
          </nav>
          <a
            href="https://discord.gg/YrUQYQt4WN"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex h-11 px-7 items-center justify-center rounded-full bg-gradient-to-r from-primary to-blue-500 text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
            data-testid="nav-cta"
          >
            Order Now
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-40 px-6 overflow-hidden">
        {/* Animated Gradient Mesh Background */}
        <div className="absolute inset-0 -z-10 bg-white">
          <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-blue-300/30 rounded-full blur-[100px] mix-blend-multiply opacity-50 animate-pulse" />
          <div className="absolute top-20 right-1/4 w-[600px] h-[600px] bg-purple-300/30 rounded-full blur-[120px] mix-blend-multiply opacity-50" />
          <div className="absolute -bottom-20 left-1/2 w-[700px] h-[700px] bg-primary/20 rounded-full blur-[100px] mix-blend-multiply opacity-50" />
          {/* Subtle dot pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiM0NzU1NjkiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-60" />
        </div>

        <div className="container mx-auto max-w-6xl relative z-10 flex flex-col md:flex-row items-center gap-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="flex-1 text-center md:text-left relative">
            
            {/* Floating platform cards */}
            <motion.div 
              animate={{ y: [-10, 10, -10] }} 
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} 
              className="absolute -top-12 -left-12 hidden lg:flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-xl border border-gray-100"
            >
              <SiSteam className="w-8 h-8 text-[#171A21]" />
            </motion.div>
            <motion.div 
              animate={{ y: [10, -10, 10] }} 
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }} 
              className="absolute top-24 -right-8 hidden lg:flex items-center justify-center w-14 h-14 bg-white rounded-2xl shadow-xl border border-gray-100"
            >
              <SiEpicgames className="w-7 h-7 text-gray-900" />
            </motion.div>
            <motion.div 
              animate={{ y: [-8, 8, -8] }} 
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }} 
              className="absolute bottom-10 -left-6 hidden lg:flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-lg border border-gray-100"
            >
              <SiGoogle className="w-6 h-6 text-[#4285F4]" />
            </motion.div>

            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-primary font-semibold text-sm mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Premium Account Services
            </span>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-gray-900 mb-6 leading-[1.05]" data-testid="hero-heading">
              Your Gateway to <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-cyan-400">Gaming.</span>
            </h1>
            <p className="text-lg md:text-2xl text-gray-500 mb-10 max-w-2xl mx-auto md:mx-0 leading-relaxed font-medium" data-testid="hero-subheading">
              Discover free games as they drop — Epic, Steam, GOG and more. Plus custom accounts for any region, on demand.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mb-12">
              <a href="#free-games" className="w-full sm:w-auto h-16 px-10 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-blue-600 text-white text-lg font-bold hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300" data-testid="hero-btn-primary">
                Browse Free Games
              </a>
              <a href="#accounts" className="w-full sm:w-auto h-16 px-10 inline-flex items-center justify-center rounded-full bg-white text-gray-900 border-2 border-gray-100 text-lg font-bold hover:bg-gray-50 hover:border-gray-200 transition-all duration-300 shadow-sm hover:shadow-md" data-testid="hero-btn-secondary">
                Order an Account
              </a>
            </div>

            {/* Stats Bar */}
            <div className="flex items-center justify-center md:justify-start gap-3 text-sm md:text-base font-semibold text-gray-500 flex-wrap">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500"/> 12,000+ Gamers</span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-blue-500"/> 50+ Countries</span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-500"/> Fast Delivery</span>
            </div>
          </motion.div>

          {/* Hero Decorative Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="flex-1 hidden md:flex justify-center relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-cyan-300/20 blur-3xl rounded-full" />
            <motion.div
              className="relative z-10 w-full max-w-[380px] bg-gray-900 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 border border-gray-800"
              style={{ boxShadow: "0 0 40px rgba(59, 130, 246, 0.2)" }}
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <div className="flex items-center justify-between bg-gray-800/50 p-3 rounded-xl border border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#171A21] flex items-center justify-center text-white"><SiSteam className="w-5 h-5"/></div>
                  <span className="text-gray-200 font-semibold text-sm">Steam</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">Active</span>
              </div>
              <div className="flex items-center justify-between bg-gray-800/50 p-3 rounded-xl border border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-900"><SiEpicgames className="w-5 h-5"/></div>
                  <span className="text-gray-200 font-semibold text-sm">Epic Games</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">Active</span>
              </div>
              <div className="flex items-center justify-between bg-gray-800/50 p-3 rounded-xl border border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#4285F4]"><SiGoogle className="w-5 h-5"/></div>
                  <span className="text-gray-200 font-semibold text-sm">Google</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">Active</span>
              </div>

              <div className="h-px w-full bg-gray-800 my-2" />

              <div>
                <p className="text-xs text-gray-500 font-medium mb-3 uppercase tracking-wider">Region Selector</p>
                <div className="flex items-center gap-2">
                  {["🇺🇸", "🇬🇧", "🇹🇷", "🇦🇷"].map(flag => (
                    <div key={flag} className="flex-1 bg-gray-800 border border-gray-700 rounded-lg py-2 flex items-center justify-center text-xl cursor-default transition-colors">
                      {flag}
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full mt-2 bg-gradient-to-r from-blue-600 to-primary hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all">
                Order Now
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Free Games Section */}
      <section id="free-games" className="relative py-28 px-6 bg-gray-50">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Now
                  </span>
                  {games && (
                    <span className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-full shadow-sm">
                      {games.length} Active
                    </span>
                  )}
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight" data-testid="games-heading">
                  Free Games Right Now
                </h2>
                <p className="text-lg text-gray-500 max-w-xl font-medium" data-testid="games-subheading">
                  Real-time giveaways from Epic Games, Steam, GOG and more. Grab them before time runs out.
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-3 text-sm text-gray-500 border-r border-gray-100 pr-4">
                <SiEpicgames className="w-5 h-5 text-gray-900" />
                <SiSteam className="w-5 h-5 text-[#171A21]" />
                <SiGogdotcom className="w-5 h-5 text-purple-600" />
              </div>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors font-bold"
                data-testid="btn-refresh-games"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-primary" : ""}`} />
                Refresh
              </button>
            </motion.div>
          </div>

          {isError && (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-gray-400 mb-4 text-lg">Could not load games right now.</p>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-lg"
                data-testid="btn-retry-games"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {isLoading ? (
              <GamesSkeleton />
            ) : (
              games?.map((game, i) => (
                <GameCard key={game.id} game={game} index={i} />
              ))
            )}
          </div>

          {!isLoading && !isError && games && games.length === 0 && (
            <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-gray-900 text-2xl font-bold mb-2">No active giveaways right now.</p>
              <p className="text-gray-500 text-lg">Check back soon — new ones drop regularly.</p>
            </div>
          )}
        </div>
      </section>

      {/* Accounts Section */}
      <section id="accounts" className="py-32 bg-white px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50 rounded-full blur-[120px] opacity-60 -z-10" />
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: "easeOut" }}>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight" data-testid="accounts-heading">
                Custom Accounts,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Any Region.</span>
              </h2>
              <p className="text-gray-500 text-xl mb-12 leading-relaxed" data-testid="accounts-desc">
                We create and sell Steam & Google accounts tailored to any country you specify. Completely safe, secure, and delivered fast.
              </p>
              <div className="space-y-6 mb-12">
                {[
                  { icon: Globe, title: "Any Region, Any Country", desc: "You choose the location, we handle the creation.", color: "from-blue-50 to-blue-100/50", border: "border-blue-500", iconColor: "text-blue-600" },
                  { icon: Zap, title: "Fast Delivery", desc: "Most accounts are prepared and delivered within hours.", color: "from-amber-50 to-amber-100/50", border: "border-amber-500", iconColor: "text-amber-600" },
                  { icon: Shield, title: "100% Trusted & Safe", desc: "Premium creation methods ensuring full account security.", color: "from-emerald-50 to-emerald-100/50", border: "border-emerald-500", iconColor: "text-emerald-600" },
                ].map(({ icon: Icon, title, desc, color, border, iconColor }) => (
                  <motion.div whileHover={{ scale: 1.02 }} key={title} className={`flex items-start gap-5 p-5 rounded-2xl bg-gradient-to-r ${color} border-l-4 ${border} shadow-sm transition-transform`}>
                    <div className={`w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 ${iconColor}`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-1">{title}</h4>
                      <p className="text-gray-600 font-medium">{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div>
                <h5 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-5">Popular Regions</h5>
                <div className="flex flex-wrap gap-3">
                  {["🇺🇸 USA", "🇬🇧 UK", "🇹🇷 Turkey", "🇦🇷 Argentina", "🇧🇷 Brazil", "🇮🇳 India"].map(region => (
                    <span key={region} className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-bold bg-white text-gray-700 border-2 border-gray-100 shadow-sm hover:border-primary hover:text-primary transition-colors cursor-default">
                      {region}
                    </span>
                  ))}
                  <span className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-bold bg-gray-50 text-gray-400 border-2 border-gray-100 border-dashed">
                    + Many more
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: "easeOut" }} className="relative">
              <div className="relative aspect-[4/5] md:aspect-square w-full max-w-lg mx-auto flex items-center justify-center">
                 <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-primary/10 to-blue-400/10 blur-2xl -z-10 transform translate-y-4" />
                 
                 <div className="relative w-full max-w-[320px] h-[320px] flex items-center justify-center">
                   {/* Card 1 (Back) */}
                   <motion.div 
                     whileHover={{ y: -5 }}
                     className="absolute w-[280px] h-[160px] bg-slate-800 rounded-2xl shadow-xl p-5 border border-slate-700 flex flex-col justify-between"
                     style={{ transform: "rotate(-6deg) translateX(-10px) translateY(-10px)", zIndex: 10 }}
                   >
                     <div className="flex items-center justify-between text-white">
                       <SiSteam className="w-8 h-8 opacity-80" />
                       <span className="text-xs font-bold bg-slate-700 px-2 py-1 rounded-md text-slate-300">Steam Account</span>
                     </div>
                     <div>
                       <div className="text-sm font-semibold text-slate-400 mb-1">Region: Turkey 🇹🇷</div>
                       <div className="h-1.5 w-2/3 bg-slate-700 rounded-full"></div>
                     </div>
                   </motion.div>

                   {/* Card 2 (Middle) */}
                   <motion.div 
                     whileHover={{ y: -5 }}
                     className="absolute w-[280px] h-[160px] bg-blue-800 rounded-2xl shadow-2xl p-5 border border-blue-700 flex flex-col justify-between"
                     style={{ transform: "rotate(0deg)", zIndex: 20 }}
                   >
                     <div className="flex items-center justify-between text-white">
                       <SiGoogle className="w-8 h-8 opacity-90" />
                       <span className="text-xs font-bold bg-blue-700 px-2 py-1 rounded-md text-blue-200">Google Account</span>
                     </div>
                     <div>
                       <div className="text-sm font-semibold text-blue-300 mb-1">Region: Argentina 🇦🇷</div>
                       <div className="h-1.5 w-3/4 bg-blue-700 rounded-full"></div>
                     </div>
                   </motion.div>

                   {/* Card 3 (Front) */}
                   <motion.div 
                     whileHover={{ y: -5 }}
                     className="absolute w-[280px] h-[160px] bg-white rounded-2xl shadow-2xl p-5 border-2 border-blue-100 flex flex-col justify-between"
                     style={{ transform: "rotate(6deg) translateX(10px) translateY(10px)", zIndex: 30 }}
                   >
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                           <CheckCircle className="w-5 h-5" />
                         </div>
                         <span className="text-xs font-bold text-emerald-600">Account Ready</span>
                       </div>
                       <span className="text-xl">🇺🇸</span>
                     </div>
                     <div>
                       <div className="text-sm font-semibold text-gray-500 mb-1">Username</div>
                       <div className="text-lg font-black text-gray-900">user_#2847</div>
                     </div>
                   </motion.div>
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us (New Section) */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Faint World Map Background */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
          <Globe className="w-[800px] h-[800px] text-gray-900" strokeWidth={0.5} />
        </div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-black text-gray-900">
              Why Gamers Choose Us
            </motion.h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { stat: "10,000+", label: "Accounts Delivered" },
              { stat: "50+", label: "Regions Available" },
              { stat: "< 1 Hr", label: "Average Delivery" },
              { stat: "100%", label: "Satisfaction Rate" },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center hover:shadow-xl transition-all"
              >
                <div className="text-4xl md:text-5xl font-black text-primary mb-2 tracking-tight">{item.stat}</div>
                <div className="text-gray-500 font-bold text-sm uppercase tracking-wide">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-32 bg-gray-50 px-6 relative">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-5xl font-black text-gray-900 mb-20" data-testid="steps-heading">
            How It Works
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Animated Connector Line */}
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-1 bg-gray-200 -z-10 rounded-full overflow-hidden">
               <motion.div 
                 className="h-full bg-primary" 
                 initial={{ x: "-100%" }}
                 whileInView={{ x: "100%" }}
                 transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
               />
            </div>

            {[
              { step: 1, title: "Contact Us", desc: "Reach out via Discord to start your order." },
              { step: 2, title: "Specify Details", desc: "Tell us the platform and region you need." },
              { step: 3, title: "Get Your Account", desc: "Receive your fully secured account fast." },
            ].map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.2 }} className="flex flex-col items-center relative z-10">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-blue-400 text-white shadow-xl shadow-primary/30 flex items-center justify-center mb-8 border-4 border-white">
                  <span className="text-3xl font-black">{s.step}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{s.title}</h3>
                <p className="text-gray-500 font-medium max-w-[220px]">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="pt-32 pb-24 bg-white px-6 relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 via-primary to-purple-500" />
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-5xl font-black text-gray-900 mb-6" data-testid="contact-heading">
              Ready to Order?
            </motion.h2>
            <p className="text-gray-500 text-xl font-medium max-w-2xl mx-auto">Contact us on Discord for the fastest response to all orders and inquiries.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <motion.a
              href="https://discord.gg/YrUQYQt4WN"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="group block p-10 rounded-[2rem] bg-gradient-to-br from-[#5865F2]/10 to-[#5865F2]/5 border-2 border-[#5865F2]/20 hover:bg-[#5865F2]/10 transition-all shadow-lg shadow-[#5865F2]/5 relative overflow-hidden"
              data-testid="contact-card-discord"
            >
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#5865F2]/10 rounded-full blur-3xl group-hover:bg-[#5865F2]/20 transition-colors" />
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-[#5865F2] text-white flex items-center justify-center shadow-xl shadow-[#5865F2]/30">
                  <SiDiscord className="w-8 h-8" />
                </div>
                <span className="px-4 py-1.5 bg-white text-[#5865F2] text-xs font-black tracking-widest uppercase rounded-full shadow-sm">FASTEST RESPONSE</span>
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-2 relative z-10">Discord</h3>
              <p className="text-xl text-[#5865F2] font-bold mb-8 relative z-10">@originservices</p>
              <div className="inline-flex items-center justify-center w-full py-4 bg-white rounded-xl text-gray-900 font-bold group-hover:bg-[#5865F2] group-hover:text-white transition-colors relative z-10 shadow-sm">
                Message us now <ChevronRight className="w-5 h-5 ml-2" />
              </div>
            </motion.a>

            <div className="grid grid-rows-4 gap-4">
              {[
                { href: "https://t.me/originservices", icon: SiTelegram, iconColor: "text-[#0088cc]", iconBg: "bg-[#0088cc]/10", label: "Telegram", value: "@originservices", testId: "contact-card-telegram" },
                { href: "https://www.facebook.com/profile.php?id=61590245751450", icon: SiFacebook, iconColor: "text-[#1877F2]", iconBg: "bg-[#1877F2]/10", label: "Facebook", value: "ORIGINSERVICES", testId: "contact-card-facebook" },
                { href: "https://www.instagram.com/originservicess/", icon: SiInstagram, iconColor: "text-[#E1306C]", iconBg: "bg-[#E1306C]/10", label: "Instagram", value: "@originservicess", testId: "contact-card-instagram" },
                { href: "mailto:origingonow@gmail.com", icon: Mail, iconColor: "text-gray-600", iconBg: "bg-gray-100", label: "Email", value: "origingonow@gmail.com", testId: "contact-card-email" },
              ].map(({ href, icon: Icon, iconColor, iconBg, label, value, testId }) => (
                <motion.a
                  key={testId}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center p-5 rounded-2xl border-2 border-gray-100 hover:border-gray-200 hover:shadow-md bg-white transition-all group"
                  data-testid={testId}
                >
                  <div className={`w-12 h-12 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center mr-5`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-base">{label}</h4>
                    <p className="text-gray-500 font-medium text-sm">{value}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Wave before Footer */}
      <div className="w-full overflow-hidden leading-none bg-white">
        <svg className="block w-full h-12 md:h-24 fill-gray-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,121.32,201.39,114.6Z"></path>
        </svg>
      </div>

      {/* Footer */}
      <footer className="py-12 bg-gray-50 border-t border-gray-200/50">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className="font-display font-black text-xl tracking-tight block mb-2 text-gray-900">ORIGINSERVICES</span>
            <p className="text-gray-500 font-medium text-sm">Trusted by gamers worldwide.</p>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://discord.gg/YrUQYQt4WN" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#5865F2] hover:border-[#5865F2] hover:shadow-md transition-all" data-testid="footer-discord"><SiDiscord className="w-5 h-5" /></a>
            <a href="https://t.me/originservices" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#0088cc] hover:border-[#0088cc] hover:shadow-md transition-all" data-testid="footer-telegram"><SiTelegram className="w-5 h-5" /></a>
            <a href="https://www.facebook.com/profile.php?id=61590245751450" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#1877F2] hover:border-[#1877F2] hover:shadow-md transition-all" data-testid="footer-facebook"><SiFacebook className="w-5 h-5" /></a>
            <a href="https://www.instagram.com/originservicess/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#E1306C] hover:border-[#E1306C] hover:shadow-md transition-all" data-testid="footer-instagram"><SiInstagram className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}