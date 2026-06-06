import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Ingresá un correo válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const registerSchema = z
  .object({
    name: z.string().min(1, "El nombre es requerido"),
    email: z.string().email("Ingresá un correo válido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Las contraseñas no coinciden",
    path: ["confirm"],
  });

export const recoverSchema = z.object({
  email: z.string().email("Ingresá un correo válido"),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type RecoverValues = z.infer<typeof recoverSchema>;
