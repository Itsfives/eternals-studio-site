import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
  Palette, 
  Users, 
  MessageSquare, 
  FileText, 
  Settings, 
  Home, 
  User, 
  LogOut,
  Upload,
  Download,
  CreditCard,
  Eye,
  Edit,
  Plus,
  Send,
  CheckCircle,
  Clock,
  Lock
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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

// Home Page Component
const HomePage = () => {
  const [content, setContent] = useState({});
  
  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`${API}/content`);
      const contentMap = {};
      response.data.forEach(section => {
        contentMap[section.section_name] = section.content;
      });
      setContent(contentMap);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-violet-50">
      {/* Floating Logo Elements */}
      <div className="fixed top-20 left-10 z-10">
        <InteractiveLogo size="w-6 h-6" className="opacity-20 floating-logo" />
      </div>
      <div className="fixed top-40 right-20 z-10">
        <InteractiveLogo size="w-4 h-4" className="opacity-15 floating-logo delay-1000" />
      </div>
      <div className="fixed bottom-32 left-1/4 z-10">
        <InteractiveLogo size="w-5 h-5" className="opacity-10 floating-logo delay-2000" />
      </div>

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-teal-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <InteractiveLogo size="w-10 h-10" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-violet-600 bg-clip-text text-transparent">
                Eternals Studio
              </h1>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#services" className="text-slate-700 hover:text-teal-600 transition-colors">Services</a>
              <a href="#portfolio" className="text-slate-700 hover:text-teal-600 transition-colors">Portfolio</a>
              <a href="#about" className="text-slate-700 hover:text-teal-600 transition-colors">About</a>
              <a href="#contact" className="text-slate-700 hover:text-teal-600 transition-colors">Contact</a>
              <Button className="bg-gradient-to-r from-teal-500 to-violet-500 hover:from-teal-600 hover:to-violet-600">
                Client Portal
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                  {content.hero?.title || 'Creative Design Solutions'}
                  <span className="block text-transparent bg-gradient-to-r from-teal-500 to-violet-500 bg-clip-text">
                    That Inspire
                  </span>
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  {content.hero?.subtitle || 'Transform your brand with our cutting-edge graphic design services. We create visual experiences that captivate and convert.'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-teal-500 to-violet-500 hover:from-teal-600 hover:to-violet-600 text-white px-8 py-3">
                  Start Your Project
                </Button>
                <Button size="lg" variant="outline" className="border-teal-300 text-teal-700 hover:bg-teal-50 px-8 py-3">
                  View Our Work
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10">
                <img 
                  src="https://images.unsplash.com/photo-1626785774573-4b799315345d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxncmFwaGljJTIwZGVzaWdufGVufDB8fHx8MTc1NzAwNTI5MHww&ixlib=rb-4.1.0&q=85"
                  alt="Professional Design Tools"
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute -top-4 -left-4 w-full h-full bg-gradient-to-r from-teal-400 to-violet-400 rounded-2xl opacity-20 z-0"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Services</h2>
            <p className="text-xl text-slate-600">Comprehensive design solutions for your business</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Palette className="w-12 h-12 text-teal-500" />,
                title: "Brand Identity",
                description: "Complete brand development including logos, color schemes, and brand guidelines."
              },
              {
                icon: <FileText className="w-12 h-12 text-violet-500" />,
                title: "Print Design",
                description: "Brochures, business cards, posters, and all your print marketing materials."
              },
              {
                icon: <Users className="w-12 h-12 text-teal-500" />,
                title: "Digital Marketing",
                description: "Social media graphics, web banners, and digital advertising materials."
              }
            ].map((service, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-teal-100 to-violet-100 rounded-full w-fit">
                    {service.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-center">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Preview */}
      <section id="portfolio" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Recent Work</h2>
            <p className="text-xl text-slate-600">A showcase of our creative excellence</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwzfHxncmFwaGljJTIwZGVzaWdufGVufDB8fHx8MTc1NzAwNTI5MHww&ixlib=rb-4.1.0&q=85",
              "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHw0fHxncmFwaGljJTIwZGVzaWdufGVufDB8fHx8MTc1NzAwNTI5MHww&ixlib=rb-4.1.0&q=85",
              "https://images.unsplash.com/photo-1502810190503-8303352d0dd1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwyfHxjcmVhdGl2ZSUyMHdvcmtzcGFjZXxlbnwwfHx8fDE3NTcwMDUyOTd8MA&ixlib=rb-4.1.0&q=85"
            ].map((image, index) => (
              <div key={index} className="group relative overflow-hidden rounded-xl">
                <img 
                  src={image} 
                  alt={`Portfolio item ${index + 1}`}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-white font-semibold">Project {index + 1}</h3>
                    <p className="text-white/80 text-sm">Brand Identity</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <InteractiveLogo size="w-8 h-8" className="mr-3" />
            <h3 className="text-2xl font-bold">Eternals Studio</h3>
          </div>
          <div className="text-center">
            <p className="text-slate-400 mb-4">Creating exceptional design experiences since 2020</p>
            <p className="text-slate-500">© 2024 Eternals Studio. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Login Component
const LoginPage = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-violet-50 flex items-center justify-center p-4">
      <div className="fixed top-10 left-10">
        <InteractiveLogo size="w-6 h-6" className="opacity-20 floating-logo" />
      </div>
      <div className="fixed bottom-20 right-10">
        <InteractiveLogo size="w-8 h-8" className="opacity-15 floating-logo delay-1000" />
      </div>

      <Card className="w-full max-w-md bg-white/80 backdrop-blur-md border-0 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <InteractiveLogo size="w-16 h-16" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-violet-600 bg-clip-text text-transparent">
            Eternals Studio
          </CardTitle>
          <CardDescription>
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                  />
                </div>
              </>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-teal-500 to-violet-500 hover:from-teal-600 hover:to-violet-600"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-teal-600 hover:text-teal-700"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Dashboard Component
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
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      review: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      locked: 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-violet-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <InteractiveLogo size="w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">Eternals Studio</h1>
                <p className="text-sm text-slate-600">Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-r from-teal-500 to-violet-500 text-white">
                    {user?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-slate-900">{user?.full_name}</p>
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
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-fit">
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
                <h2 className="text-2xl font-bold text-slate-900">Projects</h2>
                {user?.role !== 'client' && (
                  <Button className="bg-gradient-to-r from-teal-500 to-violet-500">
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                )}
              </div>
              <div className="grid gap-4">
                {projects.map((project) => (
                  <Card key={project.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{project.title}</CardTitle>
                          <CardDescription>{project.description}</CardDescription>
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
                        <div className="text-sm text-slate-600">
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
                              Files ({project.files.length})
                            </Button>
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
              <h2 className="text-2xl font-bold text-slate-900">Invoices</h2>
              <div className="grid gap-4">
                {invoices.map((invoice) => (
                  <Card key={invoice.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">${invoice.amount}</CardTitle>
                          <CardDescription>{invoice.description}</CardDescription>
                        </div>
                        <Badge className={getStatusBadge(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-slate-600">
                          Due: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'No due date'}
                        </div>
                        {invoice.status === 'pending' && user?.role === 'client' && (
                          <Button 
                            onClick={() => payInvoice(invoice.id)}
                            className="bg-gradient-to-r from-teal-500 to-violet-500"
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
              <h2 className="text-2xl font-bold text-slate-900">Messages</h2>
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
                <CardContent className="p-6">
                  <p className="text-slate-600 text-center">Select a project to view messages</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {user?.role !== 'client' && (
            <TabsContent value="content" className="mt-8">
              <div className="grid gap-6">
                <h2 className="text-2xl font-bold text-slate-900">Content Management</h2>
                <div className="grid gap-4">
                  {content.map((section) => (
                    <Card key={section.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg capitalize">
                            {section.section_name.replace('_', ' ')}
                          </CardTitle>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-600">
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
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

// Route Guards
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  return children;
};

export default App;