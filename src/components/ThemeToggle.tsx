
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeProvider";
import { useToast } from "@/hooks/use-toast";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    toast({
      title: newTheme === "dark" ? "Modo oscuro" : "Modo claro",
      description: ""
    });
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={toggleTheme} 
      aria-label={theme === "dark" ? "Modo oscuro" : "Modo claro"}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}
