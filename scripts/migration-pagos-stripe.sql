-- ============================================================
-- Migration: Add stripe_session_id to pagos + relax constraints
-- for automated Stripe webhook payments.
-- ============================================================

-- 1. Add stripe_session_id column (nullable, unique for idempotency)
ALTER TABLE public.pagos
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT UNIQUE;

-- 2. Add concepto column for human-readable payment description
ALTER TABLE public.pagos
  ADD COLUMN IF NOT EXISTS concepto TEXT;

-- 3. Relax constraints that were designed for manual admin payments only:
--    - mes_desbloqueado: not always applicable (inscription, certification)
--    - registrado_por: webhook has no auth.uid()
ALTER TABLE public.pagos
  ALTER COLUMN mes_desbloqueado DROP NOT NULL;

ALTER TABLE public.pagos
  DROP CONSTRAINT IF EXISTS pagos_mes_desbloqueado_check;

ALTER TABLE public.pagos
  ALTER COLUMN registrado_por DROP NOT NULL;

-- 4. Index for fast idempotency lookups
CREATE INDEX IF NOT EXISTS idx_pagos_stripe_session
  ON public.pagos (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;
