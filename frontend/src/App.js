import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Import UI components
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { Textarea } from './components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Toaster } from './components/ui/toaster';
import { useToast } from './hooks/use-toast';

// Icons
import { 
  Palette, Users, MessageSquare, FileText, Settings, Home, User, LogOut, Upload, Download, CreditCard, Eye, Edit, Plus, Send, CheckCircle, Clock, Lock, ShoppingCart, Moon, Sun, Code, Box, Video, Music, Star, Quote, ArrowRight, Play, Mail, Phone, MapPin, Menu, X, Filter, ExternalLink
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Theme Context
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark', !isDark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div className={isDark ? 'dark' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Auth Context
const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserInfo();
    }
  }, [token]);

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
      setToken(null);
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const login = async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await axios.post(`${API}/auth/login`, formData);
    const { access_token, user: userData } = response.data;
    
    localStorage.setItem('token', access_token);
    setToken(access_token);
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const register = async (userData) => {
    const response = await axios.post(`${API}/auth/register`, userData);
    return response.data;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Interactive Logo Component
const InteractiveLogo = ({ size = 'w-8 h-8', className = '' }) => {
  return (
    <div className={`${size} ${className} interactive-logo cursor-pointer`}>
      <img 
        src="https://customer-assets.emergentagent.com/job_33bbef14-ff4b-4136-9e36-664559466616/artifacts/4dkvnitj_Eternals%20Studio.png"
        alt="Eternals Studio"
        className="w-full h-full object-contain hover:scale-110 transition-transform duration-300"
      />
    </div>
  );
};

// Mouse-Following Logo Elements Component with Web Effect (OPTIMIZED)
const FloatingElements = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [logos, setLogos] = useState([
    { id: 1, x: 150, y: 250, size: 'w-8 h-8', opacity: 0.7, delay: 0, color: 'seafoam' },
    { id: 2, x: 400, y: 200, size: 'w-8 h-8', opacity: 0.6, delay: 0.5, color: 'violet' },
    { id: 3, x: 650, y: 350, size: 'w-9 h-9', opacity: 0.8, delay: 1, color: 'seafoam' },
    { id: 4, x: 900, y: 180, size: 'w-7 h-7', opacity: 0.5, delay: 1.5, color: 'violet' },
    { id: 5, x: 1100, y: 280, size: 'w-8 h-8', opacity: 0.9, delay: 2, color: 'seafoam' },
    { id: 6, x: 300, y: 450, size: 'w-8 h-8', opacity: 0.7, delay: 2.5, color: 'violet' },
    { id: 7, x: 800, y: 400, size: 'w-8 h-8', opacity: 0.6, delay: 3, color: 'seafoam' },
    { id: 8, x: 550, y: 500, size: 'w-9 h-9', opacity: 0.8, delay: 3.5, color: 'violet' },
    { id: 9, x: 200, y: 120, size: 'w-7 h-7', opacity: 0.5, delay: 4, color: 'seafoam' },
    { id: 10, x: 750, y: 150, size: 'w-8 h-8', opacity: 0.6, delay: 4.5, color: 'violet' },
    { id: 11, x: 1050, y: 450, size: 'w-7 h-7', opacity: 0.7, delay: 5, color: 'seafoam' },
    { id: 12, x: 450, y: 350, size: 'w-8 h-8', opacity: 0.8, delay: 5.5, color: 'violet' },
    { id: 13, x: 350, y: 180, size: 'w-7 h-7', opacity: 0.6, delay: 6, color: 'seafoam' },
    { id: 14, x: 1200, y: 380, size: 'w-8 h-8', opacity: 0.7, delay: 6.5, color: 'violet' }
  ]);

  const [connections, setConnections] = useState([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const updateLogosAndConnections = () => {
      setLogos(prevLogos => {
        const updatedLogos = prevLogos.map(logo => {
          const distance = Math.sqrt(
            Math.pow(mousePosition.x - logo.x, 2) + Math.pow(mousePosition.y - logo.y, 2)
          );
          
          if (distance < 160) {
            const angle = Math.atan2(mousePosition.y - logo.y, mousePosition.x - logo.x);
            const repelForce = Math.max(0, 160 - distance) * 0.5;
            
            return {
              ...logo,
              x: Math.max(80, Math.min(window.innerWidth - 80, logo.x - Math.cos(angle) * repelForce)),
              y: Math.max(80, Math.min(window.innerHeight - 80, logo.y - Math.sin(angle) * repelForce)),
              opacity: Math.min(1, logo.opacity + 0.2)
            };
          } else {
            // Gentle drift
            const driftX = (Math.random() - 0.5) * 0.4;
            const driftY = (Math.random() - 0.5) * 0.4;
            
            return {
              ...logo,
              x: Math.max(100, Math.min(window.innerWidth - 100, logo.x + driftX)),
              y: Math.max(100, Math.min(window.innerHeight - 100, logo.y + driftY)),
              opacity: Math.max(0.4, logo.opacity - 0.005)
            };
          }
        });

        // Calculate connections between nearby logos (optimized)
        const newConnections = [];
        for (let i = 0; i < updatedLogos.length; i++) {
          for (let j = i + 1; j < updatedLogos.length; j++) {
            const logo1 = updatedLogos[i];
            const logo2 = updatedLogos[j];
            const distance = Math.sqrt(
              Math.pow(logo1.x - logo2.x, 2) + Math.pow(logo1.y - logo2.y, 2)
            );
            
            if (distance < 150) {
              const opacity = Math.max(0, (150 - distance) / 150) * 0.8;
              newConnections.push({
                id: `${logo1.id}-${logo2.id}`,
                x1: logo1.x,
                y1: logo1.y,
                x2: logo2.x,
                y2: logo2.y,
                opacity: opacity,
                color: logo1.color === logo2.color ? logo1.color : 'mixed'
              });
            }
          }
        }
        
        setConnections(newConnections);
        return updatedLogos;
      });
    };

    const interval = setInterval(updateLogosAndConnections, 100); // Optimized from 60ms
    return () => clearInterval(interval);
  }, [mousePosition]);

  const getLogoColor = (color, opacity) => {
    if (color === 'seafoam') {
      return {
        filter: `brightness(1.3) contrast(1.2) saturate(1.5) hue-rotate(160deg)`,
        borderColor: '#2dd4bf', // Proper seafoam green
        boxShadow: `0 0 25px rgba(45, 212, 191, ${opacity * 0.9}), 0 0 50px rgba(45, 212, 191, ${opacity * 0.4})`
      };
    } else {
      return {
        filter: `brightness(1.3) contrast(1.2) saturate(1.5) hue-rotate(260deg)`,
        borderColor: '#8B5CF6', // Proper blue violet
        boxShadow: `0 0 25px rgba(139, 92, 246, ${opacity * 0.9}), 0 0 50px rgba(139, 92, 246, ${opacity * 0.4})`
      };
    }
  };

  const getConnectionColor = (color) => {
    if (color === 'seafoam') return '#2dd4bf'; // Proper seafoam green
    if (color === 'violet') return '#8B5CF6'; // Proper blue violet
    return 'url(#gradient)'; // Gradient for mixed connections
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        {connections.map(connection => (
          <line
            key={connection.id}
            x1={connection.x1}
            y1={connection.y1}
            x2={connection.x2}
            y2={connection.y2}
            stroke={getConnectionColor(connection.color)}
            strokeWidth="3"
            strokeOpacity={connection.opacity}
            className="animate-pulse"
            style={{ animationDuration: '2s' }}
          />
        ))}
      </svg>
      
      {/* Logo Elements */}
      {logos.map(logo => (
        <div
          key={logo.id}
          className={`absolute transition-all duration-150 ease-out ${logo.size} rounded-full border-3 logo-glow`}
          style={{
            left: `${logo.x}px`,
            top: `${logo.y}px`,
            opacity: logo.opacity,
            transform: 'translate(-50%, -50%)',
            ...getLogoColor(logo.color, logo.opacity)
          }}
        >
          <img 
            src="https://customer-assets.emergentagent.com/job_33bbef14-ff4b-4136-9e36-664559466616/artifacts/4dkvnitj_Eternals%20Studio.png"
            alt="Eternals Studio"
            className="w-full h-full object-contain rounded-full p-2 animate-pulse hover:animate-bounce"
            style={{
              animationDelay: `${logo.delay}s`,
              animationDuration: '4s',
              filter: logo.color === 'seafoam' ? 'sepia(1) hue-rotate(140deg) saturate(2)' : 'sepia(1) hue-rotate(250deg) saturate(2)'
            }}
          />
        </div>
      ))}
    </div>
  );
};

// Navigation Component
const Navigation = () => {
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Services', path: '/services', icon: Settings },
    { name: 'Portfolio', path: '/portfolio', icon: Eye },
    { name: 'Store', path: '/store', icon: ShoppingCart },
    { name: 'About', path: '/about', icon: User },
    { name: 'Contact', path: '/contact', icon: Mail },
  ];

  return (
    <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-teal-100 dark:border-slate-700 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <InteractiveLogo size="w-10 h-10" />
            <h1 className="text-xl font-bold gradient-text">
              Eternals Studio
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors ${
                  location.pathname === item.path ? 'text-teal-600 dark:text-teal-400 font-semibold' : ''
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-9 h-9 p-0"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
              <ShoppingCart className="w-4 h-4" />
            </Button>

            {/* Get Started / Dashboard */}
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button className="bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white">
                  Get Started
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden w-9 h-9 p-0"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-teal-100 dark:border-slate-700">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center space-x-2 ${
                    location.pathname === item.path ? 'text-teal-600 dark:text-teal-400 font-semibold' : ''
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Stats Counter Component
const StatsCounter = ({ end, label, suffix = '+' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev < end) {
          return prev + 1;
        }
        clearInterval(timer);
        return end;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [end]);

  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
        {count}{suffix}
      </div>
      <div className="text-slate-600 dark:text-slate-400 text-sm">
        {label}
      </div>
    </div>
  );
};

// Home Page Component
const HomePage = () => {
  const services = [
    {
      icon: <Code className="w-8 h-8" />,
      title: "Web Development",
      description: "Custom websites, web applications, and e-commerce solutions built with modern technologies.",
      color: "teal"
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Graphic Design",
      description: "Stunning visual identities, branding, logos, and marketing materials that captivate audiences.",
      color: "purple"
    },
    {
      icon: <Box className="w-8 h-8" />,
      title: "3D Modeling",
      description: "Detailed 3D models, product visualizations, and architectural renderings.",
      color: "teal"
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: "Animation",
      description: "Bring your ideas to life with smooth 2D and 3D animations, motion graphics, and visual effects.",
      color: "purple"
    },
    {
      icon: <Music className="w-8 h-8" />,
      title: "Music Production",
      description: "Professional music composition, sound design, and audio production for all your projects.",
      color: "teal"
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: "Video Editing",
      description: "Professional video editing, color grading, and post-production services.",
      color: "purple"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300 relative">
      <FloatingElements />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-tight">
                Welcome to
                <span className="block gradient-text">
                  Eternals Studio
                </span>
              </h1>
              <h2 className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 font-semibold mb-4">
                Transform Your Vision into Reality
              </h2>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl mx-auto">
                Where Ideas Become Reality
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl mx-auto">
                We are dedicated to enhancing the success of individuals and organizations across various fields, including business and esports, through our exceptional graphical expertise. We understand that compelling visuals are essential in capturing attention and communicating ideas effectively. Whether it's creating stunning logos, immersive esports graphics, or engaging promotional materials, our team is committed to delivering high-quality solutions that elevate brands and drive growth.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white px-8 py-3 text-lg">
                Start Your Project
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-8 py-3 text-lg">
                <Play className="w-5 h-5 mr-2" />
                Watch Our Work
              </Button>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-slate-200 dark:border-slate-700">
              <StatsCounter end={4} label="Projects Completed" />
              <StatsCounter end={10} label="Happy Clients" />
              <StatsCounter end={5} label="Years Experience" />
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  24/7
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-sm">
                  Support Available
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-800/50 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Our Services
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              From concept to completion, we offer comprehensive creative services to bring your vision to life.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card 
                key={index} 
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:-translate-y-2 group"
              >
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto mb-4 p-4 bg-gradient-to-r ${
                    service.color === 'teal' 
                      ? 'from-teal-100 to-teal-200 dark:from-teal-900/30 dark:to-teal-800/30' 
                      : 'from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30'
                  } rounded-full w-fit group-hover:scale-110 transition-transform duration-300`}>
                    <div className={service.color === 'teal' ? 'text-teal-600 dark:text-teal-400' : 'text-purple-600 dark:text-purple-400'}>
                      {service.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-400 text-center leading-relaxed">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="bg-gradient-to-r from-teal-500/10 to-purple-500/10 dark:from-teal-500/20 dark:to-purple-500/20 rounded-2xl p-8 border border-teal-200/50 dark:border-teal-700/50">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Ready to start your project?{' '}
              <span className="gradient-text">Let's talk!</span>
            </h3>
            <Button size="lg" className="bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white px-8 py-3 text-lg">
              Get In Touch
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-800/50 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              What Our Clients Say
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Don't just take our word for it - hear from clients who've experienced our exceptional service
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-8">
              <CardContent className="space-y-6">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Quote className="w-6 h-6 text-teal-500" />
                  <Quote className="w-6 h-6 text-teal-500" />
                </div>
                
                <div className="text-center">
                  <div className="flex justify-center items-center space-x-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <h3 className="text-2xl font-bold gradient-text mb-4">10/10 service.</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6 text-left">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-700 dark:text-slate-300">
                        <strong>Efficient Communication:</strong> Capable of getting what you want done to the finest point!
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-700 dark:text-slate-300">
                        <strong>Design Quality</strong> is perfect and what you'd be looking for!
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-700 dark:text-slate-300">
                        <strong>Great at giving feedback</strong> compared to individuals I have worked with before
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-700 dark:text-slate-300">
                        <strong>Reasonable prices</strong> for the amount you get! Bang for your buck!
                      </p>
                    </div>
                  </div>
                </div>

                <blockquote className="text-slate-600 dark:text-slate-400 italic leading-relaxed border-l-4 border-teal-500 pl-6 my-6">
                  "I had such a wonderful time working with Fives when it came to making my graphics, at no point did I feel rushed or hurried into giving design ideas and he even gave some of his own input allowing for a high quality design in the long run! I am super happy with how my logo's came out as well as the price for what I received them at! If your looking for fantastic graphics and having seen the entire teams portfolio I can happily tell you all that these individuals here who create Graphics are arguably the best at what they do here!"
                </blockquote>

                <div className="flex items-center justify-center space-x-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=48,h=48,fit=crop/YNqO7k0WyEUyB3w6/dg_avi-m5Kw9r0g6WUEeL1E.jpg" alt="Tronus" />
                    <AvatarFallback className="bg-gradient-to-r from-teal-500 to-purple-500 text-white font-semibold">
                      TR
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <div className="font-semibold text-slate-900 dark:text-white">Tronus</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Client</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Thank you!</h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We appreciate the trust our clients place in us and strive to exceed expectations every time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};