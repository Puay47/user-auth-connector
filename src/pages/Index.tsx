import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Welcome to Dashboard</h1>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-lg text-gray-600">
            You are successfully logged in! This is your protected dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;