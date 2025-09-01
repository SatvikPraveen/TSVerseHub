// File: src/pages/About.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Github, 
  Twitter, 
  Linkedin,
  Heart,
  Code2,
  BookOpen,
  Users,
  Target,
  Lightbulb,
  Rocket,
  Star,
  Coffee,
  Mail,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  avatar: string;
  social: {
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
}

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Alex Chen',
    role: 'Lead Developer & Creator',
    bio: 'Full-stack developer with 8+ years of experience in TypeScript. Passionate about education and developer tools.',
    avatar: '/images/icons/typescript.png',
    social: {
      github: 'https://github.com/alexchen',
      twitter: 'https://twitter.com/alexchen',
      linkedin: 'https://linkedin.com/in/alexchen'
    }
  },
  {
    name: 'Sarah Rodriguez',
    role: 'Content & Curriculum Design',
    bio: 'Technical writer and educator specializing in making complex programming concepts accessible to everyone.',
    avatar: '/images/icons/playground.png',
    social: {
      github: 'https://github.com/sarah-r',
      linkedin: 'https://linkedin.com/in/sarah-rodriguez'
    }
  },
  {
    name: 'David Kim',
    role: 'UI/UX Designer',
    bio: 'Designer focused on creating intuitive and beautiful learning experiences for developers.',
    avatar: '/images/icons/dashboard.png',
    social: {
      twitter: 'https://twitter.com/davidkim',
      linkedin: 'https://linkedin.com/in/davidkim'
    }
  }
];

const features: Feature[] = [
  {
    icon: BookOpen,
    title: 'Comprehensive Learning',
    description: 'From basics to advanced concepts, we cover everything you need to master TypeScript.'
  },
  {
    icon: Code2,
    title: 'Hands-on Practice',
    description: 'Real-world projects and interactive examples to reinforce your learning.'
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Built by developers, for developers, with continuous community feedback.'
  },
  {
    icon: Target,
    title: 'Goal Oriented',
    description: 'Structured learning paths that help you achieve specific TypeScript skills.'
  }
];

const stats = [
  { label: 'Active Learners', value: '10,000+', icon: Users },
  { label: 'Concepts Covered', value: '50+', icon: BookOpen },
  { label: 'GitHub Stars', value: '1,234', icon: Star },
  { label: 'Countries Reached', value: '80+', icon: Target }
];

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-blue-900/20 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-8">
            <img
              src="/images/logo.png"
              alt="TSVerseHub"
              className="h-20 w-20 rounded-2xl shadow-lg"
            />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            About{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              TSVerseHub
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            TSVerseHub is a comprehensive, interactive platform designed to help developers 
            master TypeScript from the ground up. We believe learning should be engaging, 
            practical, and accessible to everyone.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button size="lg" asChild>
              <Link to="/concepts">
                <BookOpen className="w-5 h-5 mr-2" />
                Start Learning
              </Link>
            </Button>
            
            <Button variant="outline" size="lg" asChild>
              <a href="https://github.com/your-repo/tsversehub" target="_blank" rel="noopener noreferrer">
                <Github className="w-5 h-5 mr-2" />
                View Source
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                Our Mission
              </h2>
              <div className="space-y-4 text-slate-600 dark:text-slate-400">
                <p>
                  We created TSVerseHub because we believe TypeScript education should be 
                  more than just reading documentation. It should be interactive, engaging, 
                  and connected to real-world applications.
                </p>
                <p>
                  Our goal is to democratize TypeScript education by providing a platform 
                  where developers of all skill levels can learn, practice, and master 
                  TypeScript through hands-on experience.
                </p>
                <p>
                  We're committed to keeping TSVerseHub free, open-source, and constantly 
                  evolving based on community feedback and the latest TypeScript developments.
                </p>
              </div>
              
              <div className="mt-8 flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span>Made with love</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                  <Coffee className="w-5 h-5 text-amber-600" />
                  <span>Fueled by coffee</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                  <Code2 className="w-5 h-5 text-blue-600" />
                  <span>Built with TypeScript</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img
                src="/images/banners/advanced-banner.png"
                alt="TypeScript Learning"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              What Makes Us Different
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We've built TSVerseHub with a focus on practical learning and real-world application.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300" padding="lg">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Growing Community
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Join thousands of developers who are mastering TypeScript with TSVerseHub
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Meet the Team
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              The passionate individuals behind TSVerseHub
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300">
                <div className="relative">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white dark:border-slate-800 shadow-lg"
                  />
                </div>
                
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  {member.name}
                </h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                  {member.bio}
                </p>
                
                <div className="flex items-center justify-center space-x-3">
                  {member.social.github && (
                    <a
                      href={member.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {member.social.twitter && (
                    <a
                      href={member.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {member.social.linkedin && (
                    <a
                      href={member.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Open Source Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Github className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Open Source & Community
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              TSVerseHub is completely open source. We believe in transparent development 
              and community collaboration. Fork it, contribute to it, make it your own!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <Card className="p-6">
              <Lightbulb className="w-8 h-8 text-amber-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Contribute Ideas
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Have suggestions for new features or improvements? We'd love to hear from you!
              </p>
            </Card>
            
            <Card className="p-6">
              <Code2 className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Write Code
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Help us build new features, fix bugs, or improve the codebase. Every contribution matters!
              </p>
            </Card>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button size="lg" asChild>
              <a href="https://github.com/your-repo/tsversehub" target="_blank" rel="noopener noreferrer">
                <Github className="w-5 h-5 mr-2" />
                View on GitHub
              </a>
            </Button>
            
            <Button variant="outline" size="lg" asChild>
              <a href="mailto:hello@tsversehub.dev">
                <Mail className="w-5 h-5 mr-2" />
                Contact Us
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Rocket className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your TypeScript Journey?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Join thousands of developers who are building better applications with TypeScript.
          </p>
          
          <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-slate-50" asChild>
            <Link to="/dashboard">
              <Target className="w-5 h-5 mr-2" />
              Get Started Now
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default About;