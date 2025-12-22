Logiski — To-Do List de Ejecución (Next + Supabase)

Checklist simple para ir trackeando el avance del proyecto sin ruido.

⸻

🟢 FASE 0 — Decisiones cerradas
	•	Confirmar nombre del proyecto (Logiski / Trakiski)
	•	Confirmar stack: Next.js + Supabase
	•	Confirmar que el MVP tiene solo 2 páginas (Registro + Stats)

⸻

🟢 FASE 1 — Setup base
	•	Crear proyecto Next.js (App Router)
	•	Inicializar repo
	•	Configurar PWA (manifest + icons)
	•	Crear proyecto en Supabase
	•	Guardar keys en .env
	•	Conectar Next con Supabase SDK
	•	Verificar conexión con un fetch simple

⸻

🟢 FASE 2 — Auth (aprendizaje clave)
	•	Habilitar Email/Password en Supabase
	•	Crear página de Login
	•	Crear página de Signup
	•	Manejar sesión activa
	•	Proteger rutas privadas (middleware)
	•	Logout funcional
	•	Persistencia de sesión al refresh

⸻

🟢 FASE 3 — Modelo de datos
	•	Crear tabla activities
	•	Crear tabla day_logs
	•	Crear tabla day_log_activities
	•	Definir constraints (1 log por día)
	•	Seed inicial de actividades

⸻

🟢 FASE 4 — Página principal (“Ayer hice”)
	•	Calcular fecha de ayer
	•	Chequear si ayer ya fue registrado
	•	Listar actividades
	•	UI de selección múltiple (checkbox)
	•	Botón Guardar
	•	Persistir DayLog
	•	Manejar caso “guardar sin seleccionar”

⸻

🟢 FASE 5 — Página de estadísticas
	•	Vista calendario / heatmap
	•	Gráfico de frecuencia por actividad
	•	Calcular racha actual
	•	Calcular racha máxima
	•	Mostrar última vez registrada

⸻

🟢 FASE 6 — UX mínima
	•	Mobile-first
	•	Tipografías legibles
	•	Estados vacíos claros
	•	Sin mensajes motivacionales

⸻

🟢 FASE 7 — Instalación y uso real
	•	Instalar PWA en iPhone
	•	Instalar PWA en iPad
	•	Usar la app durante 3 días seguidos
	•	Anotar fricciones reales

⸻

🔴 Fuera de alcance (NO hacer ahora)
	•	❌ Dark mode
	•	❌ Edición histórica
	•	❌ Exportar datos
	•	❌ Features nuevas

⸻

✅ Definición de terminado
	•	Registro diario se hace en <10 segundos
	•	Stats se entienden sin explicación
	•	No hay bugs bloqueantes
	•	La app se usa sin pensar



    ugsOdjUG3CnrkA70