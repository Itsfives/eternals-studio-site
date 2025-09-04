import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
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
  Palette, Users, MessageSquare, FileText, Settings, Home, User, LogOut, Upload, Download, CreditCard, Eye, Edit, Plus, Send, CheckCircle, Clock, Lock, ShoppingCart, Moon, Sun, Code, Box, Video, Music, Star, Quote, ArrowRight, Play, Mail, Phone, MapPin, Menu, X
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

// Floating Elements Component
const FloatingElements = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [logos, setLogos] = useState([
    { id: 1, x: 100, y: 200, size: 'w-6 h-6', opacity: 0.3, delay: 0 },
    { id: 2, x: 300, y: 150, size: 'w-4 h-4', opacity: 0.2, delay: 0.5 },
    { id: 3, x: 500, y: 300, size: 'w-5 h-5', opacity: 0.4, delay: 1 },
    { id: 4, x: 800, y: 180, size: 'w-3 h-3', opacity: 0.25, delay: 1.5 },
    { id: 5, x: 1200, y: 250, size: 'w-7 h-7', opacity: 0.35, delay: 2 },
    { id: 6, x: 200, y: 400, size: 'w-4 h-4', opacity: 0.3, delay: 2.5 },
    { id: 7, x: 900, y: 350, size: 'w-5 h-5', opacity: 0.2, delay: 3 },
    { id: 8, x: 600, y: 450, size: 'w-6 h-6', opacity: 0.4, delay: 3.5 }
  ]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const updateLogos = () => {
      setLogos(prevLogos => 
        prevLogos.map(logo => {
          const distance = Math.sqrt(
            Math.pow(mousePosition.x - logo.x, 2) + Math.pow(mousePosition.y - logo.y, 2)
          );
          
          if (distance < 150) {
            const angle = Math.atan2(mousePosition.y - logo.y, mousePosition.x - logo.x);
            const repelForce = Math.max(0, 150 - distance) * 0.3;
            
            return {
              ...logo,
              x: logo.x - Math.cos(angle) * repelForce,
              y: logo.y - Math.sin(angle) * repelForce,
              opacity: Math.min(0.8, logo.opacity + 0.2)
            };
          } else {
            // Gentle drift back towards original position or random movement
            const driftX = (Math.random() - 0.5) * 0.5;
            const driftY = (Math.random() - 0.5) * 0.5;
            
            return {
              ...logo,
              x: Math.max(50, Math.min(window.innerWidth - 50, logo.x + driftX)),
              y: Math.max(50, Math.min(window.innerHeight - 50, logo.y + driftY)),
              opacity: Math.max(0.15, logo.opacity - 0.01)
            };
          }
        })
      );
    };

    const interval = setInterval(updateLogos, 50);
    return () => clearInterval(interval);
  }, [mousePosition]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {logos.map(logo => (
        <div
          key={logo.id}
          className={`absolute transition-all duration-75 ease-out ${logo.size}`}
          style={{
            left: `${logo.x}px`,
            top: `${logo.y}px`,
            opacity: logo.opacity,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <img 
            src="https://customer-assets.emergentagent.com/job_33bbef14-ff4b-4136-9e36-664559466616/artifacts/4dkvnitj_Eternals%20Studio.png"
            alt="Eternals Studio"
            className="w-full h-full object-contain animate-pulse hover:animate-bounce"
            style={{
              filter: 'brightness(1.2) contrast(1.1)',
              animationDelay: `${logo.delay}s`
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
          {/* Add detailed services content here */}
        </div>
      </div>
    </div>
  );
};

// Portfolio Page Component
const PortfolioPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300 relative">
      <FloatingElements />
      <div className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Our <span className="gradient-text">Portfolio</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-12">
            Showcasing our creative excellence and client success stories
          </p>
          {/* Add portfolio gallery here */}
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
          {/* Add store products here */}
        </div>
      </div>
    </div>
  );
};

// About Page Component
const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300 relative">
      <FloatingElements />
      <div className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            About <span className="gradient-text">Eternals Studio</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-3xl mx-auto">
            Learn more about our journey, values, and the team behind the creative magic
          </p>
          {/* Add about content here */}
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
    // Handle form submission
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
            {/* Contact Form */}
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

            {/* Contact Information */}
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

              <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-full">
                      <Phone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">Call Us</h3>
                      <p className="text-slate-600 dark:text-slate-400">+1 (555) 123-4567</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-teal-100 to-purple-200 dark:from-teal-900/30 dark:to-purple-800/30 rounded-full">
                      <MapPin className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">Visit Us</h3>
                      <p className="text-slate-600 dark:text-slate-400">123 Creative Street<br />Design City, DC 12345</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center p-6 bg-gradient-to-r from-teal-500/10 to-purple-500/10 dark:from-teal-500/20 dark:to-purple-500/20 rounded-2xl border border-teal-200/50 dark:border-teal-700/50">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  24/7 Support Available
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  We're here to help you bring your vision to life, anytime you need us.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Auth Page Component with Social Login
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

  const handleSocialLogin = (provider) => {
    toast({
      title: "Coming Soon",
      description: `${provider} login will be available soon!`,
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300 relative flex items-center justify-center p-4">
      <FloatingElements />
      
      <div className="w-full max-w-md relative z-10">
        {/* Back to Home Link */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Back to Home
          </Link>
        </div>

        <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <InteractiveLogo size="w-16 h-16" />
            </div>
            <CardTitle className="text-2xl font-bold gradient-text">
              Welcome to Eternals Studio
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Tab Switcher */}
            <div className="flex mb-6 bg-slate-100 dark:bg-slate-700/50 rounded-lg p-1">
              <Button
                variant={isLogin ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setIsLogin(true)}
                className={`flex-1 ${isLogin ? 'bg-white dark:bg-slate-800 shadow-sm' : ''}`}
              >
                Sign In
              </Button>
              <Button
                variant={!isLogin ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setIsLogin(false)}
                className={`flex-1 ${!isLogin ? 'bg-white dark:bg-slate-800 shadow-sm' : ''}`}
              >
                Sign Up
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  className="bg-white/50 dark:bg-slate-700/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  className="bg-white/50 dark:bg-slate-700/50"
                />
              </div>

              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      placeholder="Enter your full name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      required
                      className="bg-white/50 dark:bg-slate-700/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company (Optional)</Label>
                    <Input
                      id="company"
                      placeholder="Enter your company name"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      className="bg-white/50 dark:bg-slate-700/50"
                    />
                  </div>
                </>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            {/* Social Login */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    OR CONTINUE WITH
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleSocialLogin('Google')}
                  className="bg-white/50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-700"
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
                  variant="outline"
                  onClick={() => handleSocialLogin('Discord')}
                  className="bg-white/50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-700"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.196.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  Discord
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={() => handleSocialLogin('Apple')}
                className="w-full mt-3 bg-white/50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-700"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Continue with Apple
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Dashboard Component (keeping existing functionality)
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [content, setContent] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
    fetchInvoices();
    if (user?.role !== 'client') {
      fetchContent();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API}/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`${API}/invoices`);
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const fetchContent = async () => {
    try {
      const response = await axios.get(`${API}/content`);
      setContent(response.data);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const payInvoice = async (invoiceId) => {
    try {
      await axios.put(`${API}/invoices/${invoiceId}/pay`);
      toast({
        title: "Success",
        description: "Invoice paid successfully!",
      });
      fetchInvoices();
      fetchProjects();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to pay invoice",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      review: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      locked: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300 relative">
      <FloatingElements />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <InteractiveLogo size="w-12 h-12" />
              <div>
                <h1 className="text-2xl font-bold gradient-text">Dashboard</h1>
                <p className="text-slate-600 dark:text-slate-400">Welcome back, {user?.full_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-r from-teal-500 to-purple-500 text-white">
                    {user?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.full_name}</p>
                  <Badge variant="secondary" className="text-xs">
                    {user?.role}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-fit bg-white/50 dark:bg-slate-800/50">
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Invoices
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Messages
            </TabsTrigger>
            {user?.role !== 'client' && (
              <TabsTrigger value="content" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Content
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="projects" className="mt-8">
            <div className="grid gap-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Projects</h2>
                {user?.role !== 'client' && (
                  <Button className="bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600">
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                )}
              </div>
              <div className="grid gap-4">
                {projects.map((project) => (
                  <Card key={project.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg text-slate-900 dark:text-white">{project.title}</CardTitle>
                          <CardDescription className="text-slate-600 dark:text-slate-400">{project.description}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusBadge(project.status)}>
                            {project.is_locked && <Lock className="w-3 h-3 mr-1" />}
                            {project.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Created: {new Date(project.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          {project.files.length > 0 && (
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-1" />
                              Files ({project.files.length})                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="invoices" className="mt-8">
            <div className="grid gap-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Invoices</h2>
              <div className="grid gap-4">
                {invoices.map((invoice) => (
                  <Card key={invoice.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg text-slate-900 dark:text-white">${invoice.amount}</CardTitle>
                          <CardDescription className="text-slate-600 dark:text-slate-400">{invoice.description}</CardDescription>
                        </div>
                        <Badge className={getStatusBadge(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Due: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'No due date'}
                        </div>
                        {invoice.status === 'pending' && user?.role === 'client' && (
                          <Button 
                            onClick={() => payInvoice(invoice.id)}
                            className="bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600"
                          >
                            <CreditCard className="w-4 h-4 mr-1" />
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="messages" className="mt-8">
            <div className="grid gap-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Messages</h2>
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-md">
                <CardContent className="p-6">
                  <p className="text-slate-600 dark:text-slate-400 text-center">Select a project to view messages</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {user?.role !== 'client' && (
            <TabsContent value="content" className="mt-8">
              <div className="grid gap-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Content Management</h2>
                <div className="grid gap-4">
                  {content.map((section) => (
                    <Card key={section.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg capitalize text-slate-900 dark:text-white">
                            {section.section_name.replace('_', ' ')}
                          </CardTitle>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Last updated: {new Date(section.updated_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App min-h-screen">
            <Routes>
              <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
              <Route path="/services" element={<PublicLayout><ServicesPage /></PublicLayout>} />
              <Route path="/portfolio" element={<PublicLayout><PortfolioPage /></PublicLayout>} />
              <Route path="/store" element={<PublicLayout><StorePage /></PublicLayout>} />
              <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
              <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/login" element={<Navigate to="/auth" replace />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Layout wrapper for public pages
const PublicLayout = ({ children }) => {
  return (
    <>
      <Navigation />
      {children}
    </>
  );
};

// Route Guards
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

export default App;