import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}

interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}

interface CardDescriptionProps {
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}

function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`bg-green-400 rounded-3xl shadow-lg overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className = '', children, ...props }: CardHeaderProps) {
  return (
    <div
      className={`p-6 pb-0 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function CardTitle({ className = '', children, ...props }: CardTitleProps) {
  return (
    <h2
      className={`text-white font-bold text-4xl tracking-wide mb-2 uppercase ${className}`}
      {...props}
    >
      {children}
    </h2>
  );
}

function CardDescription({ className = '', children, ...props }: CardDescriptionProps) {
  return (
    <div
      className={`text-white font-medium text-sm space-y-1 uppercase ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function CardContent({ className = '', children, ...props }: CardContentProps) {
  return (
    <div
      className={`p-6 pt-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function CardFooter({ className = '', children, ...props }: CardFooterProps) {
  return (
    <div
      className={`p-6 pt-0 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };