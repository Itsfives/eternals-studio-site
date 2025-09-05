import React from 'react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Star, CheckCircle } from 'lucide-react';

const TestimonialSection = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-8">
        <CardContent className="space-y-6">
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
            I had such a wonderful time working with Fives when it came to making my graphics, at no point did I feel rushed or hurried into giving design ideas and he even gave some of his own input allowing for a high quality design in the long run! I am super happy with how my logo's came out as well as the price for what I received them at! If your looking for fantastic graphics and having seen the entire teams portfolio I can happily tell you all that these individuals here who create Graphics are arguably the best at what they do here!
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
  );
};

export default TestimonialSection;