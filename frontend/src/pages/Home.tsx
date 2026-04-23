import React, { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Headphones, Mail, CheckCircle2, ChevronRight } from 'lucide-react';
import Button from '@components/ui/Button';
import ProductCard from '@components/product/ProductCard';
import Skeleton from '@components/ui/Skeleton';
import { useProducts } from '@hooks/useProducts';
import { useData } from '../context/DataContext';

const Home: React.FC = () => {
  const { categories: dbCategories } = useData();
  const filters = React.useMemo(() => ({ limit: 8 }), []);
  const { products, isLoading } = useProducts(filters);
  
  // Safeguard: Ensure products is an array before slicing
  const productsArray = Array.isArray(products) ? products : [];
  const featuredProducts = productsArray.slice(0, 4);
  const newArrivals = productsArray.slice(4, 8);

  // Hero Animations
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  const wordRevealVariants: any = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    })
  };

  return (
    <div className="overflow-hidden">
      <Helmet>
        <title>AlphaPowerZone | Engineered For Performance</title>
        <meta name="description" content="Shop premium gym equipment, apparel, and supplements. Engineered for athletes who demand results." />
      </Helmet>

      {/* SECTION 1: HERO */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-20 px-6 md:px-12 lg:px-24 overflow-hidden bg-brand-background">
        {/* Background Accent Shapes */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              x: [0, 50, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-24 -right-24 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, -45, 0],
              x: [0, -30, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-24 -left-24 w-80 h-80 bg-brand-accent/10 rounded-full blur-3xl" 
          />
        </div>

        <motion.div style={{ opacity, y }} className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl">
            <div className="flex flex-wrap gap-x-3 gap-y-1 mb-6">
              {"Engineered For Performance".split(" ").map((word, i) => (
                <div key={i} className="overflow-hidden pb-4 -mb-4 pr-8 -mr-8">
                  <motion.span
                    custom={i}
                    variants={wordRevealVariants}
                    initial="hidden"
                    animate="visible"
                    className="block text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-5xl 2xl:text-6xl font-black font-display tracking-tighter italic uppercase text-brand-text-primary"
                  >
                    {word}
                  </motion.span>
                </div>
              ))}
            </div>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-lg md:text-xl text-brand-text-secondary mb-10 max-w-lg leading-relaxed"
            >
              Premium gym equipment, apparel, and supplements — built for athletes who demand results. Join the elite squad today.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/shop">
                <Button size="xl" className="w-full sm:w-auto px-12 group">
                  Shop Collection
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/fitness">
                <Button variant="ghost" size="xl" className="w-full sm:w-auto px-10">
                  Explore Fitness AI
                </Button>
              </Link>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block relative"
          >
            <div className="relative aspect-square">
              <div className="absolute inset-0 bg-brand-accent/5 rounded-brand-xl rotate-3 scale-105" />
              <img 
                src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070" 
                alt="Elite Athlete" 
                className="w-full h-full object-cover rounded-brand-xl shadow-brand-xl relative z-10"
              />
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-8 -left-8 bg-white p-6 rounded-brand-lg shadow-brand-lg z-20 border border-brand-border"
              >
                <p className="text-xs font-mono uppercase tracking-widest text-brand-text-muted mb-1">Performance Gear</p>
                <p className="text-lg font-bold font-display italic">99.9% RELIABILITY</p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-brand-text-muted"
        >
          <span className="text-[10px] font-mono uppercase tracking-widest">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-brand-accent to-transparent" />
        </motion.div>
      </section>

      {/* SECTION 2: CATEGORY SHOWCASE */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-brand-accent font-bold mb-2">Collections</p>
              <h2 className="text-4xl md:text-5xl font-black font-display italic uppercase tracking-tighter">Shop By Category</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dbCategories.slice(0, 3).map((cat: any, i: number) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative h-[600px] rounded-brand-xl overflow-hidden cursor-pointer"
              >
                <Link to={`/shop?category=${cat.slug}`}>
                  <img src={cat.image || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070'} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
                  <div className="absolute bottom-10 left-10 text-white">
                    <h3 className="text-3xl font-black font-display uppercase italic tracking-tighter mb-4">{cat.name}</h3>
                    <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                      View Range
                    </Button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: BEST SELLERS */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-brand-surface-alt">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-brand-accent font-bold mb-2">Trending Now</p>
              <h2 className="text-4xl md:text-5xl font-black font-display italic uppercase tracking-tighter">Best Sellers</h2>
            </div>
            <Link to="/shop" className="group flex items-center gap-2 text-brand-text-secondary hover:text-brand-accent transition-colors font-bold uppercase tracking-widest text-xs">
              View All Collection
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="card" />
              ))
            ) : (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* SECTION 4: FITNESS AI TEASER */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-brand-accent-light relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-brand-accent/20 text-brand-accent-hover px-4 py-2 rounded-full font-bold uppercase tracking-widest text-xs mb-8"
          >
            <div className="w-2 h-2 bg-brand-accent rounded-full animate-ping" />
            Next Gen Fitness
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black font-display italic uppercase tracking-tighter mb-6 leading-[0.9]">
            Your AI Fitness Coach <br /> <span className="text-brand-accent">Powered By APZ</span>
          </h2>
          <p className="text-xl text-brand-text-secondary mb-12 max-w-2xl mx-auto">
            Stop guessing. Our AI analyzes your biometrics to build the ultimate performance blueprint tailored to your exact physiology.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {['BMI Analysis', 'Personalized Plans', 'Supplement Guide'].map((p) => (
              <div key={p} className="bg-white px-6 py-3 rounded-full border border-brand-accent/20 shadow-brand-sm font-bold uppercase tracking-widest text-xs">
                {p}
              </div>
            ))}
          </div>

          <Link to="/fitness">
            <Button size="xl" className="px-12">Get Your Free Plan</Button>
          </Link>
        </div>
      </section>

      {/* SECTION 5: TRUST SIGNALS */}
      <section className="py-20 px-6 md:px-12 lg:px-24 bg-white border-y border-brand-border">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            { icon: <Truck />, title: 'Free Shipping', desc: 'On all orders over $150' },
            { icon: <RefreshCw />, title: 'Easy Returns', desc: '30-day hassle free policy' },
            { icon: <ShieldCheck />, title: 'Genuine Gear', desc: '100% authentic equipment' },
            { icon: <Headphones />, title: 'Expert Support', desc: '24/7 dedicated assistance' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-5">
              <div className="w-14 h-14 bg-brand-surface-alt rounded-brand-lg flex items-center justify-center text-brand-accent">
                {React.cloneElement(item.icon as React.ReactElement<any>, { size: 28 })}
              </div>
              <div>
                <h4 className="font-bold font-display uppercase tracking-tight italic">{item.title}</h4>
                <p className="text-sm text-brand-text-muted">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6: NEW ARRIVALS */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-brand-accent font-bold mb-2">New Season</p>
              <h2 className="text-4xl md:text-5xl font-black font-display italic uppercase tracking-tighter">Fresh Drop</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="card" />)
            ) : (
              newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* SECTION 7: TESTIMONIALS */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-brand-text-primary text-white overflow-hidden">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <p className="text-xs font-mono uppercase tracking-widest text-brand-accent font-bold mb-2">The Community</p>
          <h2 className="text-4xl md:text-5xl font-black font-display italic uppercase tracking-tighter">Real Athletes, Real Results</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {[
            { name: 'Marcus J.', rating: 5, text: "APZ equipment changed my home gym game. The build quality is unmatched compared to other brands." },
            { name: 'Sarah L.', rating: 5, text: "The AI guide gave me a nutrition plan that actually works. Lost 5kg in 2 months while gaining strength." },
            { name: 'David K.', rating: 5, text: "Fast shipping and the compression gear fits perfectly. It feels like a second skin during heavy lifts." },
          ].map((rev, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 border border-white/10 p-10 rounded-brand-xl backdrop-blur-md"
            >
              <div className="flex text-brand-accent mb-4">
                {Array.from({ length: rev.rating }).map((_, i) => (
                  <CheckCircle2 key={i} size={16} fill="currentColor" className="text-brand-accent" />
                ))}
              </div>
              <p className="text-zinc-400 italic text-lg mb-8 leading-relaxed">"{rev.text}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-accent rounded-full flex items-center justify-center font-bold text-lg">
                  {rev.name[0]}
                </div>
                <div className="text-left">
                  <p className="font-bold font-display uppercase tracking-tight italic">{rev.name}</p>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest">Verified Athlete</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 8: NEWSLETTER */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-brand-accent text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Mail className="w-12 h-12 mx-auto mb-8 animate-bounce" />
          <h2 className="text-4xl md:text-6xl font-black font-display italic uppercase tracking-tighter mb-4">Join The APZ Inner Circle</h2>
          <p className="text-xl text-white/80 mb-10">Get early access to elite drops, training tips, and member-only pricing.</p>
          
          <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input 
              type="email" 
              placeholder="Enter your elite email" 
              className="flex-grow bg-white/10 border border-white/20 rounded-brand-md px-6 py-4 text-white placeholder:text-white/50 focus:bg-white/20 focus:outline-none transition-all"
            />
            <Button variant="secondary" size="lg" className="px-10 h-[60px] whitespace-nowrap">
              Subscribe Now
            </Button>
          </form>
          <p className="text-[10px] text-white/50 mt-6 uppercase tracking-widest">No spam. Only performance. Unsubscribe anytime.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
