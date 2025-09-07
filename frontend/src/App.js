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

// Components
import TestimonialSection from './components/TestimonialSection';

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

// Mouse-Following Logo Elements Component with Enhanced Interactivity
const FloatingElements = () => {
  const { isDark } = useTheme();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [draggedLogo, setDraggedLogo] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const [logos, setLogos] = useState([
    { id: 1, x: 150, y: 250, size: 'w-10 h-10', opacity: 0.7, delay: 0, color: 'seafoam', vx: 0.2, vy: 0.3 },
    { id: 2, x: 400, y: 200, size: 'w-11 h-11', opacity: 0.6, delay: 0.5, color: 'violet', vx: -0.1, vy: 0.4 },
    { id: 3, x: 650, y: 350, size: 'w-12 h-12', opacity: 0.8, delay: 1, color: 'seafoam', vx: 0.3, vy: -0.2 },
    { id: 4, x: 900, y: 180, size: 'w-10 h-10', opacity: 0.5, delay: 1.5, color: 'violet', vx: -0.2, vy: 0.1 },
    { id: 5, x: 1100, y: 280, size: 'w-11 h-11', opacity: 0.9, delay: 2, color: 'seafoam', vx: 0.1, vy: 0.5 },
    { id: 6, x: 300, y: 450, size: 'w-10 h-10', opacity: 0.7, delay: 2.5, color: 'violet', vx: 0.4, vy: -0.1 },
    { id: 7, x: 800, y: 400, size: 'w-12 h-12', opacity: 0.6, delay: 3, color: 'seafoam', vx: -0.3, vy: 0.2 },
    { id: 8, x: 550, y: 500, size: 'w-11 h-11', opacity: 0.8, delay: 3.5, color: 'violet', vx: 0.2, vy: -0.4 },
    { id: 9, x: 200, y: 120, size: 'w-10 h-10', opacity: 0.5, delay: 4, color: 'seafoam', vx: -0.1, vy: 0.3 },
    { id: 10, x: 750, y: 150, size: 'w-11 h-11', opacity: 0.6, delay: 4.5, color: 'violet', vx: 0.5, vy: 0.1 },
    { id: 11, x: 1050, y: 450, size: 'w-10 h-10', opacity: 0.7, delay: 5, color: 'seafoam', vx: -0.2, vy: -0.3 },
    { id: 12, x: 450, y: 350, size: 'w-12 h-12', opacity: 0.8, delay: 5.5, color: 'violet', vx: 0.1, vy: 0.4 },
    { id: 13, x: 350, y: 180, size: 'w-10 h-10', opacity: 0.6, delay: 6, color: 'seafoam', vx: 0.3, vy: -0.1 },
    { id: 14, x: 1200, y: 380, size: 'w-11 h-11', opacity: 0.7, delay: 6.5, color: 'violet', vx: -0.4, vy: 0.2 }
  ]);

  const [connections, setConnections] = useState([]);

  // Mouse event handlers
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Handle dragging
      if (isMouseDown && draggedLogo) {
        setLogos(prevLogos => 
          prevLogos.map(logo => 
            logo.id === draggedLogo 
              ? { 
                  ...logo, 
                  x: e.clientX - dragOffset.x, 
                  y: e.clientY - dragOffset.y,
                  vx: 0, // Stop natural movement while dragging
                  vy: 0
                }
              : logo
          )
        );
      }
    };

    const handleMouseDown = (e) => {
      setIsMouseDown(true);
      
      // Check if mouse is near any logo
      const clickX = e.clientX;
      const clickY = e.clientY;
      
      for (const logo of logos) {
        const distance = Math.sqrt(Math.pow(clickX - logo.x, 2) + Math.pow(clickY - logo.y, 2));
        if (distance < 30) { // Within 30px of logo center
          setDraggedLogo(logo.id);
          setDragOffset({
            x: clickX - logo.x,
            y: clickY - logo.y
          });
          break;
        }
      }
    };

    const handleMouseUp = () => {
      if (draggedLogo) {
        // Resume natural movement for the dragged logo
        setLogos(prevLogos => 
          prevLogos.map(logo => 
            logo.id === draggedLogo 
              ? { 
                  ...logo, 
                  vx: (Math.random() - 0.5) * 0.6, // Random velocity
                  vy: (Math.random() - 0.5) * 0.6
                }
              : logo
          )
        );
      }
      setIsMouseDown(false);
      setDraggedLogo(null);
      setDragOffset({ x: 0, y: 0 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isMouseDown, draggedLogo, dragOffset, logos]);

  // Smooth animation loop
  useEffect(() => {
    const updateLogosAndConnections = () => {
      setLogos(prevLogos => {
        const updatedLogos = prevLogos.map(logo => {
          // Skip animation for dragged logo
          if (draggedLogo === logo.id) return logo;

          let newX = logo.x;
          let newY = logo.y;
          let newVx = logo.vx;
          let newVy = logo.vy;
          let newOpacity = logo.opacity;

          // Mouse interaction (repel effect)
          const mouseDistance = Math.sqrt(
            Math.pow(mousePosition.x - logo.x, 2) + Math.pow(mousePosition.y - logo.y, 2)
          );
          
          if (mouseDistance < 120) {
            const angle = Math.atan2(mousePosition.y - logo.y, mousePosition.x - logo.x);
            const repelForce = Math.max(0, 120 - mouseDistance) * 0.3;
            
            newVx += -Math.cos(angle) * repelForce * 0.01;
            newVy += -Math.sin(angle) * repelForce * 0.01;
            newOpacity = Math.min(1, logo.opacity + 0.3);
          } else {
            newOpacity = Math.max(0.4, logo.opacity - 0.002);
          }

          // Constant smooth movement
          newX += newVx;
          newY += newVy;

          // Boundary bouncing with smooth transitions
          if (newX <= 50 || newX >= window.innerWidth - 50) {
            newVx = -newVx * 0.8; // Damping for realistic bounce
            newX = Math.max(50, Math.min(window.innerWidth - 50, newX));
          }
          if (newY <= 50 || newY >= window.innerHeight - 50) {
            newVy = -newVy * 0.8;
            newY = Math.max(50, Math.min(window.innerHeight - 50, newY));
          }

          // Velocity damping for natural movement
          newVx *= 0.999;
          newVy *= 0.999;

          // Add random tiny movements for organic feel
          newVx += (Math.random() - 0.5) * 0.001;
          newVy += (Math.random() - 0.5) * 0.001;

          return {
            ...logo,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            opacity: newOpacity
          };
        });

        // Calculate connections between nearby logos
        const newConnections = [];
        for (let i = 0; i < updatedLogos.length; i++) {
          for (let j = i + 1; j < updatedLogos.length; j++) {
            const logo1 = updatedLogos[i];
            const logo2 = updatedLogos[j];
            const distance = Math.sqrt(
              Math.pow(logo1.x - logo2.x, 2) + Math.pow(logo1.y - logo2.y, 2)
            );
            
            if (distance < 180) {
              const opacity = Math.max(0, (180 - distance) / 180) * 0.5; // Reduced connection opacity
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

    const interval = setInterval(updateLogosAndConnections, 50); // Smooth 20fps animation
    return () => clearInterval(interval);
  }, [mousePosition, draggedLogo]);

  const getLogoColor = (color, opacity) => {
    const baseColor = isDark ? '#ffffff' : '#000000';
    const glowColor = color === 'seafoam' ? '#2dd4bf' : '#8B5CF6';
    
    return {
      filter: `brightness(1.0) contrast(1.0)`,
      borderColor: glowColor,
      boxShadow: `0 0 15px rgba(${isDark ? '255, 255, 255' : '0, 0, 0'}, ${opacity * 0.15}), 0 0 30px ${glowColor}20`,
      backgroundColor: `${baseColor}${Math.round(opacity * 180).toString(16).padStart(2, '0')}`
    };
  };

  const getConnectionColor = (color) => {
    if (color === 'seafoam') return '#2dd4bf';
    if (color === 'violet') return '#8B5CF6';
    return 'url(#gradient)';
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
            strokeWidth="2"
            strokeOpacity={connection.opacity}
            className="animate-pulse"
            style={{ animationDuration: '3s' }}
          />
        ))}
      </svg>
      
      {/* Logo Elements */}
      {logos.map(logo => (
        <div
          key={logo.id}
          className={`absolute transition-all duration-75 ease-out ${logo.size} rounded-full border-2 logo-glow pointer-events-auto cursor-pointer hover:scale-110`}
          style={{
            left: `${logo.x}px`,
            top: `${logo.y}px`,
            opacity: logo.opacity,
            transform: 'translate(-50%, -50%)',
            ...getLogoColor(logo.color, logo.opacity),
            zIndex: draggedLogo === logo.id ? 50 : 10
          }}
        >
          <img 
            src="https://customer-assets.emergentagent.com/job_33bbef14-ff4b-4136-9e36-664559466616/artifacts/4dkvnitj_Eternals%20Studio.png"
            alt="Eternals Studio"
            className="w-full h-full object-contain rounded-full p-2 animate-pulse hover:animate-bounce select-none"
            style={{
              animationDelay: `${logo.delay}s`,
              animationDuration: '4s',
              filter: isDark ? 'brightness(10) invert(1)' : 'brightness(0) invert(0)'
            }}
            draggable={false}
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
    testimonials_count: 1,
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
    
    // Refresh stats every 30 seconds for live updates
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={`bg-gradient-to-r from-teal-500/10 to-purple-500/10 dark:from-teal-500/20 dark:to-purple-500/20 rounded-2xl p-8 border border-teal-200/50 dark:border-teal-700/50 backdrop-blur-sm ${className}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div>
          <StatsCounter end={stats.projects_completed} label="Projects Completed" />
        </div>
        <div>
          <StatsCounter end={stats.testimonials_count} label="Testimonials" />
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
              Testimonials
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Don't just take our word for it - hear from clients who've experienced our exceptional service
            </p>
          </div>

          <TestimonialSection />

          <div className="text-center mt-12">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Thank you!</h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We appreciate the trust our clients place in us and strive to exceed expectations every time.
            </p>
          </div>

          {/* Call to Action Section */}
          <div className="text-center">
            <Card className="border-0 shadow-xl bg-gradient-to-r from-teal-500/10 to-purple-500/10 dark:from-teal-500/20 dark:to-purple-500/20 backdrop-blur-sm">
              <CardContent className="p-8">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  Ready to start your project?
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
                  Inspired by our work? Let's create something amazing together. Contact us to discuss your project and bring your vision to life.
                </p>
                <Link to="/contact">
                  <Button size="lg" className="bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white">
                    Start Your Project
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
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
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=915,h=504,fit=crop/YNqO7k0WyEUyB3w6/whysper_offline-screen-1-m2Wa87VGPkSQ6N0a.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=915,h=184,fit=crop/YNqO7k0WyEUyB3w6/yt-mp8qJ97qnwFrzoz0.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=915,h=184,fit=crop/YNqO7k0WyEUyB3w6/tiktok-AR0M3bVL3qSNx09Z.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=915,h=184,fit=crop/YNqO7k0WyEUyB3w6/sub-YNqP2rN2MyUkDlpn.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=915,h=184,fit=crop/YNqO7k0WyEUyB3w6/specs-YbNqJ9yLXjHbor98.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=915,h=184,fit=crop/YNqO7k0WyEUyB3w6/me-AVL1abNj63Tl1JK0.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=915,h=184,fit=crop/YNqO7k0WyEUyB3w6/instagram-A0x1jVrZqnCyNJbp.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=915,h=184,fit=crop/YNqO7k0WyEUyB3w6/donate-dJo5b4NzKGfk8O79.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=915,h=184,fit=crop/YNqO7k0WyEUyB3w6/chat-rules-AR0M3bVvoWT7xnWB.png"
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
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=437,h=328,fit=crop/YNqO7k0WyEUyB3w6/midas-white-A1a5kvDQOnCMPJzN.png",

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
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=384,fit=crop/YNqO7k0WyEUyB3w6/x8_vb24x_400x400-Yany8zezOEf96GR1.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/img_1795-YNqykO6O7yIrvvGr.jpg"
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
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/dab21dff-54d2-443f-8116-92041be0886b_rw_1200-Yyv3b2NyzNsR7pVv.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=612,h=480,fit=crop/YNqO7k0WyEUyB3w6/4fe16eef-716b-442a-8353-491f61740cab_rw_3840-AGB681DL4EF6nlzL.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=915,h=480,fit=crop/YNqO7k0WyEUyB3w6/e795ed40-7f78-4cc9-b0eb-11931e05891f_rw_1920-min-Yyv3jaO7kDU3Z2W3.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/63b6a0f1-87db-4bcf-b0f0-370da63c6d1a_rw_1920-d95KJOjBLViZjvaL.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/061ec31e-4c4b-4876-891d-5cae1f814723_rw_1920-YD06V7LvWzsnbK89.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/2f6c33e9-d982-445b-8c7d-a7faf985f328_rw_1920-dJo6MpDypjHb2GvJ.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/9aee2acb-f837-4ad2-8f31-1dd541008543_rw_1920-Aq2v38P5VzunLWxv.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/c2e76595-68f3-49c6-8fb2-eb5abe34a0ad_rw_1920-mnlvD0ok51fPbegz.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/theeternals_avi-01-mxBZLGDLpxIeXLBe.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/95549387-8cd0-436c-a1b9-4d5332b3da00_rw_1200-1-AGB681DDbXfRRL6v.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=530,fit=crop/YNqO7k0WyEUyB3w6/img_1913-mP4naD0LJgIXMKOR.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/1165cc2d-d74c-4b69-afd3-16656a7a8fcb_rw_1200-mv0DOanwNqhyrKE2.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/66a27793-4bd5-4b8a-86e6-ff8d69833e09_rw_1200-AE0ol98P61cRkMgq.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/e31a5f33-7d0b-4175-851d-d7dda55d3b8f_rw_1200-m6LwnzErpaSj4WvM.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/e51cc32a-70a2-417a-9380-3ce73cb06c0f_rw_1920-Aq2v38KgZnSW6pLQ.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/1ca71a08-a0fc-4847-bdcf-af19497c20f0_rw_1920-YNqy1ngbQ9sWNbwR.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/32c73ad8-7ac9-4f2c-a644-1f8bf0dc7138_rw_3840-YrDlekGJr5H0bJlb.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/07d4cbc8-3b7d-4227-b1a3-e10aa0e19476_rw_1920-AzGe5vgozLUWjKNN.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/df1df1cd-d6bf-420b-b36a-65cb9c284bd6_rw_1920-YD06V7QJDpULOxb3.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/662e8ca9-5948-4b9d-acf5-d68c7ed54979_rw_3840-Yg2WnB6ekwcQO9x0.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/8610c66d-2a81-4ad4-b89c-2f3f162ddc14_rw_3840-YrDlekG1MDTnr1a2.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/9c703744-acd0-4088-922c-1cd7ad5335ca_rw_3840-mnlvD0gMQPtezrnB.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/b97218d4-dd98-44c6-8a35-6c1fd5f839ce_rw_3840-mjEvlOKPNBF11q2V.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/7bbd9ba2-6589-4858-bc57-630460a8653d_rw_3840-YZ9VqLgELZTPwl29.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/4cc9be77-a8fa-4974-8bf9-640fe77abafc_rw_1920-AVLpE4vV4ZSpj3Q0.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/61a2523b-624e-4729-82b0-0973d559069e_rw_1200-m2Wp7yJLa5U1Pvxl.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/a79a34b5-58fe-4d80-9817-6001f118883e_rw_1920-dWxy7qoRkxcbM8VL.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/d7345a56-853b-465d-93c4-0f8979f30ef1_rw_1920-YKb6Z7nQN3I93R8o.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/4361e8bf-cfa6-467e-aaa9-c3ca57c43cef_rw_1920-YX4yvOogxnfzlZKM.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/9e166081-3462-48cb-af67-dc9635ce9b2a_rw_1920-mP4naGbWzjsvGv8g.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/30b35aff-b834-4362-ad0b-3cb3dd9cb2df_rw_1920-mnlvD0o7WPhWKZ6d.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/6f69fff4-d08f-4254-b5b6-59b513dafe08_rw_1920-m6LwnzloxXCyjDZZ.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/abe2df18-fc80-4e8a-bf1d-5a989f730de4_rw_1920-mv0DOaZevOCv0W0k.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/32fab971-315e-473f-a336-931a5c6ae8ca_rw_1920-Ylev8XBPXESWQvKD.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/10039391-a39a-4da3-bc77-a8882333fa37_rw_1920-AoPvM7xMqnfbgPwM.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/f5fe52ad-93b5-4f54-b79a-19bb7b4ad660_rw_1920-A85wWgLJBMfyK3OL.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/960fe4e6-a59e-43a1-b5de-a8033a5d531d_rw_1920-Yyv3ja66zoIG64ra.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/29f848ce-6a37-40ce-9416-4f203225a85f_rw_1920-YanyXGwEnlSJB26y.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/6cf571fb-c32b-47b2-afee-4161c275e183_rw_1920-YbNvQ1l4J1hzK2LE.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/7a828763-fbb0-4fbd-83a2-ce421c7ac796_rw_1920-AGB681P6LkHBBkPL.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/d6baf372-2c5e-4f4c-8ace-259799fa7051_rw_1920-d95KJOjDw7SXB4l9.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/cf3e5b0f-0366-4e90-90eb-c60192e5c882_rw_1920-YNqy1neZw2in2ZBL.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/3d404a7c-8e46-49b3-bd2b-7a7da51f1975_rw_1920-m5Kwq4ayLGcr40NW.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/ff9a14e4-65e8-4103-9dd9-e2136ac8849a_rw_1920-YZ9VqLgrBlCx2xzZ.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/9c55cc45-a1d8-4049-9f12-e1d5f3bbc141_rw_1920-AzGe5vKVqaUGDEZe.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/32320776-8c0e-4c5d-b506-fac8ccb15c1b_rw_1920-dWxy7qggWyUgvbxK.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=530,fit=crop/YNqO7k0WyEUyB3w6/c_01-AR0yxZEzlGCnGzB5.jpg"
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
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=400,h=384,fit=crop/YNqO7k0WyEUyB3w6/dg_avi-m5Kw9r0g6WUEeL1E.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=400,h=384,fit=crop/YNqO7k0WyEUyB3w6/dg-white-png-mv0D6O9Gz1F5yZqL.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=400,h=384,fit=crop/YNqO7k0WyEUyB3w6/dg-purple-png-AzGew5EBegtqaOzb.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=400,h=384,fit=crop/YNqO7k0WyEUyB3w6/dg-black-png-AGB6k8q0jkUp4vGK.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=400,h=384,fit=crop/YNqO7k0WyEUyB3w6/dg-discord-logo-A0xwJ54NrzHLgBz0.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop,trim=0;0;58.8235294117647;0/YNqO7k0WyEUyB3w6/dg-header-m7Vw46MwBpsoXbaV.jpg"
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
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=400,h=384,fit=crop/YNqO7k0WyEUyB3w6/tuki_avi-01-AMqbJ1jrgzT8VO68.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=400,h=384,fit=crop/YNqO7k0WyEUyB3w6/tuki_avi_02-Y4LV7DnogRUeGWEb.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=400,h=384,fit=crop/YNqO7k0WyEUyB3w6/tuki_avi_03-Yyv3w9eq3bS6EPOa.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/tuki-x-header-AoPv3q39qksKK531.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/tuki-announcement-backing-dWxy8v6wKpHzx5z0.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=600,fit=crop/YNqO7k0WyEUyB3w6/uki-YKb6q3vNMoiGV4V8.png"
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
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=600,fit=crop/YNqO7k0WyEUyB3w6/sgc-avi-02-dWxyk2D7NPCn19M9.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=600,fit=crop/YNqO7k0WyEUyB3w6/sgc-avi-01-AMqbkk8v0liEz95N.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=600,fit=crop/YNqO7k0WyEUyB3w6/sgc-logo-white-YKb6kklD2XFPDZ9r.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=600,fit=crop/YNqO7k0WyEUyB3w6/sgc-logo-red-m2WpwwEN3bSoNO9v.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=600,fit=crop/YNqO7k0WyEUyB3w6/sgc-header-Yyv3bbD0GrfBQvQB.jpg"
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
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=384,fit=crop/YNqO7k0WyEUyB3w6/hp_league_avi-YrDlvXpP6gHPZ9KB.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/2ac76de3-0fbb-412b-9d36-f49b13d40ea8_rw_1920-mp8vEQKQEBHX9aqO.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/8300665a-8100-40d6-8f1e-fc7926018735_rw_1920-YrDlvyGnbrT0z2ov.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/d4f43278-7992-4f84-a26a-25495d87bad6_rw_1920-YlevxJB70RFp67ZV.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/33c8d989-0d9d-47dc-9aa1-43e10a434945_rw_1920-d95K0LjNgph2WB0j.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/5a496850-b708-4ea7-add7-5c8d35e63ef6_rw_1920-YNqykGezoOcr6wWR.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/90c2951d-f259-4722-827f-3e1a4f8588bd_rw_1920-mP4nkgB6pzsyBeaQ.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/0a8d86b5-e66d-4ac7-950e-354097748329_rw_1920-AoPv5XK3PZCg9WV3.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/f970f9d1-3770-45c7-804b-fbfe6f9ee6f5_rw_1920-Y4LVQ1X1J5fznWob.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/7e6c584f-d78f-49bf-8d40-cec6c940c1c7_rw_1920-YZ9Vk3zDNJcVkaZL.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/e0169fa7-d003-47db-a9f4-cb8d6db36a66_rw_1920-A85wKxXxORTKGJO4.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/5377fc96-18c7-45fe-9063-65b81501f449_rw_1920-A1awbZ3VLVTWEK6X.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/86175704-4d3a-4f80-9210-0e70d70b773b_rw_1920-mnlvjwKLBKFg4bV4.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/58d2d0ce-08a0-4ef3-a686-f7a92a814a96_rw_1920-YrDlvyG71giO0Z9v.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/e794106e-053d-4856-8906-52cf42015ba6_rw_1920-YD06kJX10nfn2RGR.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/f0fccf62-9654-40ad-83fd-b5396d42ae14_rw_1920-YZ9Vk3gGEku8Xz35.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/0a3f9373-07ad-4ba0-9700-e6bb871ab394_rw_1920-ALpnkKg62rSMx039.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/5bb59670-c448-4c37-a00f-7d1b97408d11_rw_1920-mp8vEQKawzTXr5e9.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/finalboss-AVLpk2KgOBcpO4MY.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/big_rich-mePvZ7VwKDiEV3kO.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/rarity-AR0ykoKW0ySEZLMb.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/anni-A3QwXekl7GfXXN6x.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/dual_2-YrDlvyVJNvU9XrkL.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/hp_banner-m6LwnjpkXru506NM.jpg"
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
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=520,fit=crop/YNqO7k0WyEUyB3w6/03-mePvzoo300Tpexbz.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=520,fit=crop/YNqO7k0WyEUyB3w6/02-YlevwooDQxhBGBwO.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=520,fit=crop/YNqO7k0WyEUyB3w6/01-YD06RLL5yMtzjRw2.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=520,fit=crop/YNqO7k0WyEUyB3w6/04-mp8vyll7q1TrGMJx.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=100,h=96,fit=crop/YNqO7k0WyEUyB3w6/blue-AzGe2BVRWBunJGq0.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=100,h=96,fit=crop/YNqO7k0WyEUyB3w6/bronze-YrDlK8VPGGhJXobo.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=100,h=96,fit=crop/YNqO7k0WyEUyB3w6/gold-Yg2WNoVGMMSVDjW5.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=100,h=96,fit=crop/YNqO7k0WyEUyB3w6/green-ALpnRNrVZOSbr6eB.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=100,h=96,fit=crop/YNqO7k0WyEUyB3w6/multi-color-mk3zboV71KUy7Wge.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=100,h=96,fit=crop/YNqO7k0WyEUyB3w6/silver-AE0oRjKVgXHKWR5D.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=200,fit=crop/YNqO7k0WyEUyB3w6/chat-rules-mp8vylVka5FDqjaO.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=200,fit=crop/YNqO7k0WyEUyB3w6/discord-A85wR80aoqcvoaPX.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=200,fit=crop/YNqO7k0WyEUyB3w6/instagram-YKb6RnK04NCzOQGV.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=200,fit=crop/YNqO7k0WyEUyB3w6/me-YZ9V1oKP13H57Q2x.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=200,fit=crop/YNqO7k0WyEUyB3w6/specs-dWxyZoKPrDSkLzGX.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=200,fit=crop/YNqO7k0WyEUyB3w6/sub-m2WpRJ0g08TjwG1G.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=200,fit=crop/YNqO7k0WyEUyB3w6/tiktok-mP4nRbKD8kfBBlJB.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=200,fit=crop/YNqO7k0WyEUyB3w6/x-dJo6RzK7DaF42lB3.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=624,fit=crop/YNqO7k0WyEUyB3w6/nevers-offline-screen-A3QwRbkQyOTReby9.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=328,fit=crop/YNqO7k0WyEUyB3w6/nevers-twitter-header-A85wR805q8t9jayR.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=624,fit=crop/YNqO7k0WyEUyB3w6/nevers-yt-banner-mjEvJoVWpzu5MPJE.jpg"
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
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=1251,fit=crop/YNqO7k0WyEUyB3w6/a422a974-a8b6-46fb-9d83-d63de3e8a72e_rw_600-AQEyO1ogRXsBJXpb.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/6c9e4cbc-8a87-4bff-83a5-abb135cea357_rw_1200-m2Wp7jX3QOS2yvo6.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/5cf7e64f-75ec-4cdc-836b-db144d03a1ab_rw_1200-YNqy1EgGypHqDKew.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/e86f2571-46ee-4deb-a274-3f5861b4fb5e_rw_1200-Yg2WnbKReziq71Or.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/4dcd38df-7ad3-4c9b-b991-d9f3e17c4142_rw_1200-AGB689gwREFBnLOk.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/e86449df-d93a-4698-ae85-e6df7c691007_rw_1200-ALpn3vgKWNFjO119.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/6e3081b0-16b8-408c-88e6-e0036135d74e_rw_1200-AoPvMlKXWGcWby5o.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/616730bd-88bf-480e-9240-d3a00fa5428a_rw_1200-A1awEkXZMMHWaODz.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/000e2c63-3f01-43e6-ba8f-4e5252eeb25a_rw_1200-YanyXbKLJkhz9apO.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/7d821464-38e1-4c9a-8d38-6412e8078b0e_rw_1200-m5KwqyQBaxuXxNo6.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/59adadf8-8b07-4083-97f7-0d4d80bff03e_rw_1200-YbNvQG0jgKHgMK0R.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/f4a604a0-d381-4d3f-ab23-4847e75fe6ba_rw_1200-YNqy1EgGE4T5DPqw.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/976d68ca-170f-49ff-b9ad-3675adf5dc2c_rw_1200-Aq2v3nK9QJujrrzO.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/d35f037b-2e5f-4bd8-9b81-3dab2b4c051e_rw_1200-AMqbeGg0G5ie8QRy.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/b0bf9b53-6d7d-4180-acae-961b0670b579_rw_1200-YZ9Vq5g3NxU5QrpL.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/bc2c6e80-de21-4d46-85f2-7e57c30b6f24_rw_1200-AE0olegb0QfplpeQ.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/d91d877e-8739-4ff8-8134-8c134f12d1c4_rw_600-d95KJlnLQ0c25rRW.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/91cfbbbb-485c-4edd-a4f2-8912a0053cce_rw_1200-Yg2WnbK3E4s51M87.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/abbfd8bb-6634-4ef2-aa72-8932cdb678f3_rw_1200-m2Wp7jX3Q0fMJ5wk.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/58e34caa-367c-4575-88c6-2b37b886a857_rw_1200-AQEyO1ora9uvBLXQ.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/789c4fda-a42a-49d8-a88c-aedf81a0ca28_rw_1200-YD06V9Xx97TzN9B3.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/5a83a6fd-f7c0-4c52-ad37-7441aa202d48_rw_1200-mv0DOeKGlph3JvLZ.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/65f1b13c-4acd-446c-9755-8fb96a7db199_rw_1200-AR0yx9goxzS81yB7.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/screenshot_2024-12-01_141754-d95KJlnLr8uVRJ04.png"
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
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=864,fit=crop/YNqO7k0WyEUyB3w6/c4a83127-4a3e-4f60-9ba8-8dba90f43791_rw_1200-AQEyOM9p1yF9GWwO.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=864,fit=crop/YNqO7k0WyEUyB3w6/44700b08-43d2-4a7b-81a4-28996a49385c_rw_1200-AzGe5nz7X2CGQXg1.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=864,fit=crop/YNqO7k0WyEUyB3w6/7909ff82-f1c6-4708-9aba-3fe833cd99d6_rw_1200-mePv4NavO6T2pv2Q.jpg"
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

          {/* Hero Image - Only show if no gallery exists */}
          {(!project.gallery || project.gallery.length === 0) && (
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
          )}

          {/* Project Gallery */}
          {project.gallery && project.gallery.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12 text-center">
                Project Gallery
              </h2>
              <div className="masonry-grid">
                {project.gallery.map((image, index) => (
                  <div key={index} className="masonry-item group cursor-pointer">
                    <div className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                      <img 
                        src={image} 
                        alt={`${project.title} - Image ${index + 1}`}
                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                        style={{maxWidth: '100%', height: 'auto'}}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-4 left-4">
                          <p className="text-white text-sm font-medium">Image {index + 1}</p>
                          <p className="text-white/80 text-xs">{project.category}</p>
                        </div>
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
  const services = [
    {
      icon: Palette,
      title: "Graphic Design",
      description: "Professional logo design, branding packages, and visual identity creation that makes your brand stand out.",
      features: ["Logo Design", "Brand Identity", "Print Design", "Marketing Materials"],
      price: "Starting at $299",
      popular: false
    },
    {
      icon: Video,
      title: "Motion Graphics & VFX",
      description: "Dynamic animations, visual effects, and motion graphics that bring your ideas to life with stunning visuals.",
      features: ["2D/3D Animation", "Visual Effects", "Motion Graphics", "Video Editing"],
      price: "Starting at $499",
      popular: true
    },
    {
      icon: Code,
      title: "Web Development",
      description: "Custom websites and web applications built with modern technologies for optimal performance and user experience.",
      features: ["Custom Websites", "Web Applications", "E-commerce", "Mobile Responsive"],
      price: "Starting at $799",
      popular: false
    },
    {
      icon: Music,
      title: "Audio Production",
      description: "Professional music production, sound design, and audio editing services for content creators and businesses.",
      features: ["Music Production", "Sound Design", "Audio Editing", "Podcast Production"],
      price: "Starting at $199",
      popular: false
    },
    {
      icon: Users,
      title: "Content Creator Branding",
      description: "Complete branding solutions for streamers, YouTubers, and content creators including overlays and graphics.",
      features: ["Stream Overlays", "Social Media Graphics", "Thumbnails", "Brand Packages"],
      price: "Starting at $399",
      popular: true
    },
    {
      icon: Box,
      title: "3D Modeling & Rendering",
      description: "High-quality 3D models, renders, and animations for product visualization and architectural projects.",
      features: ["3D Modeling", "Product Renders", "Architectural Visualization", "3D Animation"],
      price: "Starting at $599",
      popular: false
    }
  ];

  const processSteps = [
    {
      step: "01",
      title: "Discovery & Planning",
      description: "We start by understanding your vision, goals, and requirements through detailed consultation."
    },
    {
      step: "02", 
      title: "Concept & Design",
      description: "Our team creates initial concepts and designs based on your specifications and feedback."
    },
    {
      step: "03",
      title: "Development & Creation",
      description: "We bring your project to life using cutting-edge tools and professional techniques."
    },
    {
      step: "04",
      title: "Review & Refinement",
      description: "We refine the work based on your feedback to ensure it exceeds your expectations."
    },
    {
      step: "05",
      title: "Delivery & Support",
      description: "Final delivery with all necessary files and ongoing support for your project."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300 relative">
      <FloatingElements />
      <div className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Our <span className="gradient-text">Services</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-3xl mx-auto">
              From concept to completion, we offer comprehensive creative solutions designed to bring your vision to life and elevate your brand.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white">
                  Get Started Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/portfolio">
                <Button size="lg" variant="outline">
                  View Our Work
                </Button>
              </Link>
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {services.map((service, index) => (
              <Card key={index} className={`border-0 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                service.popular 
                  ? 'bg-gradient-to-br from-teal-50 to-purple-50 dark:from-teal-900/20 dark:to-purple-900/20 ring-2 ring-teal-500/20' 
                  : 'bg-white/90 dark:bg-slate-800/90'
              } backdrop-blur-sm relative`}>
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-teal-500 to-purple-500 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-gradient-to-r from-teal-100 to-purple-100 dark:from-teal-900/30 dark:to-purple-900/30 rounded-full mr-4">
                      <service.icon className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{service.title}</h3>
                      <p className="text-teal-600 dark:text-teal-400 font-semibold">{service.price}</p>
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-slate-700 dark:text-slate-300">
                        <CheckCircle className="w-5 h-5 text-teal-500 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link to="/contact">
                    <Button 
                      className={`w-full ${
                        service.popular
                          ? 'bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      Get Quote
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Process Section */}
          <div className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Our <span className="gradient-text">Process</span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                We follow a proven methodology to ensure your project is delivered on time, within budget, and exceeds expectations.
              </p>
            </div>

            <div className="grid md:grid-cols-5 gap-8">
              {processSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-purple-500 rounded-full mx-auto flex items-center justify-center mb-4">
                      <span className="text-white font-bold text-lg">{step.step}</span>
                    </div>
                    {index < processSteps.length - 1 && (
                      <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-teal-500/30 to-purple-500/30 transform -translate-y-0.5"></div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Industries Section */}
          <div className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Industries We <span className="gradient-text">Serve</span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-12">
                We've worked with businesses across various industries, delivering tailored solutions that drive results.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Gaming & Esports", icon: "🎮", description: "Teams, tournaments, and gaming companies" },
                { title: "Content Creators", icon: "📹", description: "YouTubers, streamers, and influencers" },
                { title: "Technology", icon: "💻", description: "SaaS, apps, and tech startups" },
                { title: "Entertainment", icon: "🎬", description: "Film studios, music labels, and artists" },
                { title: "E-commerce", icon: "🛒", description: "Online stores and retail brands" },
                { title: "Professional Services", icon: "💼", description: "Consulting, law firms, and agencies" },
                { title: "Healthcare", icon: "🏥", description: "Medical practices and health tech" },
                { title: "Education", icon: "🎓", description: "Schools, courses, and training" }
              ].map((industry, index) => (
                <Card key={index} className="border-0 shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-center p-6 hover:shadow-xl transition-all duration-300">
                  <div className="text-4xl mb-4">{industry.icon}</div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">{industry.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{industry.description}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <Card className="border-0 shadow-xl bg-gradient-to-r from-teal-500/10 to-purple-500/10 dark:from-teal-500/20 dark:to-purple-500/20 backdrop-blur-sm">
              <CardContent className="p-12">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                  Ready to Start Your Project?
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
                  Let's discuss how we can help bring your vision to life. Get in touch for a free consultation and quote.
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
                      View Portfolio
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
      type: "branding",
      gallery: [
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop/YNqO7k0WyEUyB3w6/whysper_avi-01-preview-mP42OaJv8vi3174j.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop/YNqO7k0WyEUyB3w6/whysper_avi-02-preview-1-mp8qWZ5JbJt8ll2j.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop/YNqO7k0WyEUyB3w6/whysper_avi-03-preview-1-Yanq1XPJg5f36bKx.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/whysper_twitch-header-1-A1aBPEG5ODiVNDOp.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/whysper_twitter-header-1-YBge70aOoBt4K04D.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=384,fit=crop/YNqO7k0WyEUyB3w6/whysper_weekly-schedule-1-YBge70aWZqSawbN7.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=915,h=504,fit=crop/YNqO7k0WyEUyB3w6/whysper_offline-screen-1-m2Wa87VGPkSQ6N0a.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=915,h=184,fit=crop/YNqO7k0WyEUyB3w6/yt-mp8qJ97qnwFrzoz0.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=915,h=184,fit=crop/YNqO7k0WyEUyB3w6/tiktok-AR0M3bVL3qSNx09Z.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=915,h=184,fit=crop/YNqO7k0WyEUyB3w6/sub-YNqP2rN2MyUkDlpn.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=915,h=184,fit=crop/YNqO7k0WyEUyB3w6/specs-YbNqJ9yLXjHbor98.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=915,h=184,fit=crop/YNqO7k0WyEUyB3w6/me-AVL1abNj63Tl1JK0.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=915,h=184,fit=crop/YNqO7k0WyEUyB3w6/instagram-A0x1jVrZqnCyNJbp.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=915,h=184,fit=crop/YNqO7k0WyEUyB3w6/donate-dJo5b4NzKGfk8O79.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=915,h=184,fit=crop/YNqO7k0WyEUyB3w6/chat-rules-AR0M3bVvoWT7xnWB.png"
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
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=437,h=328,fit=crop/YNqO7k0WyEUyB3w6/midas-white-A1a5kvDQOnCMPJzN.png",

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
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=384,fit=crop/YNqO7k0WyEUyB3w6/x8_vb24x_400x400-Yany8zezOEf96GR1.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/img_1795-YNqykO6O7yIrvvGr.jpg"
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
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/dab21dff-54d2-443f-8116-92041be0886b_rw_1200-Yyv3b2NyzNsR7pVv.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=612,h=480,fit=crop/YNqO7k0WyEUyB3w6/4fe16eef-716b-442a-8353-491f61740cab_rw_3840-AGB681DL4EF6nlzL.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=915,h=480,fit=crop/YNqO7k0WyEUyB3w6/e795ed40-7f78-4cc9-b0eb-11931e05891f_rw_1920-min-Yyv3jaO7kDU3Z2W3.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/63b6a0f1-87db-4bcf-b0f0-370da63c6d1a_rw_1920-d95KJOjBLViZjvaL.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/061ec31e-4c4b-4876-891d-5cae1f814723_rw_1920-YD06V7LvWzsnbK89.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/2f6c33e9-d982-445b-8c7d-a7faf985f328_rw_1920-dJo6MpDypjHb2GvJ.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/9aee2acb-f837-4ad2-8f31-1dd541008543_rw_1920-Aq2v38P5VzunLWxv.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/c2e76595-68f3-49c6-8fb2-eb5abe34a0ad_rw_1920-mnlvD0ok51fPbegz.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/theeternals_avi-01-mxBZLGDLpxIeXLBe.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/95549387-8cd0-436c-a1b9-4d5332b3da00_rw_1200-1-AGB681DDbXfRRL6v.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=530,fit=crop/YNqO7k0WyEUyB3w6/img_1913-mP4naD0LJgIXMKOR.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/1165cc2d-d74c-4b69-afd3-16656a7a8fcb_rw_1200-mv0DOanwNqhyrKE2.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/66a27793-4bd5-4b8a-86e6-ff8d69833e09_rw_1200-AE0ol98P61cRkMgq.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/e31a5f33-7d0b-4175-851d-d7dda55d3b8f_rw_1200-m6LwnzErpaSj4WvM.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/e51cc32a-70a2-417a-9380-3ce73cb06c0f_rw_1920-Aq2v38KgZnSW6pLQ.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/1ca71a08-a0fc-4847-bdcf-af19497c20f0_rw_1920-YNqy1ngbQ9sWNbwR.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/32c73ad8-7ac9-4f2c-a644-1f8bf0dc7138_rw_3840-YrDlekGJr5H0bJlb.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/07d4cbc8-3b7d-4227-b1a3-e10aa0e19476_rw_1920-AzGe5vgozLUWjKNN.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/df1df1cd-d6bf-420b-b36a-65cb9c284bd6_rw_1920-YD06V7QJDpULOxb3.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/662e8ca9-5948-4b9d-acf5-d68c7ed54979_rw_3840-Yg2WnB6ekwcQO9x0.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/8610c66d-2a81-4ad4-b89c-2f3f162ddc14_rw_3840-YrDlekG1MDTnr1a2.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/9c703744-acd0-4088-922c-1cd7ad5335ca_rw_3840-mnlvD0gMQPtezrnB.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/b97218d4-dd98-44c6-8a35-6c1fd5f839ce_rw_3840-mjEvlOKPNBF11q2V.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=480,fit=crop/YNqO7k0WyEUyB3w6/7bbd9ba2-6589-4858-bc57-630460a8653d_rw_3840-YZ9VqLgELZTPwl29.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/4cc9be77-a8fa-4974-8bf9-640fe77abafc_rw_1920-AVLpE4vV4ZSpj3Q0.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/61a2523b-624e-4729-82b0-0973d559069e_rw_1200-m2Wp7yJLa5U1Pvxl.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/a79a34b5-58fe-4d80-9817-6001f118883e_rw_1920-dWxy7qoRkxcbM8VL.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/d7345a56-853b-465d-93c4-0f8979f30ef1_rw_1920-YKb6Z7nQN3I93R8o.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/4361e8bf-cfa6-467e-aaa9-c3ca57c43cef_rw_1920-YX4yvOogxnfzlZKM.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/9e166081-3462-48cb-af67-dc9635ce9b2a_rw_1920-mP4naGbWzjsvGv8g.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/30b35aff-b834-4362-ad0b-3cb3dd9cb2df_rw_1920-mnlvD0o7WPhWKZ6d.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/6f69fff4-d08f-4254-b5b6-59b513dafe08_rw_1920-m6LwnzloxXCyjDZZ.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/abe2df18-fc80-4e8a-bf1d-5a989f730de4_rw_1920-mv0DOaZevOCv0W0k.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/32fab971-315e-473f-a336-931a5c6ae8ca_rw_1920-Ylev8XBPXESWQvKD.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/10039391-a39a-4da3-bc77-a8882333fa37_rw_1920-AoPvM7xMqnfbgPwM.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/f5fe52ad-93b5-4f54-b79a-19bb7b4ad660_rw_1920-A85wWgLJBMfyK3OL.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/960fe4e6-a59e-43a1-b5de-a8033a5d531d_rw_1920-Yyv3ja66zoIG64ra.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/29f848ce-6a37-40ce-9416-4f203225a85f_rw_1920-YanyXGwEnlSJB26y.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/6cf571fb-c32b-47b2-afee-4161c275e183_rw_1920-YbNvQ1l4J1hzK2LE.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/7a828763-fbb0-4fbd-83a2-ce421c7ac796_rw_1920-AGB681P6LkHBBkPL.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/d6baf372-2c5e-4f4c-8ace-259799fa7051_rw_1920-d95KJOjDw7SXB4l9.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/cf3e5b0f-0366-4e90-90eb-c60192e5c882_rw_1920-YNqy1neZw2in2ZBL.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/3d404a7c-8e46-49b3-bd2b-7a7da51f1975_rw_1920-m5Kwq4ayLGcr40NW.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/ff9a14e4-65e8-4103-9dd9-e2136ac8849a_rw_1920-YZ9VqLgrBlCx2xzZ.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/9c55cc45-a1d8-4049-9f12-e1d5f3bbc141_rw_1920-AzGe5vKVqaUGDEZe.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/32320776-8c0e-4c5d-b506-fac8ccb15c1b_rw_1920-dWxy7qggWyUgvbxK.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=530,fit=crop/YNqO7k0WyEUyB3w6/c_01-AR0yxZEzlGCnGzB5.jpg"
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
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=400,h=384,fit=crop/YNqO7k0WyEUyB3w6/dg_avi-m5Kw9r0g6WUEeL1E.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=400,h=384,fit=crop/YNqO7k0WyEUyB3w6/dg-white-png-mv0D6O9Gz1F5yZqL.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=400,h=384,fit=crop/YNqO7k0WyEUyB3w6/dg-purple-png-AzGew5EBegtqaOzb.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=400,h=384,fit=crop/YNqO7k0WyEUyB3w6/dg-black-png-AGB6k8q0jkUp4vGK.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=400,h=384,fit=crop/YNqO7k0WyEUyB3w6/dg-discord-logo-A0xwJ54NrzHLgBz0.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop,trim=0;0;58.8235294117647;0/YNqO7k0WyEUyB3w6/dg-header-m7Vw46MwBpsoXbaV.jpg"
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
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=400,h=384,fit=crop/YNqO7k0WyEUyB3w6/tuki_avi-01-AMqbJ1jrgzT8VO68.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=400,h=384,fit=crop/YNqO7k0WyEUyB3w6/tuki_avi_02-Y4LV7DnogRUeGWEb.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=400,h=384,fit=crop/YNqO7k0WyEUyB3w6/tuki_avi_03-Yyv3w9eq3bS6EPOa.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/tuki-x-header-AoPv3q39qksKK531.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/tuki-announcement-backing-dWxy8v6wKpHzx5z0.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=600,fit=crop/YNqO7k0WyEUyB3w6/uki-YKb6q3vNMoiGV4V8.png"
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
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=600,fit=crop/YNqO7k0WyEUyB3w6/sgc-avi-02-dWxyk2D7NPCn19M9.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=600,fit=crop/YNqO7k0WyEUyB3w6/sgc-avi-01-AMqbkk8v0liEz95N.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=600,fit=crop/YNqO7k0WyEUyB3w6/sgc-logo-white-YKb6kklD2XFPDZ9r.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=600,fit=crop/YNqO7k0WyEUyB3w6/sgc-logo-red-m2WpwwEN3bSoNO9v.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=600,fit=crop/YNqO7k0WyEUyB3w6/sgc-header-Yyv3bbD0GrfBQvQB.jpg"
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
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=384,fit=crop/YNqO7k0WyEUyB3w6/hp_league_avi-YrDlvXpP6gHPZ9KB.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/2ac76de3-0fbb-412b-9d36-f49b13d40ea8_rw_1920-mp8vEQKQEBHX9aqO.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/8300665a-8100-40d6-8f1e-fc7926018735_rw_1920-YrDlvyGnbrT0z2ov.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/d4f43278-7992-4f84-a26a-25495d87bad6_rw_1920-YlevxJB70RFp67ZV.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/33c8d989-0d9d-47dc-9aa1-43e10a434945_rw_1920-d95K0LjNgph2WB0j.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/5a496850-b708-4ea7-add7-5c8d35e63ef6_rw_1920-YNqykGezoOcr6wWR.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/90c2951d-f259-4722-827f-3e1a4f8588bd_rw_1920-mP4nkgB6pzsyBeaQ.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/0a8d86b5-e66d-4ac7-950e-354097748329_rw_1920-AoPv5XK3PZCg9WV3.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/f970f9d1-3770-45c7-804b-fbfe6f9ee6f5_rw_1920-Y4LVQ1X1J5fznWob.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/7e6c584f-d78f-49bf-8d40-cec6c940c1c7_rw_1920-YZ9Vk3zDNJcVkaZL.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/e0169fa7-d003-47db-a9f4-cb8d6db36a66_rw_1920-A85wKxXxORTKGJO4.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/5377fc96-18c7-45fe-9063-65b81501f449_rw_1920-A1awbZ3VLVTWEK6X.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/86175704-4d3a-4f80-9210-0e70d70b773b_rw_1920-mnlvjwKLBKFg4bV4.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/58d2d0ce-08a0-4ef3-a686-f7a92a814a96_rw_1920-YrDlvyG71giO0Z9v.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/e794106e-053d-4856-8906-52cf42015ba6_rw_1920-YD06kJX10nfn2RGR.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/f0fccf62-9654-40ad-83fd-b5396d42ae14_rw_1920-YZ9Vk3gGEku8Xz35.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/0a3f9373-07ad-4ba0-9700-e6bb871ab394_rw_1920-ALpnkKg62rSMx039.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/5bb59670-c448-4c37-a00f-7d1b97408d11_rw_1920-mp8vEQKawzTXr5e9.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/finalboss-AVLpk2KgOBcpO4MY.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/big_rich-mePvZ7VwKDiEV3kO.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/rarity-AR0ykoKW0ySEZLMb.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/anni-A3QwXekl7GfXXN6x.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=384,fit=crop/YNqO7k0WyEUyB3w6/dual_2-YrDlvyVJNvU9XrkL.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=384,fit=crop/YNqO7k0WyEUyB3w6/hp_banner-m6LwnjpkXru506NM.jpg"
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
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=520,fit=crop/YNqO7k0WyEUyB3w6/03-mePvzoo300Tpexbz.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=520,fit=crop/YNqO7k0WyEUyB3w6/02-YlevwooDQxhBGBwO.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=520,fit=crop/YNqO7k0WyEUyB3w6/01-YD06RLL5yMtzjRw2.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=503,h=520,fit=crop/YNqO7k0WyEUyB3w6/04-mp8vyll7q1TrGMJx.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=100,h=96,fit=crop/YNqO7k0WyEUyB3w6/blue-AzGe2BVRWBunJGq0.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=100,h=96,fit=crop/YNqO7k0WyEUyB3w6/bronze-YrDlK8VPGGhJXobo.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=100,h=96,fit=crop/YNqO7k0WyEUyB3w6/gold-Yg2WNoVGMMSVDjW5.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=100,h=96,fit=crop/YNqO7k0WyEUyB3w6/green-ALpnRNrVZOSbr6eB.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=100,h=96,fit=crop/YNqO7k0WyEUyB3w6/multi-color-mk3zboV71KUy7Wge.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=100,h=96,fit=crop/YNqO7k0WyEUyB3w6/silver-AE0oRjKVgXHKWR5D.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=200,fit=crop/YNqO7k0WyEUyB3w6/chat-rules-mp8vylVka5FDqjaO.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=200,fit=crop/YNqO7k0WyEUyB3w6/discord-A85wR80aoqcvoaPX.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=200,fit=crop/YNqO7k0WyEUyB3w6/instagram-YKb6RnK04NCzOQGV.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=200,fit=crop/YNqO7k0WyEUyB3w6/me-YZ9V1oKP13H57Q2x.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=200,fit=crop/YNqO7k0WyEUyB3w6/specs-dWxyZoKPrDSkLzGX.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=200,fit=crop/YNqO7k0WyEUyB3w6/sub-m2WpRJ0g08TjwG1G.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=200,fit=crop/YNqO7k0WyEUyB3w6/tiktok-mP4nRbKD8kfBBlJB.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=709,h=200,fit=crop/YNqO7k0WyEUyB3w6/x-dJo6RzK7DaF42lB3.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=624,fit=crop/YNqO7k0WyEUyB3w6/nevers-offline-screen-A3QwRbkQyOTReby9.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=328,fit=crop/YNqO7k0WyEUyB3w6/nevers-twitter-header-A85wR805q8t9jayR.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=624,fit=crop/YNqO7k0WyEUyB3w6/nevers-yt-banner-mjEvJoVWpzu5MPJE.jpg"
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
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=687,h=384,fit=crop/YNqO7k0WyEUyB3w6/493e7d28-3b40-4c19-917b-fea305f43983_rw_1920-1-A85wW3N7RRUoKXlx.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=687,h=384,fit=crop/YNqO7k0WyEUyB3w6/c3f4f288-9f7c-4ec9-89db-e3088a16a602_rw_1920-YrDle0221nILr5K9.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=687,h=384,fit=crop/YNqO7k0WyEUyB3w6/b3722e09-39c2-4c4d-83c8-6d0140e40f2b_rw_1920-AMqbePGGeNhaLKMz.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=687,h=384,fit=crop/YNqO7k0WyEUyB3w6/sledge-myers-ep-1-m7V5qQJjQ2hZL4Zx.jpg"
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
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=1251,fit=crop/YNqO7k0WyEUyB3w6/a422a974-a8b6-46fb-9d83-d63de3e8a72e_rw_600-AQEyO1ogRXsBJXpb.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/6c9e4cbc-8a87-4bff-83a5-abb135cea357_rw_1200-m2Wp7jX3QOS2yvo6.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/5cf7e64f-75ec-4cdc-836b-db144d03a1ab_rw_1200-YNqy1EgGypHqDKew.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/e86f2571-46ee-4deb-a274-3f5861b4fb5e_rw_1200-Yg2WnbKReziq71Or.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/4dcd38df-7ad3-4c9b-b991-d9f3e17c4142_rw_1200-AGB689gwREFBnLOk.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/e86449df-d93a-4698-ae85-e6df7c691007_rw_1200-ALpn3vgKWNFjO119.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/6e3081b0-16b8-408c-88e6-e0036135d74e_rw_1200-AoPvMlKXWGcWby5o.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/616730bd-88bf-480e-9240-d3a00fa5428a_rw_1200-A1awEkXZMMHWaODz.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/000e2c63-3f01-43e6-ba8f-4e5252eeb25a_rw_1200-YanyXbKLJkhz9apO.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/7d821464-38e1-4c9a-8d38-6412e8078b0e_rw_1200-m5KwqyQBaxuXxNo6.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/59adadf8-8b07-4083-97f7-0d4d80bff03e_rw_1200-YbNvQG0jgKHgMK0R.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/f4a604a0-d381-4d3f-ab23-4847e75fe6ba_rw_1200-YNqy1EgGE4T5DPqw.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/976d68ca-170f-49ff-b9ad-3675adf5dc2c_rw_1200-Aq2v3nK9QJujrrzO.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/d35f037b-2e5f-4bd8-9b81-3dab2b4c051e_rw_1200-AMqbeGg0G5ie8QRy.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/b0bf9b53-6d7d-4180-acae-961b0670b579_rw_1200-YZ9Vq5g3NxU5QrpL.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/bc2c6e80-de21-4d46-85f2-7e57c30b6f24_rw_1200-AE0olegb0QfplpeQ.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/d91d877e-8739-4ff8-8134-8c134f12d1c4_rw_600-d95KJlnLQ0c25rRW.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/91cfbbbb-485c-4edd-a4f2-8912a0053cce_rw_1200-Yg2WnbK3E4s51M87.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/abbfd8bb-6634-4ef2-aa72-8932cdb678f3_rw_1200-m2Wp7jX3Q0fMJ5wk.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/58e34caa-367c-4575-88c6-2b37b886a857_rw_1200-AQEyO1ora9uvBLXQ.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/789c4fda-a42a-49d8-a88c-aedf81a0ca28_rw_1200-YD06V9Xx97TzN9B3.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/5a83a6fd-f7c0-4c52-ad37-7441aa202d48_rw_1200-mv0DOeKGlph3JvLZ.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/65f1b13c-4acd-446c-9755-8fb96a7db199_rw_1200-AR0yx9goxzS81yB7.png",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1224,h=1251,fit=crop/YNqO7k0WyEUyB3w6/screenshot_2024-12-01_141754-d95KJlnLr8uVRJ04.png"
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
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=864,fit=crop/YNqO7k0WyEUyB3w6/c4a83127-4a3e-4f60-9ba8-8dba90f43791_rw_1200-AQEyOM9p1yF9GWwO.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=864,fit=crop/YNqO7k0WyEUyB3w6/44700b08-43d2-4a7b-81a4-28996a49385c_rw_1200-AzGe5nz7X2CGQXg1.jpg",
        "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=606,h=864,fit=crop/YNqO7k0WyEUyB3w6/7909ff82-f1c6-4708-9aba-3fe833cd99d6_rw_1200-mePv4NavO6T2pv2Q.jpg"
      ]
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

          {/* Start Your Project Section */}
          <div className="text-center">
            <Card className="border-0 shadow-xl bg-gradient-to-r from-teal-50 to-purple-50 dark:from-teal-900/20 dark:to-purple-900/20 backdrop-blur-sm">
              <CardContent className="p-12">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                  Ready to Start Your Project?
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
                  Let's bring your vision to life. From concept to completion, we'll work with you to create something extraordinary that stands out from the crowd.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/contact">
                    <Button size="lg" className="bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white">
                      Start Your Project
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/services">
                    <Button size="lg" variant="outline" className="border-slate-300 dark:border-slate-600">
                      View Our Services
                      <Eye className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>
                <div className="mt-8 text-center">
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                    Join over <span className="font-semibold text-teal-600 dark:text-teal-400">100+ satisfied clients</span> who trust us with their creative projects
                  </p>
                  <div className="flex justify-center items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                    <span className="ml-2 text-slate-600 dark:text-slate-400 text-sm">5.0 from 50+ reviews</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Store Page Component
const StorePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = ['All', 'Game Addons', 'Design Templates', 'Graphics Packs', 'Music & Audio'];

  const products = [
    {
      id: 1,
      title: "Status HUD - Garry's Mod Addon",
      category: "Game Addons",
      price: "$4.99",
      image: "https://via.placeholder.com/400x300/1e293b/white?text=Status+HUD+Addon", // Placeholder as requested
      description: "An advanced OpSat-style Status HUD system designed for military roleplay servers in Garry's Mod. This comprehensive addon displays critical tactical information including current Sector, Orders, and DEFCON levels in a sleek, customizable interface positioned on the top-right of your screen.",
      detailedDescription: `
      **FEATURES:**
      
      **Core Functionality:**
      • Real-time display of Sector, Orders, and DEFCON status
      • Clean, military-themed OpSat interface design
      • Automatic synchronization across all players on the server
      • Admin-controlled status updates with permission system
      
      **Customization Options:**
      • Fully moveable HUD elements with precision positioning
      • Individual piece adjustment (Sector, Orders, DEFCON can be moved independently)
      • Fine-tuning controls for pixel-perfect placement
      • Custom font integration (Aurebesh AF Canon Tech & Oswald fonts included)
      
      **Admin Commands:**
      • /statushudpos - Opens position adjustment menu
      • /statushudedit - Advanced fine-tuning interface  
      • !statushud_menu - Quick access menu for editing DEFCON, Orders, and Sector
      • Comprehensive admin panel for status management
      
      **Technical Specifications:**
      • Compatible with SAM (Server Administration Mod)
      • Network optimized for minimal bandwidth usage
      • Client-side cookie storage for position preferences
      • Includes weapon_status_datapad for in-game status control
      • Professional military-grade visual design
      
      **Installation:**
      Simply extract to your Garry's Mod addons folder and restart your server. The addon automatically initializes and is ready for immediate use.
      
      **Perfect For:**
      • Military roleplay servers
      • Star Wars roleplay communities  
      • Tactical simulation games
      • Any server requiring coordinated status information
      
      This addon enhances immersion and coordination in military roleplay scenarios by providing a professional, easy-to-use status display system that keeps all players informed of current tactical conditions.`,
      tags: ["Garry's Mod", "HUD", "Military", "Roleplay", "OpSat", "Admin Tools"],
      features: [
        "Real-time Status Display",
        "Customizable Positioning", 
        "Admin Control Panel",
        "Multi-font Support",
        "SAM Integration",
        "Network Optimized"
      ],
      images: [] // Can be populated later with actual screenshots
    },
    {
      id: 2,
      title: "Premium Logo Pack",
      category: "Design Templates",
      price: "$19.99",
      image: "https://via.placeholder.com/400x300/059669/white?text=Logo+Pack",
      description: "Professional logo templates for gaming organizations, esports teams, and content creators.",
      detailedDescription: "A comprehensive collection of high-quality logo templates perfect for gaming organizations, esports teams, and content creators. Each template is fully customizable and comes in multiple formats.",
      tags: ["Logos", "Templates", "Gaming", "Esports"],
      features: [
        "50+ Logo Templates",
        "Vector Formats (SVG, AI)",
        "Multiple Color Variants",  
        "Commercial License",
        "PSD Source Files",
        "24/7 Support"
      ],
      images: []
    },
    {
      id: 3,
      title: "Twitch Overlay Bundle",
      category: "Graphics Packs", 
      price: "$24.99",
      image: "https://via.placeholder.com/400x300/7c3aed/white?text=Twitch+Overlays",
      description: "Complete streaming overlay package with animated elements and customizable components.",
      detailedDescription: "Transform your stream with our professional overlay bundle featuring animated alerts, customizable panels, and modern design elements perfect for any streaming setup.",
      tags: ["Twitch", "Streaming", "Overlays", "Animation"],
      features: [
        "20+ Overlay Designs",
        "Animated Alerts",
        "Customizable Panels",
        "OBS Compatible",
        "4K Resolution",
        "Easy Setup Guide"
      ],
      images: []
    }
  ];

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const ProductModal = ({ product, onClose }) => {
    if (!product) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white dark:bg-slate-800 p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{product.title}</h2>
            <button 
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Features:</h3>
                    <ul className="space-y-2">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-slate-600 dark:text-slate-400">
                          <CheckCircle className="w-4 h-4 text-teal-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Tags:</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="mb-6">
                  <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-4">{product.price}</div>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">{product.description}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Description:</h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="text-slate-600 dark:text-slate-400 whitespace-pre-line">
                      {product.detailedDescription}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300 relative">
      <FloatingElements />
      <div className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Our <span className="gradient-text">Store</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
              Premium digital products, game addons, and design resources
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category 
                  ? "bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white" 
                  : ""}
              >
                <Filter className="w-4 h-4 mr-2" />
                {category}
              </Button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img 
                    src={product.image} 
                    alt={product.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-teal-500 text-white">
                      {product.category}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{product.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{product.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {product.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{product.price}</div>
                    <div className="space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white">
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Card className="border-0 shadow-xl bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 backdrop-blur-sm">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  Need Something Custom?
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
                  Can't find what you're looking for? We offer custom development and design services tailored to your specific needs.
                </p>
                <Link to="/contact">
                  <Button size="lg" className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white">
                    Request Custom Work
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
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
      description: "Lead graphic designer specializing in branding and visual identity creation."
    },
    {
      name: "In Gloom Media",
      role: "Designer", 
      avatar: "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=297,h=264,fit=crop/YNqO7k0WyEUyB3w6/cw2cevgn_400x400-YZ9VkX2rnbt4wERz.jpg",
      description: "Creative designer focused on innovative visual solutions and brand experiences."
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
    firstName: '',
    lastName: '',
    email: '',
    company: '',
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
              Contact <span className="gradient-text">Information</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Have questions? We're here to help. Reach out to us through any of the following methods.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900 dark:text-white flex items-center">
                  <CheckCircle className="w-5 h-5 text-teal-400 mr-2" />
                  Send us a message
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Fill out the form below and we'll get back to you within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-slate-900 dark:text-white text-sm">First Name *</Label>
                      <Input
                        id="firstName"
                        placeholder="Enter your first name"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-slate-900 dark:text-white text-sm">Last Name *</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter your last name"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-900 dark:text-white text-sm">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-slate-900 dark:text-white text-sm">Company</Label>
                    <Input
                      id="company"
                      placeholder="Enter your company name"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-slate-900 dark:text-white text-sm">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="What's this about?"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-slate-900 dark:text-white text-sm">Message *</Label>
                    <Textarea
                      id="message"
                      rows={6}
                      placeholder="Tell us about your project or question..."
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500 resize-none"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white py-3"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              {/* Support Card */}
              <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-teal-500/20 rounded-full">
                      <Mail className="w-6 h-6 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-2">Support</h3>
                      <p className="text-teal-500 dark:text-teal-400 text-lg mb-2">Eternalsanctuarygg@gmail.com</p>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">Send us an email anytime</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Phone Card */}
              <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-teal-500/20 rounded-full">
                      <Phone className="w-6 h-6 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-2">Connect</h3>
                      <p className="text-teal-500 dark:text-teal-400 text-lg mb-2">(240) 523-3976</p>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">Call us for project inquiries</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media Card */}
              <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-teal-500/20 rounded-full">
                      <MapPin className="w-6 h-6 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-2">Social Media</h3>
                      <p className="text-teal-500 dark:text-teal-400 text-lg mb-2">Follow us on Instagram, Discord & Twitter</p>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">Stay connected with our community</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Response Time Card */}
              <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-teal-500/20 rounded-full">
                      <Clock className="w-6 h-6 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-2">Response Time</h3>
                      <p className="text-teal-500 dark:text-teal-400 text-lg mb-2">24-48 hours</p>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">We'll get back to you quickly</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Newsletter Subscription */}
          <div className="mt-16 text-center">
            <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Subscribe newsletter</h3>
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Email address"
                    className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500 flex-1"
                  />
                  <Button className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-8">
                    Subscribe
                  </Button>
                </div>
              </CardContent>
            </Card>
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
  const navigate = useNavigate();

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

  const handleSocialLogin = (provider) => {
    toast({
      title: "Coming Soon",
      description: `${provider} login will be available soon!`,
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300 relative flex items-center justify-center">
      <FloatingElements />
      
      {/* Back to Home Button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 z-20 flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
      >
        <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
        Back to Home
      </button>

      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <Card className="border-0 shadow-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
          {/* Logo */}
          <div className="text-center pt-8 pb-4">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center relative overflow-hidden">
              <img 
                src="https://customer-assets.emergentagent.com/job_image-showcase-36/artifacts/gks2nspj_Eternals%20Studio.png" 
                alt="Eternals Studio Logo" 
                className="w-full h-full object-contain transition-all duration-300 dark:brightness-0 dark:invert"
              />
            </div>
          </div>

          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-slate-900 dark:text-white mb-2">
              Welcome to Eternals Studio
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <Tabs value={isLogin ? 'login' : 'register'} onValueChange={(value) => setIsLogin(value === 'login')}>
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 dark:bg-slate-700">
                <TabsTrigger value="login" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 text-slate-900 dark:text-white">Sign In</TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 text-slate-900 dark:text-white">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-900 dark:text-white">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-900 dark:text-white">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white py-3"
                  >
                    Sign In
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-slate-900 dark:text-white">Full Name</Label>
                    <Input
                      id="full_name"
                      placeholder="Enter your full name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-900 dark:text-white">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-teal-500 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white py-3"
                  >
                    Sign Up
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Social Login Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-slate-300 dark:border-slate-600"></div>
              <span className="px-4 text-slate-600 dark:text-slate-400 text-sm">OR CONTINUE WITH</span>
              <div className="flex-1 border-t border-slate-300 dark:border-slate-600"></div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600 py-3"
                onClick={() => handleSocialLogin('Google')}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600 py-3"
                onClick={() => handleSocialLogin('Discord')}
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Discord
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600 py-3"
                onClick={() => handleSocialLogin('LinkedIn')}
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600 py-3"
                onClick={() => handleSocialLogin('Apple')}
              >
                <img 
                  src="https://customer-assets.emergentagent.com/job_image-showcase-36/artifacts/skx6zwiw_apple.png" 
                  alt="Apple" 
                  className="w-5 h-5 mr-2 transition-all duration-300 dark:brightness-0 dark:invert"
                />
                Apple
              </Button>
            </div>
          </CardContent>
        </Card>
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
    testimonials_count: 1,
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
                    Update website counter statistics and manage testimonials
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
                          <Label htmlFor="projects">Projects Completed (Auto-synced)</Label>
                          <Input
                            id="projects"
                            type="number"
                            value={stats.projects_completed}
                            disabled
                            className="bg-gray-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Synced with portfolio page (13 projects displayed)
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="testimonials">Testimonials (Auto-synced)</Label>
                          <Input
                            id="testimonials"
                            type="number"
                            value={stats.testimonials_count}
                            disabled
                            className="bg-gray-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Synced with testimonials shown on home page
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="team">Team Members (Auto-synced)</Label>
                          <Input
                            id="team"
                            type="number"
                            value={stats.team_members}
                            disabled
                            className="bg-gray-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Synced with team members shown on about page (6 members)
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="support">Support Available (Manual)</Label>
                          <Input
                            id="support"
                            value={stats.support_available}
                            onChange={(e) => handleStatsChange('support_available', e.target.value)}
                            placeholder="e.g., 24/7, Mon-Fri"
                            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Only manually editable field
                          </p>
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
                            Update Support Hours
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Testimonial Management Section */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                      Testimonial Management
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Manage testimonials displayed on the homepage. New testimonials require approval.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="border border-slate-200 dark:border-slate-700">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Current Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Active Testimonials:</span>
                            <span className="font-semibold text-slate-900 dark:text-white">{stats.testimonials_count}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Pending Approval:</span>
                            <span className="font-semibold text-amber-600">0</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border border-slate-200 dark:border-slate-700">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full justify-start text-sm"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Testimonial
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full justify-start text-sm"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Review Pending
                          </Button>
                        </CardContent>
                      </Card>
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

// Footer Component
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-purple-500 rounded-full mr-3 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" className="text-white">
                  <path fill="currentColor" d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
                </svg>
              </div>
              <span className="text-xl font-bold gradient-text">Eternals Studio</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              Professional graphic design, web development, and creative solutions for your business needs.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com/eternals_studiogg" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-teal-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://discord.gg/Rv8ZXK6ssz" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-teal-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                </svg>
              </a>
              <a href="https://x.com/EternalsVisual" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-teal-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-slate-900 dark:text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><Link to="/services" className="text-slate-600 dark:text-slate-400 hover:text-teal-500 transition-colors text-sm">Graphic Design</Link></li>
              <li><Link to="/services" className="text-slate-600 dark:text-slate-400 hover:text-teal-500 transition-colors text-sm">Web Development</Link></li>
              <li><Link to="/services" className="text-slate-600 dark:text-slate-400 hover:text-teal-500 transition-colors text-sm">Motion Graphics</Link></li>
              <li><Link to="/services" className="text-slate-600 dark:text-slate-400 hover:text-teal-500 transition-colors text-sm">Branding</Link></li>
              <li><Link to="/services" className="text-slate-600 dark:text-slate-400 hover:text-teal-500 transition-colors text-sm">3D Modeling</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-slate-900 dark:text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-slate-600 dark:text-slate-400 hover:text-teal-500 transition-colors text-sm">About Us</Link></li>
              <li><Link to="/portfolio" className="text-slate-600 dark:text-slate-400 hover:text-teal-500 transition-colors text-sm">Portfolio</Link></li>
              <li><Link to="/store" className="text-slate-600 dark:text-slate-400 hover:text-teal-500 transition-colors text-sm">Store</Link></li>
              <li><Link to="/contact" className="text-slate-600 dark:text-slate-400 hover:text-teal-500 transition-colors text-sm">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-slate-900 dark:text-white font-semibold mb-4">Contact</h3>
            <div className="space-y-2">
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                <Mail className="w-4 h-4 inline mr-2" />
                Eternalsanctuarygg@gmail.com
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                <Phone className="w-4 h-4 inline mr-2" />
                (240) 523-3976
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                <Clock className="w-4 h-4 inline mr-2" />
                24/7 Support Available
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            © {currentYear} Eternals Studio. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-teal-500 transition-colors text-sm">Privacy Policy</a>
            <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-teal-500 transition-colors text-sm">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
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
            <Footer />
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;