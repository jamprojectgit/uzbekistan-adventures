import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { lazy, Suspense } from "react";

// Eagerly load the homepage for fastest FCP
import Index from "./pages/Index";

// Lazy-load all other routes to reduce initial bundle size
const Tours = lazy(() => import("./pages/Tours"));
const TourDetail = lazy(() => import("./pages/TourDetail"));
const Cities = lazy(() => import("./pages/Cities"));
const CityDetail = lazy(() => import("./pages/CityDetail"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminTours = lazy(() => import("./pages/admin/AdminTours"));
const AdminCities = lazy(() => import("./pages/admin/AdminCities"));
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings"));
const AdminTransfers = lazy(() => import("./pages/admin/AdminTransfers"));
const AdminTrainRoutes = lazy(() => import("./pages/admin/AdminTrainRoutes"));
const Transfers = lazy(() => import("./pages/Transfers"));
const TransferDetail = lazy(() => import("./pages/TransferDetail"));
const TrainTickets = lazy(() => import("./pages/TrainTickets"));
const TrainRouteDetail = lazy(() => import("./pages/TrainRouteDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/tours" element={<Tours />} />
              <Route path="/tours/:slug" element={<TourDetail />} />
              <Route path="/cities" element={<Cities />} />
              <Route path="/cities/:slug" element={<CityDetail />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/transfers" element={<Transfers />} />
              <Route path="/transfers/:routeSlug" element={<TransferDetail />} />
              <Route path="/train-tickets" element={<TrainTickets />} />
              <Route path="/train-tickets/:routeSlug" element={<TrainRouteDetail />} />
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
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
