import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const FAQPage = () => {
  const faqs = [
    {
      question: "What services does Eternals Studio offer?",
      answer: "We offer a comprehensive range of creative services including web development, graphic design, 3D modeling, animation, music production, and video editing. Our team specializes in bringing your creative vision to life across multiple disciplines."
    },
    {
      question: "How long does a typical project take?",
      answer: "Project timelines vary depending on the scope and complexity. Simple designs may take 1-3 days, while complex web applications or extensive branding projects can take several weeks. We'll provide a detailed timeline during our initial consultation."
    },
    {
      question: "What is your pricing structure?",
      answer: "Our pricing is project-based and depends on the specific requirements, timeline, and complexity of your project. We offer competitive rates and provide detailed quotes after understanding your needs. Contact us for a personalized estimate."
    },
    {
      question: "Do you work with clients internationally?",
      answer: "Yes! We work with clients worldwide. Our team is experienced in remote collaboration and we use modern communication tools to ensure smooth project delivery regardless of location."
    },
    {
      question: "Can you help with ongoing maintenance and updates?",
      answer: "Absolutely! We offer ongoing support and maintenance services for websites, applications, and other digital assets. We can discuss maintenance packages that fit your needs and budget."
    },
    {
      question: "What makes Eternals Studio different?",
      answer: "Our multidisciplinary approach sets us apart. We combine technical expertise with creative vision, offering everything from coding to music production under one roof. This allows for seamless integration across all aspects of your project."
    },
    {
      question: "How do I get started with a project?",
      answer: "Getting started is easy! Simply contact us through our contact form, email, or social media. We'll schedule a consultation to discuss your project requirements, timeline, and budget. From there, we'll provide a detailed proposal and project plan."
    },
    {
      question: "Do you provide revisions?",
      answer: "Yes, we include a reasonable number of revisions in our project quotes. We want to ensure you're completely satisfied with the final result. Additional revisions beyond the agreed scope may incur additional charges."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Find answers to common questions about our services, process, and how we can help bring your creative vision to life.
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <Card key={index} className="border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                  {faq.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {faq.answer}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="border-0 shadow-xl bg-gradient-to-r from-teal-500/10 to-purple-500/10 dark:from-teal-500/20 dark:to-purple-500/20 backdrop-blur-sm">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Still have questions?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Can't find the answer you're looking for? We're here to help! Reach out to us directly.
              </p>
              <a 
                href="/contact" 
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg"
              >
                Contact Us
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;