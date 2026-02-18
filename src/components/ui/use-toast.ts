// Temporary toast hook until shadcn/ui toast is properly configured
// This uses browser's native alert/confirm for now

export const useToast = () => {
  return {
    toast: ({ title, description, variant }: { 
      title: string; 
      description?: string; 
      variant?: 'default' | 'destructive' 
    }) => {
      const message = description ? `${title}\n${description}` : title;
      if (variant === 'destructive') {
        alert(`❌ ${message}`);
      } else {
        alert(`✓ ${message}`);
      }
    },
  };
};
