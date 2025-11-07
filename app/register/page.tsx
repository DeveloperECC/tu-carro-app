"use client";

import React, { useState, FormEvent } from "react";
import { supabase } from "../lib/supabaseClient";

export default function RegisterPage() {
  const [nombre, setNombre] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [telefono, setTelefono] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      // 1) Registrar al usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setMessage("❌ Error en registro: " + authError.message);
        return;
      }

      const userId = authData?.user?.id;
      if (!userId) {
        setMessage("⚠️ No se pudo obtener el ID del usuario.");
        return;
      }

      // 2) Insertar los datos del estudiante en la tabla 'estudiantes'
      const { error: insertError } = await supabase.from("estudiantes").insert([
        {
          id: userId,
          nombre,
          correo: email,
          telefono,
        },
      ]);

      if (insertError) {
        setMessage(
          "⚠️ Usuario autenticado pero no guardado en la tabla: " +
            insertError.message
        );
        return;
      }

      setMessage(
        "✅ Usuario registrado y guardado correctamente. Revisa tu correo para confirmar."
      );

      // opcional: limpiar formulario
      setNombre("");
      setEmail("");
      setTelefono("");
      setPassword("");
    } catch (err: any) {
      setMessage("❌ Ocurrió un error inesperado: " + (err?.message ?? err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 border rounded-lg shadow">
      <h1 className="text-xl font-bold mb-4 text-center">Registro de estudiante</h1>

      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="border p-2 rounded"
        />

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-2 rounded"
        />

        <input
          type="tel"
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border p-2 rounded"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Registrando..." : "Registrarse"}
        </button>
      </form>

      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}