import z from "zod";

const NameObjectSchema = z.object({
  id: z.number(),
  name: z.string(),
});

const VehicleDataSchema = z.object({
  id: z.number(),
  make: z.string(),
  model: z.string(),
  version: z.string().nullable(),
  license_plate: z.string(),
  mileage: z.string(), 
  engine_size: z.string(),
  power: z.string(),
  fuel_type: NameObjectSchema,
  transmission_type: NameObjectSchema,
  traction_type: NameObjectSchema,
  body_style: NameObjectSchema,
  year: z.number(),
  color: z.string(),
  doors: z.number(),
  seats: z.number(),
  images: z.array(z.any()), 
});

export const VehicleSchema = z.object({
  id: z.number(),
  // offset: o Django envia a hora de Lisboa (ex.: "+01:00" no verão), não só "Z"
  created_at: z.string().datetime({ offset: true }),
  purchase_price: z.string(),
  retail_price: z.string(),
  status: NameObjectSchema,
  vehicle_data: VehicleDataSchema,
});
 
export type Vehicle = z.infer<typeof VehicleSchema>;