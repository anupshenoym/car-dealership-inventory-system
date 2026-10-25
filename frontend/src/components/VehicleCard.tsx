import { useState } from 'react';
import { Vehicle } from '../types';
import { vehicleApi } from '../api/client';
import { useAuthStore, useToastStore } from '../store';
import { ShoppingCart, Edit2, Trash2, Package, DollarSign, Calendar, Tag } from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
  onUpdate: () => void;
  onEdit?: (vehicle: Vehicle) => void;
}

export function VehicleCard({ vehicle, onUpdate, onEdit }: VehicleCardProps) {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [purchasing, setPurchasing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isOutOfStock = vehicle.quantity === 0;
  const isLowStock = vehicle.quantity <= 2 && vehicle.quantity > 0;

  const categoryColors: Record<string, string> = {
    Sedan: 'badge-indigo', SUV: 'badge-amber', Sports: 'badge-red',
    Truck: 'badge-green', Electric: 'badge-green', Hatchback: 'badge-indigo',
    Coupe: 'badge-red', Van: 'badge-amber',
  };
  const badgeClass = categoryColors[vehicle.category] || 'badge-indigo';

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      await vehicleApi.purchase(vehicle.id);
      addToast('success', `Successfully purchased ${vehicle.make} ${vehicle.model}!`);
      onUpdate();
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Purchase failed.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${vehicle.make} ${vehicle.model}?`)) return;
    setDeleting(true);
    try {
      await vehicleApi.delete(vehicle.id);
      addToast('success', 'Vehicle deleted.');
      onUpdate();
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="vehicle-card animate-fade-in-up">
      {/* Image / Placeholder */}
      <div style={{ height: 180, background: 'linear-gradient(135deg, #1a1a35 0%, rgba(99,102,241,0.1) 100%)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {vehicle.imageUrl ? (
          <img src={vehicle.imageUrl} alt={`${vehicle.make} ${vehicle.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 4 }}>🚗</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{vehicle.year}</span>
          </div>
        )}
        {/* Category Badge */}
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span className={`badge ${badgeClass}`}>{vehicle.category}</span>
        </div>
        {/* Stock Indicator */}
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          {isOutOfStock ? (
            <span className="badge badge-red">Out of Stock</span>
          ) : isLowStock ? (
            <span className="badge badge-amber">Low Stock</span>
          ) : null}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '18px 20px' }}>
        <div style={{ marginBottom: 12 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 700, color: 'white' }}>
            {vehicle.make} {vehicle.model}
          </h3>
          {vehicle.description && (
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {vehicle.description}
            </p>
          )}
        </div>

        {/* Info Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={13} color="var(--color-muted)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>{vehicle.year}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Package size={13} color="var(--color-muted)" />
            <span style={{ fontSize: '0.8rem', color: vehicle.quantity === 0 ? '#fca5a5' : isLowStock ? '#fcd34d' : 'var(--color-muted)' }}>
              {vehicle.quantity} in stock
            </span>
          </div>
          {vehicle.color && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Tag size={13} color="var(--color-muted)" />
              <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>{vehicle.color}</span>
            </div>
          )}
          {vehicle.mileage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>{vehicle.mileage.toLocaleString()} mi</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
          <DollarSign size={16} color="#a5b4fc" />
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', fontFamily: 'Outfit' }}>
            {vehicle.price.toLocaleString()}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            id={`purchase-btn-${vehicle.id}`}
            className="btn-success"
            onClick={handlePurchase}
            disabled={isOutOfStock || purchasing}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            {purchasing ? (
              <span className="animate-spin" style={{ width: 16, height: 16, border: '2px solid #10b981', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} />
            ) : (
              <ShoppingCart size={15} />
            )}
            {isOutOfStock ? 'Sold Out' : 'Purchase'}
          </button>

          {isAdmin && (
            <>
              <button
                id={`edit-btn-${vehicle.id}`}
                className="btn-outline"
                onClick={() => onEdit?.(vehicle)}
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              >
                <Edit2 size={15} />
              </button>
              <button
                id={`delete-btn-${vehicle.id}`}
                className="btn-danger"
                onClick={handleDelete}
                disabled={deleting}
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
