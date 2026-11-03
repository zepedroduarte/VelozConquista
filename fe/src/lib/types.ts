export interface APIVehicleImage {
    id: number;
    image: string;
    is_primary: boolean;
}

export interface APIVehicleOption {
    id: number;
    name: string;
}

export interface APIVehicleData {
    id: number;
    make: string;
    model: string;
    version: string;
    year: number;
    mileage: string;
    engine_size: string;
    doors: number;
    power: string;
    seats: number;
    color: string;
    fuel_type: APIVehicleOption;
    transmission_type: APIVehicleOption;
    body_style?: APIVehicleOption; 
    traction_type?: APIVehicleOption;
    images: APIVehicleImage[];
}

export interface Vehicle {
    id: number;
    retail_price: string;
    status: APIVehicleOption;
    vehicle_data: APIVehicleData;
    created_at?: string;
}

export interface VehicleOptions {
    bodyStyle: APIVehicleOption[];
    fuelType: APIVehicleOption[];
    transmissionType: APIVehicleOption[];
    tractionType: APIVehicleOption[];
    status: APIVehicleOption[];
}

export interface LegalInfo {
    legal_name: string;
    credit_intermediary_number: string;
    lenders: string;
    services: string;
    insurer: string;
    insurance_policy_number: string;
    insurance_valid_from: string;
    insurance_valid_until: string;
    updated_at?: string;
}

export interface CompanySettings {
    name: string;
    description: string;
    phone: string;
    email: string;
    address: string;
    facebook_url?: string;
    instagram_url?: string;
    whatsapp_number?: string;
    logo?: string;
    postal_code?: string;
    locality?: string;
    latitude?: string | null;
    longitude?: string | null;
    google_maps_url?: string;
    weekday_hours?: string;
    saturday_hours?: string;
    sunday_hours?: string;
    service_areas?: string;
}