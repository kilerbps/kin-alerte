import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AdminRoute, BourgmestreRoute, ProtectedRoute } from "@/components/ProtectedRoute";
import Navigation from "@/components/Navigation";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ReportForm from "./pages/ReportForm";
import AdminDashboard from "./pages/AdminDashboard";
import BourgmestreDashboard from "./pages/BourgmestreDashboard";
import CitizenDashboard from "./pages/CitizenDashboard";
import APropos from "./pages/APropos";
import Stats from "./pages/Stats";
import NotFound from "./pages/NotFound";
import { SessionMonitor } from "@/components/SessionMonitor";
import { ConnectionStatus } from "@/components/ConnectionStatus";

const App = () => (
  <Router>
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/signaler" element={<ReportForm />} />
          <Route path="/apropos" element={<APropos />} />
          <Route path="/stats" element={<Stats />} />
          
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          
          <Route
            path="/bourgmestre"
            element={
              <BourgmestreRoute>
                <BourgmestreDashboard />
              </BourgmestreRoute>
            }
          />
          
          <Route
            path="/citizen"
            element={
              <ProtectedRoute requiredRole="citizen">
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      {/* Moniteur de session pour le debugging */}
      <SessionMonitor />
      <ConnectionStatus />
      
      <Toaster />
    </div>
  </Router>
);

export default App;
