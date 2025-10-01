import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="mb-4 text-4xl font-bold">Welcome to Your App</h1>
        <p className="text-xl text-muted-foreground">Start building your amazing project here!</p>
        <Link to="/auth">
          <Button size="lg">Get Started</Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
