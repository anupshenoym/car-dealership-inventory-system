import { useState, useEffect, useCallback } from 'react';
import { vehicleApi } from '../api/client';
import type { Vehicle } from '../types';
import { useAuthStore, useToastStore } from '../store';
import { VehicleCard } from '../components/VehicleCard';
import { VehicleForm } from '../components/VehicleForm';
import { Search, Filter, PlusCircle, ChevronLeft, ChevronRight, Car, TrendingUp, Package, DollarSign } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const isAdmin = user?.role === 'admin';

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);

  const emptyFilters = { make: '', model: '', category: '', minPrice: '', maxPrice: '' };
  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [activeFilters, setActiveFilters] = useState(false);

  const LIMIT = 12;
  const totalPages = Math.ceil(total / LIMIT);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const hasFilter = Object.values(appliedFilters).some(v => v);
      let res;
      if (hasFilter) {
        const params: Record<string, string | number> = { page, limit: LIMIT };
        Object.entries(appliedFilters).forEach(([k, v]) => { if (v) params[k] = v; });
        res = await vehicleApi.search(params);
      } else {
        res = await vehicleApi.list(page, LIMIT);
      }
      setVehicles(res.data.vehicles);
      setTotal(res.data.total);
    } catch {
      addToast('error', 'Failed to load vehicles.');
    } finally {
      setLoading(false);
    }
  }, [page, appliedFilters, addToast]);

  // Syncing the vehicle list with the API whenever the page or filters change.
  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setAppliedFilters({ ...filters });
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(1);
    setActiveFilters(false);
  };

  const totalValue = vehicles.reduce((sum, v) => sum + (v.price * v.quantity), 0);
  const totalStock = vehicles.reduce((sum, v) => sum + v.quantity, 0);
  const outOfStock = vehicles.filter(v => v.quantity === 0).length;

  const CATEGORIES = ['', 'Sedan', 'SUV', 'Sports', 'Truck', 'Electric', 'Hatchback', 'Coupe', 'Van', 'Luxury'];

  return (
    <div className="bg-grid" style={{ minHeight: '100vh', paddingBottom: 48 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 style={{ margin: '0 0 6px', fontSize: '2rem', fontWeight: 800, color: 'white' }}>
              Vehicle Inventory
            </h1>
            <p style={{ margin: 0, color: 'var(--color-muted)' }}>
              {total} vehicle{total !== 1 ? 's' : ''} available
            </p>
          </div>
          {isAdmin && (
            <button id="add-vehicle-btn" className="btn-primary" onClick={() => { setEditVehicle(null); setShowForm(true); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px' }}>
              <PlusCircle size={18} /> Add Vehicle
            </button>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Car size={20} color="#a5b4fc" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Models</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', fontFamily: 'Outfit' }}>{total}</div>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={20} color="#6ee7b7" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Stock</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', fontFamily: 'Outfit' }}>{totalStock}</div>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={20} color="#fcd34d" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Inventory Value</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', fontFamily: 'Outfit' }}>${(totalValue / 1000).toFixed(0)}K</div>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={20} color="#fca5a5" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Out of Stock</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: outOfStock > 0 ? '#fca5a5' : 'white', fontFamily: 'Outfit' }}>{outOfStock}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="glass-card" style={{ borderRadius: 16, padding: '20px 24px', marginBottom: 28 }}>
          <form onSubmit={handleSearch}>
            <div className="search-grid" style={{ marginBottom: activeFilters ? 16 : 0 }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="var(--color-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input id="search-make" value={filters.make} onChange={e => setFilters(p => ({ ...p, make: e.target.value }))}
                  className="input-field" placeholder="Search by make..." style={{ paddingLeft: 36 }} />
              </div>
              <input id="search-model" value={filters.model} onChange={e => setFilters(p => ({ ...p, model: e.target.value }))}
                className="input-field" placeholder="Model..." />
              <select id="search-category" value={filters.category} onChange={e => setFilters(p => ({ ...p, category: e.target.value }))}
                className="input-field">
                {CATEGORIES.map(c => <option key={c} value={c}>{c || 'All Categories'}</option>)}
              </select>
              <div className="search-actions">
                <button id="search-submit" type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '10px 16px' }}>
                  Search
                </button>
                <button type="button" onClick={() => setActiveFilters(!activeFilters)} className="btn-outline" style={{ padding: '10px 12px' }}>
                  <Filter size={16} />
                </button>
              </div>
            </div>

            {activeFilters && (
              <div style={{ display: 'flex', gap: 12, paddingTop: 12, borderTop: '1px solid var(--color-border)', alignItems: 'center' }}>
                <input id="filter-min-price" type="number" value={filters.minPrice} onChange={e => setFilters(p => ({ ...p, minPrice: e.target.value }))}
                  className="input-field" placeholder="Min price ($)" style={{ maxWidth: 160 }} />
                <input id="filter-max-price" type="number" value={filters.maxPrice} onChange={e => setFilters(p => ({ ...p, maxPrice: e.target.value }))}
                  className="input-field" placeholder="Max price ($)" style={{ maxWidth: 160 }} />
                <button type="button" onClick={clearFilters} className="btn-outline" style={{ whiteSpace: 'nowrap', fontSize: '0.85rem', padding: '8px 16px' }}>
                  Clear Filters
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Vehicle Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="vehicle-card" style={{ height: 380 }}>
                <div className="skeleton" style={{ height: 180 }} />
                <div style={{ padding: 20 }}>
                  <div className="skeleton" style={{ height: 20, marginBottom: 12 }} />
                  <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 20 }} />
                  <div className="skeleton" style={{ height: 36 }} />
                </div>
              </div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🚗</div>
            <h3 style={{ color: 'white', marginBottom: 8 }}>No vehicles found</h3>
            <p style={{ color: 'var(--color-muted)' }}>
              {Object.values(appliedFilters).some(v => v) ? 'Try different search filters.' : 'No vehicles in inventory yet.'}
            </p>
            {isAdmin && <button className="btn-primary" onClick={() => setShowForm(true)} style={{ marginTop: 16, padding: '10px 24px' }}>Add First Vehicle</button>}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} onUpdate={fetchVehicles}
                onEdit={(vehicle) => { setEditVehicle(vehicle); setShowForm(true); }} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 40 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-outline"
              style={{ padding: '8px 12px', opacity: page === 1 ? 0.4 : 1 }}>
              <ChevronLeft size={16} />
            </button>
            <div style={{ display: 'flex', gap: 6 }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={p === page ? 'btn-primary' : 'btn-outline'}
                  style={{ width: 36, height: 36, padding: 0, fontSize: '0.875rem' }}>
                  {p}
                </button>
              ))}
            </div>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-outline"
              style={{ padding: '8px 12px', opacity: page === totalPages ? 0.4 : 1 }}>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Vehicle Form Modal */}
      {showForm && (
        <VehicleForm
          vehicle={editVehicle}
          onClose={() => { setShowForm(false); setEditVehicle(null); }}
          onSaved={fetchVehicles}
        />
      )}
    </div>
  );
}
