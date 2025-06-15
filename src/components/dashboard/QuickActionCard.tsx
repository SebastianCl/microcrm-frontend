
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ title, description, icon, href }) => {
  return (
    <Link to={href} className="group block">
      <Card className="hover:border-primary transition-colors h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
        <div className="p-4 pt-0 flex justify-end">
          <div className="flex items-center text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Ir ahora <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default QuickActionCard;
