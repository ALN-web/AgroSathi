import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const services = [
  {
    title: "AI Crop Prediction",
    desc: "AI analyzes soil, weather, and environment factors to predict the best crops for higher yield and profitability.",
    image: "/images/service_crop.png",
    icon: "🌱"
  },
  {
    title: "Market Price Prediction",
    desc: "Predict future market prices and demand trends to sell at the right time and maximize profits.",
    image: "/images/service_market.png",
    icon: "₹"
  },
  {
    title: "Weather Analysis",
    desc: "Get real-time weather updates, forecasts, and alerts to plan farming activities efficiently.",
    image: "/images/service_weather.png",
    icon: "☁️"
  },
  {
    title: "Soil Analysis",
    desc: "Analyze soil nutrients, pH, and fertility status to improve soil health and crop productivity.",
    image: "/images/service_soil.png",
    icon: "🧪"
  },
  {
    title: "Analytics Dashboard",
    desc: "Visualize your farm data, track performance, and monitor key metrics in one intelligent dashboard.",
    image: "/images/service_dashboard.png",
    icon: "📊"
  },
  {
    title: "Government Schemes",
    desc: "Discover and apply for the latest government schemes and subsidies easily.",
    image: "/images/service_gov.png",
    icon: "🏛️",
    path: "/schemes"
  },
  {
    title: "Drone & Satellite Insights",
    desc: "Monitor crop health, land conditions, and growth using satellite and drone imagery.",
    image: "/images/service_drone.png",
    icon: "🛰️"
  },
  {
    title: "AI Chatbot Assistant",
    desc: "Get instant answers to your farming queries with our AI-powered smart assistant.",
    image: "/images/service_chat.png",
    icon: "🤖"
  },
  {
    title: "Smart Alerts & Notifications",
    desc: "Receive timely alerts for weather, pests, irrigation, and market changes.",
    image: "/images/service_alerts.png",
    icon: "🔔"
  },
  {
    title: "Irrigation Management",
    desc: "Plan irrigation schedules smartly to save water and improve crop yield.",
    image: "/images/service_irrigation.png",
    icon: "💧"
  },
  {
    title: "Disease Detection",
    desc: "Detect crop diseases early using AI image analysis and prevent large-scale damage.",
    image: "/images/service_crop.png", // Re-using crop due to quota
    icon: "🔍"
  },
  {
    title: "Profit Calculator",
    desc: "Estimate costs, profits, and ROI for different crops and farming practices.",
    image: "/images/service_dashboard.png", // Re-using dashboard due to quota
    icon: "🧮"
  }
];

export function ServicesGrid() {
  return (
    <section className="bg-white py-12 px-6">
      <div className="max-w-[1500px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="bg-white rounded-2xl flex flex-col shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
          >
            {/* Image side - Top */}
            <div className="relative w-full h-[200px]">
              <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20"></div>
              {/* Floating Icon Center */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/40 backdrop-blur-md border border-white/30 flex items-center justify-center text-xl text-white shadow-lg">
                {service.icon}
              </div>
            </div>
            
            {/* Content side - Bottom */}
            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
                {service.desc}
              </p>
              <div>
                <Link to={service.path || "#"} className="bg-[#f0f9eb] hover:bg-[#e2f5d6] text-brand-dark font-semibold px-4 py-2 rounded-lg inline-flex items-center gap-2 text-xs transition-colors">
                  Learn More <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
