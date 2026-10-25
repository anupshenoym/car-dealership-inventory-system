export interface User {
  id: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  category: string;
  price: number;
  quantity: number;
  color?: string;
  mileage?: number;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
}

export interface RegisterBody {
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface CreateVehicleBody {
  make: string;
  model: string;
  year: number;
  category: string;
  price: number;
  quantity: number;
  color?: string;
  mileage?: number;
  description?: string;
  imageUrl?: string;
}

export interface UpdateVehicleBody extends Partial<CreateVehicleBody> {}

export interface SearchQuery {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
  limit?: string;
}
