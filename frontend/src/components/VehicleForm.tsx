import { useState, useEffect } from 'react';
import { Vehicle } from '../types';
import { vehicleApi } from '../api/client';
import { useToastStore, useAuthStore } from '../store';
import { X, Save, Package } from 'lucide-react';

interface VehicleFormProps {
  vehicle?: Vehicle | null;
  onClose: () => void;
  onSaved: () => void;
}

const CATEGORIES = ['Sedan', 'SUV', 'Sports', 'Truck', 'Electric', 'Hatchback', 'Coupe', 'Van', 'Luxury', 'Other'];

export function VehicleForm({ vehicle, onClose, onSaved }: VehicleFormProps) {
  const { addToast } = useToastStore();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const isEditing = !!vehicle;
  const [loading, setLoading] = useState(false);
  const [restockAmount, setRestockAmount] = useState('');

  const [form, setForm] = useState({
    make: vehicle?.make || '',
    model: vehicle?.model || '',
    year: vehicle?.year?.toString() || new Date().getFullYear().toString(),
    category: vehicle?.category || 'Sedan',
    price: vehicle?.price?.toString() || '',
    quantity: vehicle?.quantity?.toString() || '',
    color: vehicle?.color || '',
    mileage: vehicle?.mileage?.toString() || '',
    description: vehicle?.description || '',
    imageUrl: vehicle?.imageUrl || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        make: form.make, model: form.model,
        year: parseInt(form.year), category: form.category,
        price: parseFloat(form.price), quantity: parseInt(form.quantity),
        ...(form.color && { color: form.color }),
        ...(form.mileage && { mileage: parseInt(form.mileage) }),
        ...(form.description && { description: form.description }),
        ...(form.imageUrl && { imageUrl: form.imageUrl }),
      };

      if (isEditing) {
        await vehicleApi.update(vehicle!.id, payload);
        addToast('success', 'Vehicle updated successfully!');
      } else {
        await vehicleApi.create(payload);
        addToast('success', 'Vehicle added successfully!');
      }
      onSaved();
      onClose();
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestock = async () => {
    if (!restockAmount || !vehicle) return;
    setLoading(true);
    try {
      await vehicleApi.restock(vehicle.id, parseInt(restockAmount));
      addToast('success', `Restocked ${restockAmount} units!`);
      onSaved();
      onClose();
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Restock failed.');
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = { marginBottom: 16 };
  const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-muted)', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.05em' };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'white' }}>
            {isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', display: 'flex', padding: 4, borderRadius: 8 }}>
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Make *</label>
              <input id="form-make" name="make" value={form.make} onChange={handleChange} className="input-field" placeholder="e.g. Toyota" required />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Model *</label>
              <input id="form-model" name="model" value={form.model} onChange={handleChange} className="input-field" placeholder="e.g. Camry" required />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Year *</label>
              <input id="form-year" name="year" type="number" value={form.year} onChange={handleChange} className="input-field" min="1886" max={new Date().getFullYear() + 2} required />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Category *</label>
              <select id="form-category" name="category" value={form.category} onChange={handleChange} className="input-field" required>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Price ($) *</label>
              <input id="form-price" name="price" type="number" value={form.price} onChange={handleChange} className="input-field" placeholder="28000" min="0" step="0.01" required />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Quantity *</label>
              <input id="form-quantity" name="quantity" type="number" value={form.quantity} onChange={handleChange} className="input-field" placeholder="5" min="0" required />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Color</label>
              <input id="form-color" name="color" value={form.color} onChange={handleChange} className="input-field" placeholder="e.g. Silver" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Mileage</label>
              <input id="form-mileage" name="mileage" type="number" value={form.mileage} onChange={handleChange} className="input-field" placeholder="0" min="0" />
            </div>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Image URL</label>
            <input id="form-imageUrl" name="imageUrl" value={form.imageUrl} onChange={handleChange} className="input-field" placeholder="https://..." />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Description</label>
            <textarea id="form-description" name="description" value={form.description} onChange={handleChange} className="input-field" placeholder="Brief description..." rows={3} style={{ resize: 'vertical' }} />
          </div>

          <button id="form-submit" type="submit" className="btn-primary" disabled={loading}
            style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? <span className="animate-spin" style={{ width: 18, height: 18, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} /> : <Save size={18} />}
            {isEditing ? 'Save Changes' : 'Add Vehicle'}
          </button>
        </form>

        {/* Admin Restock Section */}
        {isEditing && isAdmin && (
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--color-border)' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick Restock
            </h3>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                id="restock-amount"
                type="number"
                value={restockAmount}
                onChange={e => setRestockAmount(e.target.value)}
                className="input-field"
                placeholder="Units to add"
                min="1"
                style={{ maxWidth: 160 }}
              />
              <button id="restock-submit" className="btn-outline" onClick={handleRestock} disabled={!restockAmount || loading}
                style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                <Package size={16} /> Restock
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
