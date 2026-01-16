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
}