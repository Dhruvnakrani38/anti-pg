import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, X, ChevronRight } from 'lucide-react';
import { ownerService } from '../../services/services';
import { Link } from 'react-router-dom';

const STATES = ['Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'];
const AMENITIES_LIST = ['WiFi','AC','Meals','Laundry','CCTV','Parking','Gym','Geyser','Power Backup','Housekeeping','TV','Fridge'];
const STEPS = ['Basic Info', 'Location', 'Amenities & Rules', 'Photos'];

export default function AddPG() {
  const [step, setStep] = useState(0);
  const [amenities, setAmenities] = useState([]);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, trigger, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const toggleAmenity = (a) => setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files].slice(0, 10));
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...urls].slice(0, 10));
  };

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const nextStep = async () => {
    const fields = [
      ['name', 'description', 'category', 'contactPhone', 'startingRent'],
      ['street', 'locality', 'city', 'pincode', 'state'],
      [],
      [],
    ];
    const valid = await trigger(fields[step]);
    if (valid) setStep(s => s + 1);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, v));
      fd.append('amenities', JSON.stringify(amenities));
      images.forEach(img => fd.append('images', img));
      await ownerService.addPG(fd);
      toast.success('PG submitted for admin approval!');
      navigate('/owner/pgs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add PG');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/owner/pgs" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New PG</h1>
          <p className="text-sm text-gray-400">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex gap-1 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? 'bg-primary-600' : 'bg-gray-200'}`} />
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
        {/* Step 1: Basic Info */}
        {step === 0 && <>
          <div>
            <label className="label">PG Name *</label>
            <input className="input" placeholder="e.g. Green Valley PG" {...register('name', { required: 'Required' })} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea className="input h-24 resize-none" placeholder="Describe your PG, facilities, surroundings..." {...register('description', { required: 'Required', minLength: { value: 30, message: 'Minimum 30 characters' } })} />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">PG Category *</label>
              <select className="input" {...register('category', { required: 'Required' })}>
                <option value="">Select category</option>
                <option value="boys">Boys</option>
                <option value="girls">Girls</option>
                <option value="coed">Co-ed</option>
                <option value="couple">Couple Friendly</option>
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            </div>
            <div>
              <label className="label">Starting Rent (₹/mo) *</label>
              <input type="number" className="input" placeholder="8000" {...register('startingRent', { required: 'Required', min: { value: 1000, message: 'Too low' } })} />
              {errors.startingRent && <p className="text-red-500 text-xs mt-1">{errors.startingRent.message}</p>}
            </div>
          </div>
          <div>
            <label className="label">Contact Phone *</label>
            <input className="input" placeholder="9876543210" {...register('contactPhone', { required: 'Required', pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid phone' } })} />
            {errors.contactPhone && <p className="text-red-500 text-xs mt-1">{errors.contactPhone.message}</p>}
          </div>
        </>}

        {/* Step 2: Location */}
        {step === 1 && <>
          <div>
            <label className="label">Street Address *</label>
            <input className="input" placeholder="House No., Street Name" {...register('street', { required: 'Required' })} />
          </div>
          <div>
            <label className="label">Locality / Area *</label>
            <input className="input" placeholder="e.g. Koramangala" {...register('locality', { required: 'Required' })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">City *</label>
              <input className="input" placeholder="e.g. Bangalore" {...register('city', { required: 'Required' })} />
            </div>
            <div>
              <label className="label">Pincode *</label>
              <input className="input" placeholder="560001" {...register('pincode', { required: 'Required', pattern: { value: /^\d{6}$/, message: '6-digit pincode' } })} />
            </div>
          </div>
          <div>
            <label className="label">State *</label>
            <select className="input" {...register('state', { required: 'Required' })}>
              <option value="">Select state</option>
              {STATES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </>}

        {/* Step 3: Amenities & Rules */}
        {step === 2 && <>
          <div>
            <label className="label">Select Amenities</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {AMENITIES_LIST.map(a => (
                <button type="button" key={a} onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${amenities.includes(a) ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">House Rules</label>
            <textarea className="input h-24 resize-none" placeholder="e.g. No smoking. Guests allowed till 10 PM. Keep common areas clean." {...register('houseRules')} />
          </div>
        </>}

        {/* Step 4: Photos */}
        {step === 3 && <>
          <div>
            <label className="label">PG Photos (up to 10)</label>
            <label className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all">
              <Upload size={28} className="text-gray-300 mb-2" />
              <span className="text-sm text-gray-400 font-medium">Click to upload images</span>
              <span className="text-xs text-gray-300 mt-1">JPG, PNG, WebP — Max 5MB each</span>
              <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
            </label>
            {previews.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden h-20">
                    <img src={src} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>}

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t border-gray-100">
          {step > 0 ? (
            <button type="button" onClick={() => setStep(s => s - 1)} className="btn-secondary">← Back</button>
          ) : <div />}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={nextStep} className="btn-primary">Continue <ChevronRight size={15} /></button>
          ) : (
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit PG'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
