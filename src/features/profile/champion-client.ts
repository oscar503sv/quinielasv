/** Guarda la predicción de campeón del usuario (valida el deadline server-side). */
export async function setChampion(champion: string): Promise<void> {
  const res = await fetch("/api/champion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ champion }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "No se pudo guardar tu campeón");
  }
}
