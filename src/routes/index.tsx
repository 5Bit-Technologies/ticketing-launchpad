import { createFileRoute } from "@tanstack/react-router";
import heroImg from "@/assets/hero-concert.jpg";
import { Ticket, Calendar, MapPin, ArrowRight, Zap, Shield, Sparkles, QrCode } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pulse — Live event ticketing without the friction" },
      { name: "description", content: "Discover concerts, festivals and shows. Secure tickets in seconds with instant QR delivery, fair pricing and zero hidden fees." },
      { property: "og:title", content: "Pulse — Live event ticketing" },
      { property: "og:description", content: "Discover concerts, festivals and shows. Secure tickets in seconds." },
    ],
  }),
  component: Landing,
});

const events = [
  { title: "Midnight Echo Tour", artist: "Arlo Vance", date: "Fri, Oct 24", venue: "The Fillmore · SF", price: 68, tag: "Hot" },
  { title: "Neon Bloom Festival", artist: "30+ artists", date: "Sat, Nov 8", venue: "Pier 70 · SF", price: 145, tag: "Few left" },
  { title: "Quiet Storm Live", artist: "Mira Okafor", date: "Thu, Nov 14", venue: "Greek Theatre · LA", price: 52, tag: "New" },
  { title: "Static Garden", artist: "Halfway Home", date: "Sat, Dec 6", venue: "Bowery Ballroom · NY", price: 38, tag: "Hot" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border/50">
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 font-display font-bold text-lg">
            <div className="w-8 h-8 rounded-lg bg-gradient-hero shadow-glow grid place-items-center">
              <Ticket className="w-4 h-4 text-primary-foreground" />
            </div>
            Pulse
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#events" className="hover:text-foreground transition">Events</a>
            <a href="#features" className="hover:text-foreground transition">Why Pulse</a>
            <a href="#organizers" className="hover:text-foreground transition">For organizers</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" className="hidden sm:block text-sm text-muted-foreground hover:text-foreground">Sign in</a>
            <a href="#events" className="text-sm font-medium px-4 py-2 rounded-full bg-foreground text-background hover:opacity-90 transition">
              Browse events
            </a>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt="" width={1920} height={1280} className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card text-xs text-muted-foreground mb-6">
              <Sparkles className="w-3 h-3 text-neon" />
              Over 2M tickets delivered this year
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] mb-6">
              Feel the night. <br />
              <span className="text-gradient">Skip the queue.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mb-8">
              Pulse is the cleanest way to buy tickets to the shows you actually care about. Honest pricing, instant QR delivery, no nonsense.
            </p>

            {/* Search */}
            <div className="glass-card rounded-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-2xl">
              <div className="flex-1 flex items-center gap-3 px-4 py-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <input
                  placeholder="City or venue"
                  className="bg-transparent w-full text-sm placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
              <div className="hidden sm:block w-px bg-border/50 my-2" />
              <div className="flex-1 flex items-center gap-3 px-4 py-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <input
                  placeholder="Any date"
                  className="bg-transparent w-full text-sm placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
              <button className="bg-gradient-hero text-primary-foreground font-medium px-6 py-3 rounded-xl shadow-glow hover:opacity-95 transition flex items-center justify-center gap-2">
                Search <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-8 mt-10 text-sm text-muted-foreground">
              <div><span className="text-foreground font-semibold">12k+</span> events live</div>
              <div><span className="text-foreground font-semibold">4.9★</span> avg rating</div>
              <div className="hidden sm:block"><span className="text-foreground font-semibold">0%</span> hidden fees</div>
            </div>
          </div>

          {/* Floating ticket */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm">
              <div className="absolute -inset-8 bg-gradient-hero opacity-30 blur-3xl rounded-full" />
              <div className="relative glass-card rounded-3xl p-6 rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span>ADMIT ONE</span>
                  <span>#PLS-2419</span>
                </div>
                <div className="h-40 rounded-2xl bg-gradient-hero mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,oklch(1_0_0_/_0.3),transparent_50%)]" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <div className="text-primary-foreground/80 text-xs">FRI · OCT 24 · 9PM</div>
                    <div className="text-primary-foreground font-display font-bold text-xl">Midnight Echo</div>
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-xs text-muted-foreground">Section</div>
                    <div className="font-display font-semibold">GA · Floor</div>
                  </div>
                  <div className="w-16 h-16 rounded-lg bg-foreground grid place-items-center">
                    <QrCode className="w-10 h-10 text-background" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events */}
      <section id="events" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="text-sm text-neon font-medium mb-2">Trending now</div>
              <h2 className="text-4xl md:text-5xl font-bold">This week's drops</h2>
            </div>
            <a href="#" className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              See all events <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {events.map((e) => (
              <article key={e.title} className="group glass-card rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 hover:shadow-glow">
                <div className="aspect-[4/5] bg-gradient-hero relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,oklch(1_0_0_/_0.25),transparent_60%)]" />
                  <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-background/70 backdrop-blur">
                    {e.tag}
                  </span>
                  <div className="absolute bottom-4 left-4 right-4 text-primary-foreground">
                    <div className="text-xs opacity-80">{e.date}</div>
                    <div className="font-display font-bold text-lg leading-tight mt-1">{e.title}</div>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{e.artist}</div>
                    <div className="text-xs text-muted-foreground truncate">{e.venue}</div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <div className="text-[10px] text-muted-foreground uppercase">from</div>
                    <div className="font-display font-bold">${e.price}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Built for the people who actually go.</h2>
            <p className="text-muted-foreground text-lg">No hidden fees the day of. No printer required. No bots taking your seats.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Zap, title: "Instant delivery", body: "Tickets land in your wallet the moment you check out. No email scavenger hunt." },
              { icon: Shield, title: "Verified resale", body: "Every resold ticket is cryptographically verified. You never get burned at the door." },
              { icon: Ticket, title: "Honest pricing", body: "The price you see is the price you pay. Fees broken out before you tap buy." },
            ].map((f) => (
              <div key={f.title} className="glass-card rounded-2xl p-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-hero grid place-items-center mb-6 shadow-glow">
                  <f.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Organizers CTA */}
      <section id="organizers" className="py-24 px-6">
        <div className="max-w-6xl mx-auto glass-card rounded-3xl p-10 md:p-16 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-hero opacity-30 blur-3xl rounded-full" />
          <div className="relative grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-sm text-neon font-medium mb-3">For organizers</div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Sell out faster. Keep more.</h2>
              <p className="text-muted-foreground text-lg mb-8">
                Launch a show in under five minutes. Built-in fraud protection, real-time analytics, and the lowest take rate in the industry.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="#" className="px-6 py-3 rounded-full bg-gradient-hero text-primary-foreground font-medium shadow-glow hover:opacity-95 transition">
                  Start selling
                </a>
                <a href="#" className="px-6 py-3 rounded-full border border-border hover:bg-secondary transition font-medium text-sm">
                  Talk to sales
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { k: "2.5%", v: "Per-ticket fee" },
                { k: "24h", v: "Payouts" },
                { k: "98%", v: "Sell-through" },
                { k: "0", v: "Setup cost" },
              ].map((s) => (
                <div key={s.v} className="glass-card rounded-2xl p-6">
                  <div className="text-3xl font-display font-bold text-gradient">{s.k}</div>
                  <div className="text-sm text-muted-foreground mt-1">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-display font-bold">
            <div className="w-7 h-7 rounded-lg bg-gradient-hero grid place-items-center">
              <Ticket className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            Pulse
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Help</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
          <div className="text-xs text-muted-foreground">© 2026 Pulse Tickets, Inc.</div>
        </div>
      </footer>
    </div>
  );
}
