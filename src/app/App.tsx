import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@providers/ThemeProvider';
import { QueryProvider } from '@providers/QueryProvider';
import { router } from '@app/routes';
import { Toaster } from "@/components/ui/sonner"

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="mishiwoof-theme">
      <QueryProvider>
        <RouterProvider router={router} />
        <Toaster />
      </QueryProvider>
    </ThemeProvider>
  );
}

export default App;
