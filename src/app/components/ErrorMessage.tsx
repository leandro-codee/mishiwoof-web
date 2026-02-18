import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert';

interface ErrorMessageProps {
  message: string;
  title?: string;
  className?: string;
}

export const ErrorMessage = ({ 
  message, 
  title = 'Error', 
  className = '' 
}: ErrorMessageProps) => {
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};
