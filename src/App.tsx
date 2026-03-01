import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Tours from "./pages/Tours";
import TourDetail from "./pages/TourDetail";
import Cities from "./pages/Cities";
import MyBookings from "./pages/MyBookings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminTours from "./pages/admin/AdminTours";
import AdminCities from "./pages/admin/AdminCities";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminTransfers from "./pages/admin/AdminTransfers";
import AdminTrainRoutes from "./pages/admin/AdminTrainRoutes";
import Transfers from "./pages/Transfers";
import TrainTickets from "./pages/TrainTickets";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/tours" element={<Tours />} />
            <Route path="/tours/:slug" element={<TourDetail />} />
            <Route path="/cities" element={<Cities />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/transfers" element={<Transfers />} />
            <Route path="/train-tickets" element={<TrainTickets />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminTours />} />
              <Route path="cities" element={<AdminCities />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="transfers" element={<AdminTransfers />} />
              <Route path="train-routes" element={<AdminTrainRoutes />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
