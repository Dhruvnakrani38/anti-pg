import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Phone, MessageCircle, Star, Wifi, Shield, Wind, ChefHat, Car, Dumbbell, WashingMachine, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { publicService } from '../../services/services';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const AMENITY_ICONS = { WiFi: Wifi, CCTV: Shield, AC: Wind, Meals: ChefHat, Parking: Car, Gym: Dumbbell, Laundry: WashingMachine };

export default function PGDetail() {
  const { id } = useParams();
  const [pg, setPG] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    publicService.getPGDetail(id).then(r => { setPG(r.data.pg); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const submitEnquiry = async (data) => {
    try {
      await publicService.submitEnquiry({ pgId: id, ...data });
      toast.success('Enquiry sent! Owner will contact you soon.');
      setShowEnquiry(false);
      reset();
    } catch { toast.error('Failed to send enquiry'); }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col"><Navbar />
      <div className="flex-1 flex items-center justify-center"><div className="animate-spin h-10 w-10 rounded-full border-b-2 border-primary-600"></div></div>
    </div>
  );
  if (!pg) return <div className="min-h-screen flex flex-col"><Navbar /><div className="flex-1 flex items-center justify-center text-gray-500">PG not found</div></div>;

  const images = pg.images?.length ? pg.images : [];
  const cat = { boys: 'Boys PG', girls: 'Girls PG', coed: 'Co-ed PG', couple: 'Couple Friendly' }[pg.category] || pg.category;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left — Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            <div className="relative h-72 sm:h-96 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl overflow-hidden">
              {images.length > 0 ? (
                <>
                  <img src={images[imgIdx]} alt={pg.name} className="w-full h-full object-cover" />
                  {images.length > 1 && (
                    <>
                      <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition"><ChevronLeft size={18} /></button>
                      <button onClick={() => setImgIdx(i => (i + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition"><ChevronRight size={18} /></button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === imgIdx ? 'bg-white scale-125' : 'bg-white/50'}`} />)}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-primary-400 text-5xl">🏠</div>
              )}
            </div>

            {/* Basic Info */}
            <div className="card">
              <div className="flex flex-wrap items-start gap-3 justify-between">
                <div className="flex-1">
                  <span className="badge-active text-xs mb-2 inline-block">{cat}</span>
                  <h1 className="text-2xl font-bold text-gray-900">{pg.name}</h1>
                  <div className="flex items-center gap-1.5 mt-1 text-gray-500 text-sm">
                    <MapPin size={14} className="text-primary-500 flex-shrink-0" />
                    {pg.address?.street}, {pg.address?.locality}, {pg.address?.city} - {pg.address?.pincode}
                  </div>
                  {pg.totalReviews > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      <span className="font-semibold text-gray-800 text-sm">{pg.rating}</span>
                      <span className="text-gray-400 text-sm">({pg.totalReviews} reviews)</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-primary-600">₹{pg.startingRent?.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">/month onwards</div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="card">
              <h2 className="text-lg font-bold mb-3">About this PG</h2>
              <p className="text-gray-600 leading-relaxed text-sm">{pg.description}</p>
            </div>

            {/* Amenities */}
            {pg.amenities?.length > 0 && (
              <div className="card">
                <h2 className="text-lg font-bold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {pg.amenities.map(a => {
                    const Icon = AMENITY_ICONS[a];
                    return (
                      <div key={a} className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                          {Icon ? <Icon size={16} /> : <span className="text-xs font-semibold">{a[0]}</span>}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{a}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* House Rules */}
            {pg.houseRules && (
              <div className="card">
                <h2 className="text-lg font-bold mb-3">House Rules</h2>
                <p className="text-gray-600 text-sm whitespace-pre-line">{pg.houseRules}</p>
              </div>
            )}

            {/* Map */}
            <div className="card p-0 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-bold">Location</h2>
              </div>
              <iframe
                title="PG Location"
                className="w-full h-52"
                loading="lazy"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(`${pg.address?.locality}, ${pg.address?.city}`)}&z=15&output=embed`}
              />
            </div>
          </div>

          {/* Right — Contact Card */}
          <div className="space-y-4">
            <div className="card sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Contact Owner</h3>
              <div className="space-y-3">
                <a href={`tel:${pg.contactPhone}`} className="btn-primary w-full justify-center">
                  <Phone size={16} /> Call Owner
                </a>
                <a href={`https://wa.me/91${pg.contactPhone?.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-5 rounded-lg transition-all flex items-center gap-2 justify-center">
                  <MessageCircle size={16} /> WhatsApp
                </a>
                <button onClick={() => setShowEnquiry(true)} className="btn-secondary w-full justify-center">
                  Send Enquiry
                </button>
              </div>

              <div className="mt-5 pt-5 border-t border-gray-100 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Available Rooms</span>
                  <span className="font-semibold text-green-600">{pg.availableRooms} of {pg.totalRooms}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phone</span>
                  <span className="font-semibold">{pg.contactPhone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enquiry Modal */}
      {showEnquiry && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">Send Enquiry</h2>
              <button onClick={() => setShowEnquiry(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit(submitEnquiry)} className="space-y-4">
              <div>
                <label className="label">Your Name</label>
                <input className="input" placeholder="Full Name" {...register('name', { required: true })} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" placeholder="10-digit mobile" {...register('phone', { required: true })} />
              </div>
              <div>
                <label className="label">Email (optional)</label>
                <input type="email" className="input" placeholder="you@example.com" {...register('email')} />
              </div>
              <div>
                <label className="label">Message</label>
                <textarea className="input h-24 resize-none" placeholder="Any specific requirements?" {...register('message')} />
              </div>
              <button type="submit" className="btn-primary w-full justify-center" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Enquiry'}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
