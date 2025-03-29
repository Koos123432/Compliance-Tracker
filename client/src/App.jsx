import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import CreateInspection from "@/pages/CreateInspection";
import InspectionDetails from "@/pages/InspectionDetails";
import PersonList from "@/pages/PersonList";
import DocumentBreach from "@/pages/DocumentBreach";
import Schedule from "@/pages/Schedule";
import Reports from "@/pages/Reports";
import Investigations from "@/pages/Investigations";
import InvestigationDetails from "@/pages/InvestigationDetails";
import Organization from "@/pages/Organization";
import Dispatch from "@/pages/Dispatch";
import { WebSocketProvider } from "./context/WebSocketContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/inspections/new" component={CreateInspection} />
      <Route path="/inspections/:id" component={InspectionDetails} />
      <Route path="/inspections/:id/people" component={PersonList} />
      <Route path="/inspections/:id/breaches/new" component={DocumentBreach} />
      <Route path="/inspections/:id/breaches/:breachId" component={DocumentBreach} />
      <Route path="/schedule" component={Schedule} />
      <Route path="/reports" component={Reports} />
      <Route path="/investigations" component={Investigations} />
      <Route path="/investigations/:id" component={InvestigationDetails} />
      <Route path="/organization" component={Organization} />
      <Route path="/dispatch" component={Dispatch} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider>
        <Router />
        <Toaster />
      </WebSocketProvider>
    </QueryClientProvider>
  );
}

export default App;
