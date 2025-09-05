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
  const { isDark } = useTheme();
  
  return (
    <div className={`${size} ${className} interactive-logo cursor-pointer`}>
      <img 
        src="https://customer-assets.emergentagent.com/job_33bbef14-ff4b-4136-9e36-664559466616/artifacts/4dkvnitj_Eternals%20Studio.png"
        alt="Eternals Studio"
        className="w-full h-full object-contain hover:scale-110 transition-transform duration-300"
        style={{
          filter: isDark ? 'brightness(10) invert(1)' : 'brightness(0) invert(0)'
        }}
      />
    </div>
  );
};

// Mouse-Following Logo Elements Component with Web Effect (OPTIMIZED)
const FloatingElements = () => {
  const { isDark } = useTheme();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [logos, setLogos] = useState([
    { id: 1, x: 150, y: 250, size: 'w-10 h-10', opacity: 0.7, delay: 0, color: 'seafoam' },
    { id: 2, x: 400, y: 200, size: 'w-11 h-11', opacity: 0.6, delay: 0.5, color: 'violet' },
    { id: 3, x: 650, y: 350, size: 'w-12 h-12', opacity: 0.8, delay: 1, color: 'seafoam' },
    { id: 4, x: 900, y: 180, size: 'w-10 h-10', opacity: 0.5, delay: 1.5, color: 'violet' },
    { id: 5, x: 1100, y: 280, size: 'w-11 h-11', opacity: 0.9, delay: 2, color: 'seafoam' },
    { id: 6, x: 300, y: 450, size: 'w-10 h-10', opacity: 0.7, delay: 2.5, color: 'violet' },
    { id: 7, x: 800, y: 400, size: 'w-12 h-12', opacity: 0.6, delay: 3, color: 'seafoam' },
    { id: 8, x: 550, y: 500, size: 'w-11 h-11', opacity: 0.8, delay: 3.5, color: 'violet' },
    { id: 9, x: 200, y: 120, size: 'w-10 h-10', opacity: 0.5, delay: 4, color: 'seafoam' },
    { id: 10, x: 750, y: 150, size: 'w-11 h-11', opacity: 0.6, delay: 4.5, color: 'violet' },
    { id: 11, x: 1050, y: 450, size: 'w-10 h-10', opacity: 0.7, delay: 5, color: 'seafoam' },
    { id: 12, x: 450, y: 350, size: 'w-12 h-12', opacity: 0.8, delay: 5.5, color: 'violet' },
    { id: 13, x: 350, y: 180, size: 'w-10 h-10', opacity: 0.6, delay: 6, color: 'seafoam' },
    { id: 14, x: 1200, y: 380, size: 'w-11 h-11', opacity: 0.7, delay: 6.5, color: 'violet' }
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
    const baseColor = isDark ? '#ffffff' : '#000000';
    const glowColor = color === 'seafoam' ? '#2dd4bf' : '#8B5CF6';
    
    return {
      filter: `brightness(1.0) contrast(1.0)`, // Reduced brightness/contrast
      borderColor: glowColor,
      boxShadow: `0 0 15px rgba(${isDark ? '255, 255, 255' : '0, 0, 0'}, ${opacity * 0.15}), 0 0 30px ${glowColor}20`, // Reduced opacity and glow
      backgroundColor: `${baseColor}${Math.round(opacity * 180).toString(16).padStart(2, '0')}` // Reduced opacity from 255 to 180
    };
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
              filter: isDark ? 'brightness(10) invert(1)' : 'brightness(0) invert(0)'
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
            <InteractiveLogo size="w-12 h-12" />
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

// Shared Stats Counter Component
const SharedStatsCounter = ({ className = "" }) => {
  const [stats, setStats] = useState({
    projects_completed: 13,
    team_members: 6,
    support_available: "24/7"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/counter-stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching counter stats:', error);
        // Keep default values if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className={`bg-gradient-to-r from-teal-500/10 to-purple-500/10 dark:from-teal-500/20 dark:to-purple-500/20 rounded-2xl p-8 border border-teal-200/50 dark:border-teal-700/50 backdrop-blur-sm ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded mb-2"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded mb-2"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded mb-2"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-teal-500/10 to-purple-500/10 dark:from-teal-500/20 dark:to-purple-500/20 rounded-2xl p-8 border border-teal-200/50 dark:border-teal-700/50 backdrop-blur-sm ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div>
          <StatsCounter end={stats.projects_completed} label="Projects Completed" />
        </div>
        <div>
          <StatsCounter end={stats.team_members} label="Team Members" />
        </div>
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
            {stats.support_available}
          </div>
          <div className="text-slate-600 dark:text-slate-400 text-sm">
            Support Available
          </div>
        </div>
      </div>
    </div>
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
              <Link to="/contact">
                <Button size="lg" className="bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white px-8 py-3 text-lg">
                  Start Your Project
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-8 py-3 text-lg"
                onClick={() => window.open('https://www.youtube.com/@eternals_studio', '_blank')}
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Our Work
              </Button>
            </div>

            {/* Stats Section */}
            <div className="mt-16 pt-16 border-t border-slate-200 dark:border-slate-700">
              <SharedStatsCounter />
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
            <Link to="/contact">
              <Button size="lg" className="bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white px-8 py-3 text-lg">
                Get In Touch
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
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

// Project Detail Page Component
const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get project data passed from Portfolio page or find by ID
  const [project, setProject] = useState(location.state?.project || null);
  
  // All projects data
  const allProjects = [
    // 2025 Projects
    {
      id: 1,
      title: "ULoveWhysper",
      category: "Content Creator Branding",
      description: "A content creator and competitive player who steamed from Apex to Marvel Rivals!",
      image: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/whysper-YbNqBQR7ykClLJ2q.jpg",
      tags: ["Branding", "Gaming", "Content Creator"],
      year: 2025,
      featured: true,
      type: "branding",
      gallery: [
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop/YNqO7k0WyEUyB3w6/whysper_avi-01-preview-mP42OaJv8vi3174j.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop/YNqO7k0WyEUyB3w6/whysper_avi-02-preview-1-mp8qWZ5JbJt8ll2j.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop/YNqO7k0WyEUyB3w6/whysper_avi-03-preview-1-Yanq1XPJg5f36bKx.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/whysper_twitch-header-1-A1aBPEG5ODiVNDOp.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/whysper_twitter-header-1-YBge70aOoBt4K04D.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop/YNqO7k0WyEUyB3w6/whysper_weekly-schedule-1-YBge70aWZqSawbN7.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=915,h=504,fit=crop/YNqO7k0WyEUyB3w6/whysper_offline-screen-1-m2Wa87VGPkSQ6N0a.png"
      ]
    },
    {
      id: 2,
      title: "Midas Networks",
      category: "Gaming Network",
      description: "A Multi-Game Hosting Network based in Garry's Mod, FiveM, Arma, Squad and more!",
      image: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/midas-for-website-Yyv0nV0WMjCMk3pq.jpg",
      tags: ["Gaming", "Network", "Multi-Game"],
      year: 2025,
      featured: true,
      type: "gaming",
      gallery: [
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop/YNqO7k0WyEUyB3w6/midas_banner_p1-mxBXQVKj28TxkKoM.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop/YNqO7k0WyEUyB3w6/midas-group-color-palette-AMq8GogalBi5B4MR.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=224,fit=crop/YNqO7k0WyEUyB3w6/midas-group-text_red-orange-mxBXQVKlwwu68EOy.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=224,fit=crop/YNqO7k0WyEUyB3w6/midas-group-logo-text_red-orange-YleQjVaE3RHvBJLX.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=437,h=328,fit=crop/YNqO7k0WyEUyB3w6/midas-black-YX4x5J9JKPIvpQK4.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=437,h=328,fit=crop/YNqO7k0WyEUyB3w6/midas-white-A1a5kvDQOnCMPJzN.png"
      ]
    },
    // 2024 Projects
    {
      id: 3,
      title: "Eternals Studio",
      category: "Studio Branding",
      description: "A GFX, VFX, Coding, Music Production Studio!",
      image: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop/YNqO7k0WyEUyB3w6/img_1795-YNqykO6O7yIrvvGr.jpg",
      tags: ["Studio", "Branding", "Creative"],
      year: 2024,
      featured: true,
      type: "branding",
      gallery: [
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop/YNqO7k0WyEUyB3w6/img_1795-YNqykO6O7yIrvvGr.jpg"
      ]
    },
    {
      id: 4,
      title: "Eternals GGs",
      category: "Esports Organization",
      description: "A Content Creation and Esports Organization based in a wide variety of competitive games. Also our parent organization. They also provide content across multiple platforms.",
      image: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop/YNqO7k0WyEUyB3w6/e795ed40-7f78-4cc9-b0eb-11931e05891f_rw_1920-mp8vZO4gvOc1Vazm.jpg",
      tags: ["Esports", "Content Creation", "Organization"],
      year: 2024,
      featured: true,
      type: "esports",
      gallery: [
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop/YNqO7k0WyEUyB3w6/e795ed40-7f78-4cc9-b0eb-11931e05891f_rw_1920-mp8vZO4gvOc1Vazm.jpg"
      ]
    },
    {
      id: 5,
      title: "Deceptive Grounds",
      category: "Gaming Community",
      description: "A multi-game based community. They host servers on games such as Garry's Mod and Arma 3.",
      image: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop/YNqO7k0WyEUyB3w6/img_1853-AMqbkp9joNSR2Bl2.jpg",
      tags: ["Gaming", "Community", "Servers"],
      year: 2024,
      featured: false,
      type: "gaming",
      gallery: [
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop/YNqO7k0WyEUyB3w6/img_1853-AMqbkp9joNSR2Bl2.jpg"
      ]
    },
    {
      id: 6,
      title: "Team UK & Ireland",
      category: "Esports Team",
      description: "A new upcoming Organization that represents the spirit of Ireland and United Kingdom together.",
      image: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop/YNqO7k0WyEUyB3w6/uki-YKb6q3vNMoiGV4V8.png",
      tags: ["Esports", "Team", "International"],
      year: 2024,
      featured: false,
      type: "esports",
      gallery: [
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop/YNqO7k0WyEUyB3w6/uki-YKb6q3vNMoiGV4V8.png"
      ]
    },
    {
      id: 7,
      title: "Shinto Gaming Club",
      category: "Gaming Club",
      description: "A new esports gaming club that is partaking in various esports tournaments.",
      image: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop/YNqO7k0WyEUyB3w6/img_1907-AGB6kk44XzULb0rL.jpg",
      tags: ["Gaming", "Club", "Tournaments"],
      year: 2024,
      featured: false,
      type: "gaming",
      gallery: [
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop/YNqO7k0WyEUyB3w6/img_1907-AGB6kk44XzULb0rL.jpg"
      ]
    },
    {
      id: 8,
      title: "HP League",
      category: "Esports League",
      description: "A new Esports league that was partaking in XDefiant and PUBG.",
      image: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop/YNqO7k0WyEUyB3w6/ddssd-YlevxJlDrxTEV0bG.png",
      tags: ["Esports", "League", "XDefiant", "PUBG"],
      year: 2024,
      featured: false,
      type: "esports",
      gallery: [
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop/YNqO7k0WyEUyB3w6/ddssd-YlevxJlDrxTEV0bG.png"
      ]
    },
    {
      id: 9,
      title: "NeverFPS",
      category: "Content Creator",
      description: "A variety streamer turned game developer.",
      image: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop/YNqO7k0WyEUyB3w6/nevers-kick-banner-AGB6RE277PfQ45LM.jpg",
      tags: ["Streaming", "Game Development", "Content"],
      year: 2024,
      featured: false,
      type: "branding",
      gallery: [
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop/YNqO7k0WyEUyB3w6/nevers-kick-banner-AGB6RE277PfQ45LM.jpg"
      ]
    },
    {
      id: 10,
      title: "YouTube Thumbnails",
      category: "Thumbnail Design",
      description: "Thumbnails are used to engage and draw audiences to a particular video.",
      image: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop,trim=0;129.31185944363105;0;16.866764275256223/YNqO7k0WyEUyB3w6/c3f4f288-9f7c-4ec9-89db-e3088a16a602_rw_1920-YrDle0221nILr5K9.jpg",
      tags: ["Design", "YouTube", "Thumbnails"],
      year: 2024,
      featured: false,
      type: "design",
      gallery: [
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop,trim=0;129.31185944363105;0;16.866764275256223/YNqO7k0WyEUyB3w6/c3f4f288-9f7c-4ec9-89db-e3088a16a602_rw_1920-YrDle0221nILr5K9.jpg"
      ]
    },
    {
      id: 11,
      title: "3D Work Collection",
      category: "3D Modeling",
      description: "This is a collection of our completed 3D Work.",
      image: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=440,fit=crop,trim=267.3267326732673;0;324.3564356435644;0/YNqO7k0WyEUyB3w6/gif-AR0yxZWlxjHjRnnn.png",
      tags: ["3D", "Modeling", "Animation"],
      year: 2024,
      featured: false,
      type: "3d",
      gallery: [
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=440,fit=crop,trim=267.3267326732673;0;324.3564356435644;0/YNqO7k0WyEUyB3w6/gif-AR0yxZWlxjHjRnnn.png"
      ]
    },
    {
      id: 12,
      title: "7 Cubed Films",
      category: "Film Production",
      description: "A SFM animation artist that specializes in a Star Wars: The Clone Wars setting and has over 5+ Million Views",
      image: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=600,fit=crop/YNqO7k0WyEUyB3w6/77f1-AoPvMlwkLbFo9JGJ.png",
      tags: ["Animation", "Star Wars", "SFM", "5M+ Views"],
      year: 2024,
      featured: true,
      type: "animation",
      gallery: [
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=600,fit=crop/YNqO7k0WyEUyB3w6/77f1-AoPvMlwkLbFo9JGJ.png"
      ]
    },
    {
      id: 13,
      title: "Esports Posters",
      category: "Poster Design",
      description: "Posters were made as an advertisement tool to help people engage in the esports communities and drive engagement.",
      image: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=776,fit=crop/YNqO7k0WyEUyB3w6/c4a83127-4a3e-4f60-9ba8-8dba90f43791_rw_1200-AQEyOM9p1yF9GWwO.jpg",
      tags: ["Posters", "Esports", "Marketing"],
      year: 2024,
      featured: false,
      type: "design",
      gallery: [
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=776,fit=crop/YNqO7k0WyEUyB3w6/c4a83127-4a3e-4f60-9ba8-8dba90f43791_rw_1200-AQEyOM9p1yF9GWwO.jpg"
      ]
    }
  ];

  useEffect(() => {
    if (!project && projectId) {
      const foundProject = allProjects.find(p => p.id === parseInt(projectId));
      setProject(foundProject);
    }
  }, [projectId, project]);

  if (!project) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300 relative flex items-center justify-center">
        <FloatingElements />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Project Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            The project you're looking for doesn't exist.
          </p>
          <Link to="/portfolio">
            <Button className="bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white">
              Back to Portfolio
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300 relative">
      <FloatingElements />
      <div className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => navigate('/portfolio')}
              className="flex items-center space-x-2"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Back to Portfolio</span>
            </Button>
          </div>

          {/* Project Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Badge variant="secondary">{project.category}</Badge>
              <Badge className="bg-gradient-to-r from-teal-500 to-purple-500 text-white">
                {project.year}
              </Badge>
              {project.featured && (
                <Badge className="bg-yellow-500 text-black">Featured</Badge>
              )}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              <span className="gradient-text">{project.title}</span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Hero Image */}
          <div className="mb-16">
            <div className="relative overflow-hidden rounded-2xl">
              <img 
                src={project.image} 
                alt={project.title}
                className="w-full h-96 md:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>

          {/* Project Gallery */}
          {project.gallery && project.gallery.length > 1 && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
                Project Gallery
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {project.gallery.map((image, index) => (
                  <div key={index} className="relative group overflow-hidden rounded-lg">
                    <img 
                      src={image} 
                      alt={`${project.title} - Image ${index + 1}`}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4">
                        <p className="text-white text-sm font-medium">Image {index + 1}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center">
            <Card className="border-0 shadow-xl bg-gradient-to-r from-teal-500/10 to-purple-500/10 dark:from-teal-500/20 dark:to-purple-500/20 backdrop-blur-sm">
              <CardContent className="p-8">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  Interested in Similar Work?
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
                  Let's discuss how we can help bring your vision to life with our expertise in {project.category.toLowerCase()}.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/contact">
                    <Button size="lg" className="bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white">
                      Start Your Project
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/portfolio">
                    <Button size="lg" variant="outline">
                      View More Projects
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Services Page Component
const ServicesPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300 relative">
      <FloatingElements />
      <div className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Our <span className="gradient-text">Services</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-3xl mx-auto">
            Comprehensive creative solutions designed to bring your vision to life
          </p>
        </div>
      </div>
    </div>
  );
};

// Portfolio Page Component
const PortfolioPage = () => {
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const handleViewProject = (project) => {
    navigate(`/project/${project.id}`, { state: { project } });
  };
  
  const projects = [
    // 2025 Projects
    {
      id: 1,
      title: "ULoveWhysper",
      category: "Content Creator Branding",
      description: "A content creator and competitive player who steamed from Apex to Marvel Rivals!",
      image: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/whysper-YbNqBQR7ykClLJ2q.jpg",
      tags: ["Branding", "Gaming", "Content Creator"],
      year: 2025,
      featured: true,
      type: "branding"
    },
    {
      id: 2,
      title: "Midas Networks",
      category: "Gaming Network",
      description: "A Multi-Game Hosting Network based in Garry's Mod, FiveM, Arma, Squad and more!",
      image: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/midas-for-website-Yyv0nV0WMjCMk3pq.jpg",
      tags: ["Gaming", "Network", "Multi-Game"],
      year: 2025,
      featured: true,
      type: "gaming"
    },
    // 2024 Projects
    {
      id: 3,
      title: "Eternals Studio",
      category: "Studio Branding",
      description: "A GFX, VFX, Coding, Music Production Studio!",
      image: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop/YNqO7k0WyEUyB3w6/img_1795-YNqykO6O7yIrvvGr.jpg",
      tags: ["Studio", "Branding", "Creative"],
      year: 2024,
      featured: true,
      type: "branding"
    },
    {
      id: 4,
      title: "Eternals GGs",
      category: "Esports Organization",
      description: "A Content Creation and Esports Organization based in a wide variety of competitive games. Also our parent organization. They also provide content across multiple platforms.",
      image: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop/YNqO7k0WyEUyB3w6/e795ed40-7f78-4cc9-b0eb-11931e05891f_rw_1920-mp8vZO4gvOc1Vazm.jpg",
      tags: ["Esports", "Content Creation", "Organization"],
      year: 2024,
      featured: true,
      type: "esports"
    },
    {
      id: 5,
      title: "Deceptive Grounds",
      category: "Gaming Community",
      description: "A multi-game based community. They host servers on games such as Garry's Mod and Arma 3.",
      image: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop/YNqO7k0WyEUyB3w6/img_1853-AMqbkp9joNSR2Bl2.jpg",
      tags: ["Gaming", "Community", "Servers"],
      year: 2024,
      featured: false,
      type: "gaming"
    },
    {
      id: 6,
      title: "Team UK & Ireland",
      category: "Esports Team",
      description: "A new upcoming Organization that represents the spirit of Ireland and United Kingdom together.",
      image: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop/YNqO7k0WyEUyB3w6/uki-YKb6q3vNMoiGV4V8.png",
      tags: ["Esports", "Team", "International"],
      year: 2024,
      featured: false,
      type: "esports"
    },
    {
      id: 7,
      title: "Shinto Gaming Club",
      category: "Gaming Club",
      description: "A new esports gaming club that is partaking in various esports tournaments.",
      image: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop/YNqO7k0WyEUyB3w6/img_1907-AGB6kk44XzULb0rL.jpg",
      tags: ["Gaming", "Club", "Tournaments"],
      year: 2024,
      featured: false,
      type: "gaming"
    },
    {
      id: 8,
      title: "HP League",
      category: "Esports League",
      description: "A new Esports league that was partaking in XDefiant and PUBG.",
      image: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop/YNqO7k0WyEUyB3w6/ddssd-YlevxJlDrxTEV0bG.png",
      tags: ["Esports", "League", "XDefiant", "PUBG"],
      year: 2024,
      featured: false,
      type: "esports"
    },
    {
      id: 9,
      title: "NeverFPS",
      category: "Content Creator",
      description: "A variety streamer turned game developer.",
      image: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop/YNqO7k0WyEUyB3w6/nevers-kick-banner-AGB6RE277PfQ45LM.jpg",
      tags: ["Streaming", "Game Development", "Content"],
      year: 2024,
      featured: false,
      type: "branding"
    },
    {
      id: 10,
      title: "YouTube Thumbnails",
      category: "Thumbnail Design",
      description: "Thumbnails are used to engage and draw audiences to a particular video.",
      image: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop,trim=0;129.31185944363105;0;16.866764275256223/YNqO7k0WyEUyB3w6/c3f4f288-9f7c-4ec9-89db-e3088a16a602_rw_1920-YrDle0221nILr5K9.jpg",
      tags: ["Design", "YouTube", "Thumbnails"],
      year: 2024,
      featured: false,
      type: "design"
    },
    {
      id: 11,
      title: "3D Work Collection",
      category: "3D Modeling",
      description: "This is a collection of our completed 3D Work.",
      image: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=440,fit=crop,trim=267.3267326732673;0;324.3564356435644;0/YNqO7k0WyEUyB3w6/gif-AR0yxZWlxjHjRnnn.png",
      tags: ["3D", "Modeling", "Animation"],
      year: 2024,
      featured: false,
      type: "3d"
    },
    {
      id: 12,
      title: "7 Cubed Films",
      category: "Film Production",
      description: "A SFM animation artist that specializes in a Star Wars: The Clone Wars setting and has over 5+ Million Views",
      image: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=600,fit=crop/YNqO7k0WyEUyB3w6/77f1-AoPvMlwkLbFo9JGJ.png",
      tags: ["Animation", "Star Wars", "SFM", "5M+ Views"],
      year: 2024,
      featured: true,
      type: "animation"
    },
    {
      id: 13,
      title: "Esports Posters",
      category: "Poster Design",
      description: "Posters were made as an advertisement tool to help people engage in the esports communities and drive engagement.",
      image: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=776,fit=crop/YNqO7k0WyEUyB3w6/c4a83127-4a3e-4f60-9ba8-8dba90f43791_rw_1200-AQEyOM9p1yF9GWwO.jpg",
      tags: ["Posters", "Esports", "Marketing"],
      year: 2024,
      featured: false,
      type: "design"
    }
  ];

  const filteredProjects = filter === 'all' ? projects : projects.filter(project => project.type === filter);
  const featuredProjects = projects.filter(project => project.featured);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300 relative">
      <FloatingElements />
      <div className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Our <span className="gradient-text">Portfolio</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
              Discover our latest projects and see how we've helped businesses transform their digital presence across gaming, esports, and creative industries.
            </p>
            
            {/* Filter */}
            <div className="flex justify-center items-center space-x-4 mb-12">
              <Filter className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <span className="text-slate-600 dark:text-slate-400">Filter by category:</span>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={filter === 'all' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setFilter('all')}
                  className={filter === 'all' ? 'bg-gradient-to-r from-teal-500 to-purple-500 text-white' : ''}
                >
                  All Projects
                </Button>
                <Button 
                  variant={filter === 'branding' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setFilter('branding')}
                  className={filter === 'branding' ? 'bg-gradient-to-r from-teal-500 to-purple-500 text-white' : ''}
                >
                  Branding
                </Button>
                <Button 
                  variant={filter === 'gaming' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setFilter('gaming')}
                  className={filter === 'gaming' ? 'bg-gradient-to-r from-teal-500 to-purple-500 text-white' : ''}
                >
                  Gaming
                </Button>
                <Button 
                  variant={filter === 'esports' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setFilter('esports')}
                  className={filter === 'esports' ? 'bg-gradient-to-r from-teal-500 to-purple-500 text-white' : ''}
                >
                  Esports
                </Button>
                <Button 
                  variant={filter === '3d' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setFilter('3d')}
                  className={filter === '3d' ? 'bg-gradient-to-r from-teal-500 to-purple-500 text-white' : ''}
                >
                  3D Work
                </Button>
                <Button 
                  variant={filter === 'animation' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setFilter('animation')}
                  className={filter === 'animation' ? 'bg-gradient-to-r from-teal-500 to-purple-500 text-white' : ''}
                >
                  Animation
                </Button>
                <Button 
                  variant={filter === 'design' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setFilter('design')}
                  className={filter === 'design' ? 'bg-gradient-to-r from-teal-500 to-purple-500 text-white' : ''}
                >
                  Design
                </Button>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden hover:-translate-y-2">
                <div className="relative">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {project.featured && (
                    <Badge className="absolute top-4 left-4 bg-gradient-to-r from-teal-500 to-purple-500 text-white">
                      Featured
                    </Badge>
                  )}
                  <Badge className="absolute top-4 right-4 bg-black/50 text-white">
                    {project.year}
                  </Badge>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="bg-white/90 text-black hover:bg-white flex-1"
                          onClick={() => handleViewProject(project)}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Project
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {project.category}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {project.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed line-clamp-3">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats Section */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Our <span className="gradient-text">Achievements</span>
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Numbers that reflect our commitment to excellence
              </p>
            </div>
            <SharedStatsCounter />
          </div>
        </div>
      </div>
    </div>
  );
};

// Store Page Component
const StorePage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300 relative">
      <FloatingElements />
      <div className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Our <span className="gradient-text">Store</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-12">
            Premium design resources and exclusive templates
          </p>
        </div>
      </div>
    </div>
  );
};

// About Page Component
const AboutPage = () => {
  const teamMembers = [
    {
      name: "Fives",
      role: "Owner",
      avatar: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=297,h=264,fit=crop/YNqO7k0WyEUyB3w6/avi-A0xwJrW1WjtajWrk.jpg",
      description: "Founder and owner of Eternals Studio, driving the vision and creative direction."
    },
    {
      name: "Psyphonic",
      role: "COO",
      avatar: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=297,h=264,fit=crop/YNqO7k0WyEUyB3w6/8-jisol9_400x400-AGB6kvvqPJCxpqEe.jpg",
      description: "Chief Operations Officer overseeing all studio operations and strategic planning."
    },
    {
      name: "Kiran",
      role: "Designer",
      avatar: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=297,h=264,fit=crop/YNqO7k0WyEUyB3w6/gipivnpn_400x400-mxBZn8j445hBNVxv.jpg",
      description: "Creative designer focused on innovative visual solutions and brand experiences."
    },
    {
      name: "In Gloom Media",
      role: "Designer",
      avatar: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=297,h=264,fit=crop/YNqO7k0WyEUyB3w6/cw2cevgn_400x400-YZ9VkX2rnbt4wERz.jpg",
      description: "Lead graphic designer specializing in branding and visual identity creation."
    },
    {
      name: "Griff",
      role: "Texture Designer",
      avatar: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=297,h=264,fit=crop/YNqO7k0WyEUyB3w6/griff-YX4ykEq1Nzcy4RgW.jpg",
      description: "Expert in 3D texturing and digital asset creation for gaming and multimedia projects."
    },
    {
      name: "Corbyn",
      role: "Website Coder",
      avatar: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=297,h=264,fit=crop/YNqO7k0WyEUyB3w6/social-avatar-ca-AMqbkJ1bl7C87xWE.jpg",
      description: "Full-stack developer responsible for web development and technical implementations."
    }
  ];

  const services = [
    "Graphic Designing",
    "Model Texturing", 
    "Model Creating",
    "Videography",
    "Photography",
    "Web Development",
    "Brand Identity",
    "3D Animation"
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300 relative">
      <FloatingElements />
      <div className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              About <span className="gradient-text">Eternals Studio</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-3xl mx-auto">
              Dedicated to delivering excellence and top-notch quality in every project we undertake
            </p>
          </div>

          {/* Hero Image */}
          <div className="mb-16">
            <div className="relative overflow-hidden rounded-2xl">
              <img 
                src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1920,fit=crop/YNqO7k0WyEUyB3w6/img_1795-YNqykO6O7yIrvvGr.jpg"
                alt="Eternals Studio"
                className="w-full h-96 md:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Creating Visual Excellence</h2>
                <p className="text-lg opacity-90">Where creativity meets professional craftsmanship</p>
              </div>
            </div>
          </div>

          {/* Mission Statement */}
          <div className="mb-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                  Our <span className="gradient-text">Mission</span>
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  At Eternals Studio, we believe that graphics serve as the forefront for organizations and businesses, playing a crucial role in shaping their identity and presence in the market. Intricate and well-crafted designs are essential for effectively pushing products and attracting consumer interest.
                </p>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  Our team understands that compelling graphics are not just decorative; they create an imprint of a brand that resonates with the target audience. By prioritizing quality and creativity in our designs, we strive to help our clients stand out and make a lasting impact in their respective industries.
                </p>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  We recognize that exceptional graphics are the key to success in today's competitive landscape.
                </p>
              </div>
              <div className="relative">
                <img 
                  src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=761,h=424,fit=crop/YNqO7k0WyEUyB3w6/106ca2c5-2a87-4917-a688-63ba1833fcf6_rw_3840-YKb6ZE6xbVH1ZKpx.png"
                  alt="Our Mission"
                  className="w-full h-80 object-cover rounded-2xl shadow-xl"
                />
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Our <span className="gradient-text">Expertise</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Discover our expertise across multiple creative disciplines
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {services.map((service, index) => (
                <Card key={index} className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:-translate-y-2 transition-all duration-300 group">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {service}
                    </h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Meet Our <span className="gradient-text">Team</span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                Our talented creators with impressive portfolios are ready to bring your vision to life
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:-translate-y-2 group">
                  <CardContent className="p-6 text-center">
                    <div className="relative mb-6">
                      <div className="w-24 h-24 mx-auto rounded-full overflow-hidden ring-4 ring-teal-500/20 group-hover:ring-teal-500/40 transition-all duration-300">
                        <img 
                          src={member.avatar} 
                          alt={member.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-teal-500 to-purple-500 text-white text-xs">
                          {member.role}
                        </Badge>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      {member.name}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                      {member.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="mb-20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Our <span className="gradient-text">Impact</span>
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                The numbers behind our success story
              </p>
            </div>
            <SharedStatsCounter />
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <Card className="border-0 shadow-xl bg-gradient-to-r from-teal-500/10 to-purple-500/10 dark:from-teal-500/20 dark:to-purple-500/20 backdrop-blur-sm">
              <CardContent className="p-8">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  Ready to Work with Us?
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
                  Contact us today to discuss your project and discover how our talented team can bring your vision to life.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/contact">
                    <Button size="lg" className="bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white">
                      Get In Touch
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/portfolio">
                    <Button size="lg" variant="outline">
                      View Our Work
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Contact Page Component
const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300 relative">
      <FloatingElements />
      <div className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Get In <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Ready to bring your vision to life? Let's discuss your project and create something amazing together.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl gradient-text">Send us a message</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Fill out the form below and we'll get back to you within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-teal-500 dark:focus:border-teal-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-teal-500 dark:focus:border-teal-400"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-teal-500 dark:focus:border-teal-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-teal-500 dark:focus:border-teal-400 resize-none"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white"
                  >
                    Send Message
                    <Send className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-teal-100 to-teal-200 dark:from-teal-900/30 dark:to-teal-800/30 rounded-full">
                      <Mail className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">Email Us</h3>
                      <p className="text-slate-600 dark:text-slate-400">hello@eternalsstudio.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Why Choose <span className="gradient-text">Eternals Studio?</span>
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Our track record speaks for itself
              </p>
            </div>
            <SharedStatsCounter />
          </div>
        </div>
      </div>
    </div>
  );
};

// Auth Page Component
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    company: ''
  });
  const { login, register } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
      } else {
        await register(formData);
        toast({
          title: "Success",
          description: "Account created successfully! Please log in.",
        });
        setIsLogin(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || 'An error occurred',
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300 relative">
      <FloatingElements />
      <div className="relative z-10 py-20 px-4">
        <div className="max-w-md mx-auto">
          <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl gradient-text">
                {isLogin ? 'Sign In' : 'Sign Up'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={isLogin ? 'login' : 'register'} onValueChange={(value) => setIsLogin(value === 'login')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-teal-500 dark:focus:border-teal-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-teal-500 dark:focus:border-teal-400"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white">
                      Sign In
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-teal-500 dark:focus:border-teal-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-teal-500 dark:focus:border-teal-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-teal-500 dark:focus:border-teal-400"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white">
                      Sign Up
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Dashboard Component (placeholder)
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    projects_completed: 13,
    happy_clients: 15,
    team_members: 6,
    support_available: "24/7"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Fetch current stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/counter-stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Update stats
  const handleUpdateStats = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/counter-stats`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(stats)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Counter statistics updated successfully!",
        });
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update stats');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || 'Failed to update statistics',
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStatsChange = (field, value) => {
    setStats(prev => ({
      ...prev,
      [field]: field === 'support_available' ? value : parseInt(value) || 0
    }));
  };

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300 relative">
      <FloatingElements />
      <div className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Welcome, <span className="gradient-text">{user?.full_name || 'User'}</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
              {isAdmin ? 'Admin Dashboard - Manage your studio' : 'Client Dashboard - Track your projects'}
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                variant={activeTab === 'overview' ? 'default' : 'outline'}
                onClick={() => setActiveTab('overview')}
                className={activeTab === 'overview' ? 'bg-gradient-to-r from-teal-500 to-purple-500 text-white' : ''}
              >
                Overview
              </Button>
              {isAdmin && (
                <Button
                  variant={activeTab === 'cms' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('cms')}
                  className={activeTab === 'cms' ? 'bg-gradient-to-r from-teal-500 to-purple-500 text-white' : ''}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  CMS
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto">
            {activeTab === 'overview' && (
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="gradient-text">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Your dashboard is being developed with amazing features coming soon!
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Account setup completed</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <Clock className="w-5 h-5 text-yellow-500" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Project management tools coming soon</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-blue-500" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Messaging system in development</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="gradient-text">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Link to="/contact">
                      <Button className="w-full bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white justify-start">
                        <Mail className="w-4 h-4 mr-2" />
                        Contact Support
                      </Button>
                    </Link>
                    <Link to="/portfolio">
                      <Button variant="outline" className="w-full justify-start">
                        <Eye className="w-4 h-4 mr-2" />
                        View Portfolio
                      </Button>
                    </Link>
                    <Button onClick={logout} variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'cms' && isAdmin && (
              <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="gradient-text">Content Management System</CardTitle>
                  <CardDescription>
                    Update website counter statistics and content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                      Website Counter Statistics
                    </h3>
                    
                    {loading ? (
                      <div className="space-y-4">
                        <div className="animate-pulse">
                          <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded mb-2"></div>
                          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                        <div className="animate-pulse">
                          <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded mb-2"></div>
                          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="projects">Projects Completed</Label>
                          <Input
                            id="projects"
                            type="number"
                            value={stats.projects_completed}
                            onChange={(e) => handleStatsChange('projects_completed', e.target.value)}
                            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="clients">Happy Clients</Label>
                          <Input
                            id="clients"
                            type="number"
                            value={stats.happy_clients}
                            onChange={(e) => handleStatsChange('happy_clients', e.target.value)}
                            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="team">Team Members</Label>
                          <Input
                            id="team"
                            type="number"
                            value={stats.team_members}
                            onChange={(e) => handleStatsChange('team_members', e.target.value)}
                            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="support">Support Available</Label>
                          <Input
                            id="support"
                            value={stats.support_available}
                            onChange={(e) => handleStatsChange('support_available', e.target.value)}
                            placeholder="e.g., 24/7, Mon-Fri"
                            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-end mt-6">
                      <Button
                        onClick={handleUpdateStats}
                        disabled={saving || loading}
                        className="bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Update Statistics
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Preview Section */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                      Live Preview
                    </h3>
                    <SharedStatsCounter />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
            <Navigation />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/project/:projectId" element={<ProjectDetailPage />} />
              <Route path="/store" element={<StorePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;