// File: src/components/common/Footer.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  Heart, 
  Code2,
  BookOpen,
  ExternalLink,
  Rss
} from 'lucide-react';

interface FooterLink {
  name: string;
  path: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const footerSections: FooterSection[] = [
  {
    title: 'Learning',
    links: [
      { name: 'TypeScript Basics', path: '/concepts/basics' },
      { name: 'Advanced Types', path: '/concepts/advanced-types' },
      { name: 'Generics', path: '/concepts/generics' },
      { name: 'Decorators', path: '/concepts/decorators' },
      { name: 'Mini Projects', path: '/mini-projects' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { name: 'Playground', path: '/playground' },
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Compiler API', path: '/concepts/compiler-api' },
      { name: 'Type Explorer', path: '/tools/type-explorer' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'Documentation', path: 'https://www.typescriptlang.org/docs/', external: true },
      { name: 'TypeScript Handbook', path: 'https://www.typescriptlang.org/docs/handbook/', external: true },
      { name: 'Release Notes', path: 'https://www.typescriptlang.org/docs/handbook/release-notes/', external: true },
      { name: 'Community', path: 'https://github.com/microsoft/TypeScript/discussions', external: true },
    ],
  },
  {
    title: 'About',
    links: [
      { name: 'About TSVerseHub', path: '/about' },
      { name: 'Contributing', path: '/contributing' },
      { name: 'Changelog', path: '/changelog' },
      { name: 'Privacy Policy', path: '/privacy' },
    ],
  },
];

const socialLinks = [
  { 
    name: 'GitHub', 
    href: 'https://github.com/your-repo/tsversehub', 
    icon: Github,
    color: 'hover:text-gray-900 dark:hover:text-gray-100'
  },
  { 
    name: 'Twitter', 
    href: 'https://twitter.com/tsversehub', 
    icon: Twitter,
    color: 'hover:text-blue-500'
  },
  { 
    name: 'LinkedIn', 
    href: 'https://linkedin.com/company/tsversehub', 
    icon: Linkedin,
    color: 'hover:text-blue-600'
  },
  { 
    name: 'RSS Feed', 
    href: '/rss.xml', 
    icon: Rss,
    color: 'hover:text-orange-500'
  },
  { 
    name: 'Contact', 
    href: 'mailto:hello@tsversehub.dev', 
    icon: Mail,
    color: 'hover:text-green-600'
  },
];

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img
                src="/images/logo.png"
                alt="TSVerseHub"
                className="h-10 w-10 rounded-lg"
              />
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TSVerseHub
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Master TypeScript
                </p>
              </div>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">
              A comprehensive, interactive platform for learning TypeScript from basics to advanced concepts. 
              Built with ❤️ for developers who want to level up their TypeScript skills.
            </p>
            
            {/* Newsletter Signup */}
            <div className="max-w-sm">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Stay Updated
              </h4>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  Subscribe
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Get notified about new TypeScript features and tutorials.
              </p>
            </div>
          </div>

          {/* Links Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.external ? (
                      <a
                        href={link.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors flex items-center space-x-1"
                      >
                        <span>{link.name}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <Link
                        to={link.path}
                        className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 border-t border-blue-200/50 dark:border-blue-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <img
                src="/images/banners/advanced-banner.png"
                alt="TypeScript Advanced"
                className="h-16 w-24 object-cover rounded-lg"
              />
              <div>
                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Ready for Advanced TypeScript?
                </h4>
                <p className="text-slate-600 dark:text-slate-400">
                  Dive deep into conditional types, template literals, and more!
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/concepts/advanced-types"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
              >
                <BookOpen className="h-4 w-4" />
                <span>Start Learning</span>
              </Link>
              <Link
                to="/playground"
                className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium flex items-center space-x-2"
              >
                <Code2 className="h-4 w-4" />
                <span>Try Playground</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
              <span>© {currentYear} TSVerseHub. Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>for the TypeScript community.</span>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target={social.href.startsWith('http') ? '_blank' : undefined}
                    rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className={`text-slate-500 dark:text-slate-400 transition-colors ${social.color}`}
                    title={social.name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
            <div className="text-xs text-slate-500 dark:text-slate-400 text-center md:text-left">
              <p>
                TypeScript is a trademark of Microsoft Corporation. 
                This project is not affiliated with or endorsed by Microsoft.
              </p>
              <p className="mt-1">
                All code examples are provided under the MIT license. 
                Educational content is freely available for learning purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};