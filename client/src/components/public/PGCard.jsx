import { Link } from 'react-router-dom';
import { MapPin, Star, Wifi, Shield, Wind, ChefHat, Car, BedDouble } from 'lucide-react';

const AMENITY_MAP = { WiFi: Wifi, CCTV: Shield, AC: Wind, Meals: ChefHat, Parking: Car };
const CATEGORY_BADGE = { boys: { label: 'Boys', cls: 'bg-blue-100 text-blue-700' }, girls: { label: 'Girls', cls: 'bg-pink-100 text-pink-700' }, coed: { label: 'Co-ed', cls: 'bg-purple-100 text-purple-700' }, couple: { label: 'Couples', cls: 'bg-rose-100 text-rose-700' } };

export default function PGCard({ pg }) {
  const cat = CATEGORY_BADGE[pg.category] || { label: pg.category, cls: 'bg-gray-100 text-gray-700' };

  return (
    <Link to={`/pg/${pg._id}`} className="group card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 p-0 overflow-hidden block">
      {/* Image */}
      <div className="relative h-44 bg-gradient-to-br from-primary-100 to-primary-200 overflow-hidden">
        {pg.images?.[0] ? (
          <img src={pg.images[0]} alt={pg.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <BedDouble size={48} className="text-primary-300" />
          </div>
        )}
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full ${cat.cls}`}>{cat.label}</span>
        {pg.availableRooms > 0 && (
          <span className="absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full bg-green-500 text-white">{pg.availableRooms} Available</span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm truncate group-hover:text-primary-600 transition-colors">{pg.name}</h3>
        <div className="flex items-center gap-1 mt-1 text-gray-500 text-xs">
          <MapPin size={11} className="flex-shrink-0" />
          <span className="truncate">{pg.address?.locality}, {pg.address?.city}</span>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {pg.amenities?.slice(0, 4).map(a => {
            const Icon = AMENITY_MAP[a];
            return <span key={a} className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{Icon && <Icon size={10} />}{a}</span>;
          })}
        </div>

        {/* Rent & Rating */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div>
            <span className="text-primary-600 font-bold text-base">₹{pg.startingRent?.toLocaleString()}</span>
            <span className="text-gray-400 text-xs">/mo</span>
          </div>
          {pg.totalReviews > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Star size={11} className="text-yellow-400 fill-yellow-400" />
              <span className="font-medium text-gray-700">{pg.rating}</span>
              <span>({pg.totalReviews})</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
