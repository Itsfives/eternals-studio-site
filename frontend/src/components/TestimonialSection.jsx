import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Star, X, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const TestimonialSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    rating: 5,
    content: ''
  });

  // Default testimonial (current one from website)
  const defaultTestimonial = {
    id: 'default-1',
    client_name: 'Tronus',
    client_role: 'Client',
    client_avatar: 'https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=48,h=48,fit=crop/YNqO7k0WyEUyB3w6/dg_avi-m5Kw9r0g6WUEeL1E.jpg',
    rating: 5,
    title: '10/10 service.',
    content: 'I had such a wonderful time working with Fives when it came to making my graphics, at no point did I feel rushed or hurried into giving design ideas and he even gave some of his own input allowing for a high quality design in the long run! I am super happy with how my logo\'s came out as well as the price for what I received them at! If your looking for fantastic graphics and having seen the entire teams portfolio I can happily tell you all that these individuals here who create Graphics are arguably the best at what they do here!',
    highlights: [
      'Efficient Communication: Capable of getting what you want done to the finest point!',
      'Design Quality is perfect and what you\'d be looking for!',
      'Great at giving feedback compared to individuals I have worked with before',
      'Reasonable prices for the amount you get! Bang for your buck!'
    ],
    is_featured: true,
    approved: true
  };

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/testimonials`);
        if (response.ok) {
          const data = await response.json();
          // Always include the default testimonial plus any from API
          setTestimonials([defaultTestimonial, ...data]);
        } else {
          // If API fails, just use default testimonial
          setTestimonials([defaultTestimonial]);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        // Fallback to default testimonial
        setTestimonials([defaultTestimonial]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleSubmitTestimonial = async (e) => {
    e.preventDefault();
    
    try {
      // Create the testimonial data
      const testimonialData = {
        ...formData,
        approved: false, // Default to not approved for admin review
        created_at: new Date().toISOString()
      };

      // Get the backend URL from environment
      const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
      
      const response = await fetch(`${backendUrl}/api/testimonials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testimonialData),
      });

      if (response.ok) {
        // Reset form and close modal
        setFormData({ name: '', company: '', rating: 5, content: '' });
        setShowModal(false);
        alert('Thank you! Your testimonial has been submitted and is awaiting approval.');
      } else {
        throw new Error('Failed to submit testimonial');
      }
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      alert('Sorry, there was an error submitting your testimonial. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-8">
          <CardContent className="space-y-6">
            <div className="animate-pulse">
              <div className="flex justify-center items-center space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div key={star} className="w-6 h-6 bg-slate-300 dark:bg-slate-600 rounded"></div>
                ))}
              </div>
              <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded mb-4 w-48 mx-auto"></div>
              <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentTestimonialData = testimonials[currentTestimonial];

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-8 relative">
        {/* Navigation Arrows */}
        {testimonials.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 p-0 bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600 z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 p-0 bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600 z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>
        )}

        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`w-6 h-6 ${star <= currentTestimonialData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} 
                />
              ))}
            </div>
            <h3 className="text-2xl font-bold gradient-text mb-4">{currentTestimonialData.title}</h3>
          </div>

          {/* Highlights */}
          {currentTestimonialData.highlights && currentTestimonialData.highlights.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="space-y-3">
                {currentTestimonialData.highlights.slice(0, Math.ceil(currentTestimonialData.highlights.length / 2)).map((highlight, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                    <p className="text-slate-700 dark:text-slate-300">
                      <strong>{highlight.split(':')[0]}:</strong> {highlight.split(':').slice(1).join(':')}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {currentTestimonialData.highlights.slice(Math.ceil(currentTestimonialData.highlights.length / 2)).map((highlight, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                    <p className="text-slate-700 dark:text-slate-300">
                      <strong>{highlight.split(':')[0]}:</strong> {highlight.split(':').slice(1).join(':')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main testimonial content */}
          <blockquote className="text-slate-600 dark:text-slate-400 italic leading-relaxed border-l-4 border-teal-500 pl-6 my-6">
            {currentTestimonialData.content}
          </blockquote>

          {/* Client info */}
          <div className="flex items-center justify-center space-x-4 pt-6 border-t border-slate-200 dark:border-slate-700">
            <Avatar className="w-12 h-12">
              <AvatarImage src={currentTestimonialData.client_avatar} alt={currentTestimonialData.client_name} />
              <AvatarFallback className="bg-gradient-to-r from-teal-500 to-purple-500 text-white font-semibold">
                {currentTestimonialData.client_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <div className="font-semibold text-slate-900 dark:text-white">{currentTestimonialData.client_name}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{currentTestimonialData.client_role}</div>
            </div>
          </div>

          {/* Pagination dots */}
          {testimonials.length > 1 && (
            <div className="flex justify-center space-x-2 pt-4">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    index === currentTestimonial 
                      ? 'bg-gradient-to-r from-teal-500 to-purple-500' 
                      : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Testimonial CTA */}
      <div className="text-center mt-8">
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Have you worked with us? Share your experience!
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowModal(true)}
          className="border-teal-500 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Your Testimonial
        </Button>
      </div>
    </div>
  );
};

export default TestimonialSection;