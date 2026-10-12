-- ==============================================================================
-- MIGRATION: 24/7 AUTOMATED FULL DATABASE BACKUP & SELECTIVE RESTORE SYSTEM
-- ==============================================================================
-- This script configures:
-- 1. A centralized 'database_backups' table for all admin users.
-- 2. A stored procedure 'generate_database_backup()' that captures FULL snapshots of:
--    - medicines (inventory)
--    - orders & order_items
--    - buyers (pharmacies)
--    - admin_users & admin_roles (staff & permissions)
--    - delivery_men
--    - coupons & special_discounts
--    - medicine_requests
--    - auth.users (user credentials, emails, authentication metadata)
--    EXCLUDED: admin_activity_logs, database_backups
-- 3. A stored procedure 'restore_database_tables(target_backup_id, tables_to_restore)'
--    allowing granular / selective restoration of any chosen tables.
-- 4. A scheduled cron job using 'pg_cron' running daily at 11:59 PM (23:59 UTC).
-- 5. Auto-retention logic that prunes backups older than 30 days.
-- ==============================================================================

-- 1. Enable pg_cron extension (PostgreSQL Cron Scheduler)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Create the backups table
CREATE TABLE IF NOT EXISTS public.database_backups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    backup_type TEXT DEFAULT 'automated', -- 'automated' or 'manual'
    total_records INTEGER DEFAULT 0,
    tables_summary JSONB DEFAULT '{}'::jsonb,
    backup_data JSONB NOT NULL
);

-- 3. Configure Row Level Security (RLS)
ALTER TABLE public.database_backups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access to database_backups" ON public.database_backups;
CREATE POLICY "Allow read access to database_backups"
ON public.database_backups FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow full write access to database_backups" ON public.database_backups;
CREATE POLICY "Allow full write access to database_backups"
ON public.database_backups FOR ALL
USING (true)
WITH CHECK (true);

-- 4. Create the comprehensive automated backup stored procedure
CREATE OR REPLACE FUNCTION public.generate_database_backup(b_type TEXT DEFAULT 'automated')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    meds_json JSONB := '[]'::jsonb;
    orders_json JSONB := '[]'::jsonb;
    items_json JSONB := '[]'::jsonb;
    buyers_json JSONB := '[]'::jsonb;
    admin_users_json JSONB := '[]'::jsonb;
    admin_roles_json JSONB := '[]'::jsonb;
    delivery_men_json JSONB := '[]'::jsonb;
    coupons_json JSONB := '[]'::jsonb;
    discounts_json JSONB := '[]'::jsonb;
    requests_json JSONB := '[]'::jsonb;
    auth_users_json JSONB := '[]'::jsonb;

    meds_cnt INTEGER := 0;
    orders_cnt INTEGER := 0;
    items_cnt INTEGER := 0;
    buyers_cnt INTEGER := 0;
    admin_users_cnt INTEGER := 0;
    admin_roles_cnt INTEGER := 0;
    delivery_men_cnt INTEGER := 0;
    coupons_cnt INTEGER := 0;
    discounts_cnt INTEGER := 0;
    requests_cnt INTEGER := 0;
    auth_users_cnt INTEGER := 0;
    total_cnt INTEGER := 0;

    summary_obj JSONB;
    result_record JSONB;
BEGIN
    -- 1. Snapshot medicines
    BEGIN
        SELECT COALESCE(jsonb_agg(to_jsonb(m)), '[]'::jsonb), COUNT(*)
        INTO meds_json, meds_cnt
        FROM (SELECT * FROM public.medicines ORDER BY id ASC) m;
    EXCEPTION WHEN OTHERS THEN meds_json := '[]'::jsonb; meds_cnt := 0; END;

    -- 2. Snapshot orders
    BEGIN
        SELECT COALESCE(jsonb_agg(to_jsonb(o)), '[]'::jsonb), COUNT(*)
        INTO orders_json, orders_cnt
        FROM (SELECT * FROM public.orders ORDER BY created_at DESC) o;
    EXCEPTION WHEN OTHERS THEN orders_json := '[]'::jsonb; orders_cnt := 0; END;

    -- 3. Snapshot order_items
    BEGIN
        SELECT COALESCE(jsonb_agg(to_jsonb(oi)), '[]'::jsonb), COUNT(*)
        INTO items_json, items_cnt
        FROM (SELECT * FROM public.order_items ORDER BY id ASC) oi;
    EXCEPTION WHEN OTHERS THEN items_json := '[]'::jsonb; items_cnt := 0; END;

    -- 4. Snapshot buyers
    BEGIN
        SELECT COALESCE(jsonb_agg(to_jsonb(b)), '[]'::jsonb), COUNT(*)
        INTO buyers_json, buyers_cnt
        FROM (SELECT * FROM public.buyers ORDER BY id ASC) b;
    EXCEPTION WHEN OTHERS THEN buyers_json := '[]'::jsonb; buyers_cnt := 0; END;

    -- 5. Snapshot admin_users
    BEGIN
        SELECT COALESCE(jsonb_agg(to_jsonb(au)), '[]'::jsonb), COUNT(*)
        INTO admin_users_json, admin_users_cnt
        FROM (SELECT * FROM public.admin_users ORDER BY id ASC) au;
    EXCEPTION WHEN OTHERS THEN admin_users_json := '[]'::jsonb; admin_users_cnt := 0; END;

    -- 6. Snapshot admin_roles
    BEGIN
        SELECT COALESCE(jsonb_agg(to_jsonb(ar)), '[]'::jsonb), COUNT(*)
        INTO admin_roles_json, admin_roles_cnt
        FROM (SELECT * FROM public.admin_roles ORDER BY id ASC) ar;
    EXCEPTION WHEN OTHERS THEN admin_roles_json := '[]'::jsonb; admin_roles_cnt := 0; END;

    -- 7. Snapshot delivery_men
    BEGIN
        SELECT COALESCE(jsonb_agg(to_jsonb(dm)), '[]'::jsonb), COUNT(*)
        INTO delivery_men_json, delivery_men_cnt
        FROM (SELECT * FROM public.delivery_men ORDER BY id ASC) dm;
    EXCEPTION WHEN OTHERS THEN delivery_men_json := '[]'::jsonb; delivery_men_cnt := 0; END;

    -- 8. Snapshot coupons
    BEGIN
        SELECT COALESCE(jsonb_agg(to_jsonb(c)), '[]'::jsonb), COUNT(*)
        INTO coupons_json, coupons_cnt
        FROM (SELECT * FROM public.coupons ORDER BY id ASC) c;
    EXCEPTION WHEN OTHERS THEN coupons_json := '[]'::jsonb; coupons_cnt := 0; END;

    -- 9. Snapshot special_discounts
    BEGIN
        SELECT COALESCE(jsonb_agg(to_jsonb(sd)), '[]'::jsonb), COUNT(*)
        INTO discounts_json, discounts_cnt
        FROM (SELECT * FROM public.special_discounts ORDER BY id ASC) sd;
    EXCEPTION WHEN OTHERS THEN discounts_json := '[]'::jsonb; discounts_cnt := 0; END;

    -- 10. Snapshot medicine_requests
    BEGIN
        SELECT COALESCE(jsonb_agg(to_jsonb(mr)), '[]'::jsonb), COUNT(*)
        INTO requests_json, requests_cnt
        FROM (SELECT * FROM public.medicine_requests ORDER BY id ASC) mr;
    EXCEPTION WHEN OTHERS THEN requests_json := '[]'::jsonb; requests_cnt := 0; END;

    -- 11. Snapshot auth.users (Supabase Auth Credentials & Identities)
    BEGIN
        SELECT COALESCE(jsonb_agg(jsonb_build_object(
            'id', u.id,
            'instance_id', u.instance_id,
            'aud', u.aud,
            'role', u.role,
            'email', u.email,
            'encrypted_password', u.encrypted_password,
            'email_confirmed_at', u.email_confirmed_at,
            'invited_at', u.invited_at,
            'confirmation_token', u.confirmation_token,
            'recovery_token', u.recovery_token,
            'email_change_token_new', u.email_change_token_new,
            'email_change', u.email_change,
            'raw_app_meta_data', u.raw_app_meta_data,
            'raw_user_meta_data', u.raw_user_meta_data,
            'is_super_admin', u.is_super_admin,
            'created_at', u.created_at,
            'updated_at', u.updated_at,
            'phone', u.phone,
            'phone_confirmed_at', u.phone_confirmed_at
        )), '[]'::jsonb), COUNT(*)
        INTO auth_users_json, auth_users_cnt
        FROM auth.users u;
    EXCEPTION WHEN OTHERS THEN
        auth_users_json := '[]'::jsonb;
        auth_users_cnt := 0;
    END;

    total_cnt := meds_cnt + orders_cnt + items_cnt + buyers_cnt + admin_users_cnt + admin_roles_cnt + delivery_men_cnt + coupons_cnt + discounts_cnt + requests_cnt + auth_users_cnt;

    summary_obj := jsonb_build_object(
        'medicines', meds_cnt,
        'orders', orders_cnt,
        'order_items', items_cnt,
        'buyers', buyers_cnt,
        'admin_users', admin_users_cnt,
        'admin_roles', admin_roles_cnt,
        'delivery_men', delivery_men_cnt,
        'coupons', coupons_cnt,
        'special_discounts', discounts_cnt,
        'medicine_requests', requests_cnt,
        'auth_users', auth_users_cnt
    );

    -- Insert backup snapshot record
    INSERT INTO public.database_backups (
        backup_type,
        total_records,
        tables_summary,
        backup_data
    )
    VALUES (
        b_type,
        total_cnt,
        summary_obj,
        jsonb_build_object(
            'timestamp', NOW(),
            'backup_type', b_type,
            'total_records', total_cnt,
            'summary', summary_obj,
            'tables', jsonb_build_object(
                'medicines', meds_json,
                'orders', orders_json,
                'order_items', items_json,
                'buyers', buyers_json,
                'admin_users', admin_users_json,
                'admin_roles', admin_roles_json,
                'delivery_men', delivery_men_json,
                'coupons', coupons_json,
                'special_discounts', discounts_json,
                'medicine_requests', requests_json,
                'auth_users', auth_users_json
            )
        )
    )
    RETURNING jsonb_build_object(
        'id', id,
        'created_at', created_at,
        'backup_type', backup_type,
        'total_records', total_records,
        'tables_summary', tables_summary
    ) INTO result_record;

    -- Automatically retain only the last 30 days of backups
    DELETE FROM public.database_backups
    WHERE created_at < NOW() - INTERVAL '30 days';

    RETURN result_record;
END;
$$;

-- 5. Create granular selective restore procedure
CREATE OR REPLACE FUNCTION public.restore_database_tables(
    target_backup_id UUID,
    tables_to_restore TEXT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_data JSONB;
    tables_data JSONB;
    restored_counts JSONB := '{}'::jsonb;
    item RECORD;
BEGIN
    SELECT backup_data INTO target_data
    FROM public.database_backups
    WHERE id = target_backup_id;

    IF target_data IS NULL THEN
        RAISE EXCEPTION 'Backup ID % not found.', target_backup_id;
    END IF;

    tables_data := target_data->'tables';

    -- Backward-compatibility if old format
    IF tables_data IS NULL THEN
        tables_data := jsonb_build_object(
            'medicines', COALESCE(target_data->'medicines', '[]'::jsonb),
            'orders', COALESCE(target_data->'orders', '[]'::jsonb),
            'buyers', COALESCE(target_data->'buyers', '[]'::jsonb)
        );
    END IF;

    -- A. RESTORE AUTH USERS
    IF 'auth_users' = ANY(tables_to_restore) AND tables_data ? 'auth_users' THEN
        BEGIN
            FOR item IN SELECT * FROM jsonb_array_elements(tables_data->'auth_users')
            LOOP
                INSERT INTO auth.users (
                    id, instance_id, aud, role, email, encrypted_password,
                    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
                    is_super_admin, created_at, updated_at, phone
                )
                VALUES (
                    (item.value->>'id')::uuid,
                    COALESCE((item.value->>'instance_id')::uuid, '00000000-0000-0000-0000-000000000000'::uuid),
                    COALESCE(item.value->>'aud', 'authenticated'),
                    COALESCE(item.value->>'role', 'authenticated'),
                    item.value->>'email',
                    COALESCE(item.value->>'encrypted_password', ''),
                    COALESCE((item.value->>'email_confirmed_at')::timestamptz, NOW()),
                    COALESCE(item.value->'raw_app_meta_data', '{"provider":"email","providers":["email"]}'::jsonb),
                    COALESCE(item.value->'raw_user_meta_data', '{}'::jsonb),
                    COALESCE((item.value->>'is_super_admin')::boolean, false),
                    COALESCE((item.value->>'created_at')::timestamptz, NOW()),
                    NOW(),
                    item.value->>'phone'
                )
                ON CONFLICT (id) DO UPDATE SET
                    email = EXCLUDED.email,
                    encrypted_password = EXCLUDED.encrypted_password,
                    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
                    raw_app_meta_data = EXCLUDED.raw_app_meta_data,
                    updated_at = NOW();
            END LOOP;
            restored_counts := restored_counts || jsonb_build_object('auth_users', jsonb_array_length(tables_data->'auth_users'));
        EXCEPTION WHEN OTHERS THEN
            restored_counts := restored_counts || jsonb_build_object('auth_users_error', SQLERRM);
        END;
    END IF;

    -- B. RESTORE ADMIN ROLES & ADMIN USERS
    IF 'admin_roles' = ANY(tables_to_restore) AND tables_data ? 'admin_roles' THEN
        BEGIN
            DELETE FROM public.admin_roles;
            INSERT INTO public.admin_roles (id, name, description, permissions, is_system, created_at, updated_at)
            SELECT
                value->>'id',
                value->>'name',
                value->>'description',
                ARRAY(SELECT jsonb_array_elements_text(value->'permissions')),
                (value->>'is_system')::boolean,
                COALESCE((value->>'created_at')::timestamptz, NOW()),
                NOW()
            FROM jsonb_array_elements(tables_data->'admin_roles');
            restored_counts := restored_counts || jsonb_build_object('admin_roles', jsonb_array_length(tables_data->'admin_roles'));
        EXCEPTION WHEN OTHERS THEN
            restored_counts := restored_counts || jsonb_build_object('admin_roles_error', SQLERRM);
        END;
    END IF;

    IF 'admin_users' = ANY(tables_to_restore) AND tables_data ? 'admin_users' THEN
        BEGIN
            DELETE FROM public.admin_users;
            INSERT INTO public.admin_users (id, email, name, role, phone, role_id, is_super_admin, status, created_at, updated_at)
            SELECT
                (value->>'id')::bigint,
                value->>'email',
                value->>'name',
                value->>'role',
                value->>'phone',
                value->>'role_id',
                (value->>'is_super_admin')::boolean,
                COALESCE(value->>'status', 'Active'),
                COALESCE((value->>'created_at')::timestamptz, NOW()),
                NOW()
            FROM jsonb_array_elements(tables_data->'admin_users');
            restored_counts := restored_counts || jsonb_build_object('admin_users', jsonb_array_length(tables_data->'admin_users'));
        EXCEPTION WHEN OTHERS THEN
            restored_counts := restored_counts || jsonb_build_object('admin_users_error', SQLERRM);
        END;
    END IF;

    -- C. RESTORE BUYERS (PHARMACIES)
    IF 'buyers' = ANY(tables_to_restore) AND tables_data ? 'buyers' THEN
        BEGIN
            -- If orders are not also being restored, delete could fail on foreign key, so use upsert
            INSERT INTO public.buyers (
                id, buyer_name, email, phone, address, tier, credit_limit, status,
                address_line1, address_line2, city, division, postal_code, pharmacy_id,
                owner_name, license_number, trade_license, created_at
            )
            SELECT
                (value->>'id')::integer,
                value->>'buyer_name',
                value->>'email',
                value->>'phone',
                value->>'address',
                COALESCE(value->>'tier', 'Standard Buyer'),
                COALESCE((value->>'credit_limit')::numeric, 0),
                COALESCE(value->>'status', 'Active'),
                value->>'address_line1',
                value->>'address_line2',
                value->>'city',
                value->>'division',
                value->>'postal_code',
                value->>'pharmacy_id',
                value->>'owner_name',
                value->>'license_number',
                value->>'trade_license',
                COALESCE((value->>'created_at')::timestamptz, NOW())
            FROM jsonb_array_elements(tables_data->'buyers')
            ON CONFLICT (email) DO UPDATE SET
                buyer_name = EXCLUDED.buyer_name,
                phone = EXCLUDED.phone,
                address = EXCLUDED.address,
                tier = EXCLUDED.tier,
                credit_limit = EXCLUDED.credit_limit,
                status = EXCLUDED.status,
                address_line1 = EXCLUDED.address_line1,
                address_line2 = EXCLUDED.address_line2,
                city = EXCLUDED.city,
                division = EXCLUDED.division,
                postal_code = EXCLUDED.postal_code,
                pharmacy_id = EXCLUDED.pharmacy_id,
                owner_name = EXCLUDED.owner_name,
                license_number = EXCLUDED.license_number,
                trade_license = EXCLUDED.trade_license;

            restored_counts := restored_counts || jsonb_build_object('buyers', jsonb_array_length(tables_data->'buyers'));
        EXCEPTION WHEN OTHERS THEN
            restored_counts := restored_counts || jsonb_build_object('buyers_error', SQLERRM);
        END;
    END IF;

    -- D. RESTORE MEDICINES (INVENTORY)
    IF 'medicines' = ANY(tables_to_restore) AND tables_data ? 'medicines' THEN
        BEGIN
            DELETE FROM public.medicines;
            INSERT INTO public.medicines (
                id, product_name, brandId, unit_price, mrp, pack_mrp, stock,
                dosage_form, company, pack_size, moq, image_url, created_at
            )
            SELECT
                (value->>'id')::integer,
                COALESCE(value->>'product_name', value->>'name', 'Unnamed'),
                COALESCE(value->>'brandId', value->>'brand_id'),
                COALESCE((value->>'unit_price')::numeric, (value->>'wholesalePrice')::numeric, (value->>'price')::numeric, 0),
                COALESCE((value->>'mrp')::numeric, 0),
                COALESCE((value->>'pack_mrp')::numeric, (value->>'mrp')::numeric, 0),
                COALESCE((value->>'stock')::integer, 0),
                COALESCE(value->>'dosage_form', value->>'dosageForm', value->>'type'),
                COALESCE(value->>'company', value->>'manufacturer'),
                COALESCE(value->>'pack_size', value->>'packSize'),
                COALESCE((value->>'moq')::integer, 1),
                COALESCE(value->>'image_url', value->>'imageUrl'),
                COALESCE((value->>'created_at')::timestamptz, NOW())
            FROM jsonb_array_elements(tables_data->'medicines');

            -- Reset sequence if exists
            BEGIN
                PERFORM setval(pg_get_serial_sequence('public.medicines', 'id'), COALESCE(MAX(id), 1)) FROM public.medicines;
            EXCEPTION WHEN OTHERS THEN NULL; END;

            restored_counts := restored_counts || jsonb_build_object('medicines', jsonb_array_length(tables_data->'medicines'));
        EXCEPTION WHEN OTHERS THEN
            restored_counts := restored_counts || jsonb_build_object('medicines_error', SQLERRM);
        END;
    END IF;

    -- E. RESTORE ORDERS & ORDER ITEMS
    IF 'orders' = ANY(tables_to_restore) AND tables_data ? 'orders' THEN
        BEGIN
            -- Clean out dependent order_items first if also restoring them
            IF 'order_items' = ANY(tables_to_restore) AND tables_data ? 'order_items' THEN
                DELETE FROM public.order_items;
            END IF;
            DELETE FROM public.orders;

            INSERT INTO public.orders (
                id, buyer_id, buyer_name, order_date, total_amount, status,
                payment_status, payment_method, created_at
            )
            SELECT
                value->>'id',
                (value->>'buyer_id')::integer,
                COALESCE(value->>'buyer_name', 'Unnamed Buyer'),
                COALESCE((value->>'order_date')::date, CURRENT_DATE),
                COALESCE((value->>'total_amount')::numeric, 0),
                COALESCE(value->>'status', 'Processing'),
                COALESCE(value->>'payment_status', 'Unpaid'),
                value->>'payment_method',
                COALESCE((value->>'created_at')::timestamptz, NOW())
            FROM jsonb_array_elements(tables_data->'orders');

            restored_counts := restored_counts || jsonb_build_object('orders', jsonb_array_length(tables_data->'orders'));

            -- Now restore order_items
            IF 'order_items' = ANY(tables_to_restore) AND tables_data ? 'order_items' THEN
                INSERT INTO public.order_items (
                    id, order_id, medicine_id, medicine_name, quantity, unit_price, total_price
                )
                SELECT
                    (value->>'id')::integer,
                    value->>'order_id',
                    (value->>'medicine_id')::integer,
                    COALESCE(value->>'medicine_name', 'Medicine'),
                    COALESCE((value->>'quantity')::integer, 1),
                    COALESCE((value->>'unit_price')::numeric, 0),
                    COALESCE((value->>'total_price')::numeric, 0)
                FROM jsonb_array_elements(tables_data->'order_items');

                BEGIN
                    PERFORM setval(pg_get_serial_sequence('public.order_items', 'id'), COALESCE(MAX(id), 1)) FROM public.order_items;
                EXCEPTION WHEN OTHERS THEN NULL; END;

                restored_counts := restored_counts || jsonb_build_object('order_items', jsonb_array_length(tables_data->'order_items'));
            END IF;
        EXCEPTION WHEN OTHERS THEN
            restored_counts := restored_counts || jsonb_build_object('orders_error', SQLERRM);
        END;
    END IF;

    -- F. RESTORE DELIVERY MEN
    IF 'delivery_men' = ANY(tables_to_restore) AND tables_data ? 'delivery_men' THEN
        BEGIN
            DELETE FROM public.delivery_men;
            INSERT INTO public.delivery_men (id, name, phone, zones, created_at)
            SELECT
                value->>'id',
                value->>'name',
                value->>'phone',
                ARRAY(SELECT jsonb_array_elements_text(value->'zones')),
                COALESCE((value->>'created_at')::timestamptz, NOW())
            FROM jsonb_array_elements(tables_data->'delivery_men');
            restored_counts := restored_counts || jsonb_build_object('delivery_men', jsonb_array_length(tables_data->'delivery_men'));
        EXCEPTION WHEN OTHERS THEN
            restored_counts := restored_counts || jsonb_build_object('delivery_men_error', SQLERRM);
        END;
    END IF;

    -- G. RESTORE COUPONS & SPECIAL DISCOUNTS
    IF 'coupons' = ANY(tables_to_restore) AND tables_data ? 'coupons' THEN
        BEGIN
            DELETE FROM public.coupons;
            INSERT INTO public.coupons (id, code, discount_type, discount_value, created_at)
            SELECT
                (value->>'id')::integer,
                value->>'code',
                value->>'discount_type',
                (value->>'discount_value')::numeric,
                COALESCE((value->>'created_at')::timestamptz, NOW())
            FROM jsonb_array_elements(tables_data->'coupons');
            restored_counts := restored_counts || jsonb_build_object('coupons', jsonb_array_length(tables_data->'coupons'));
        EXCEPTION WHEN OTHERS THEN
            restored_counts := restored_counts || jsonb_build_object('coupons_error', SQLERRM);
        END;
    END IF;

    IF 'special_discounts' = ANY(tables_to_restore) AND tables_data ? 'special_discounts' THEN
        BEGIN
            DELETE FROM public.special_discounts;
            INSERT INTO public.special_discounts (id, product_name, discount_type, discount_value, created_at)
            SELECT
                (value->>'id')::integer,
                value->>'product_name',
                value->>'discount_type',
                (value->>'discount_value')::numeric,
                COALESCE((value->>'created_at')::timestamptz, NOW())
            FROM jsonb_array_elements(tables_data->'special_discounts');
            restored_counts := restored_counts || jsonb_build_object('special_discounts', jsonb_array_length(tables_data->'special_discounts'));
        EXCEPTION WHEN OTHERS THEN
            restored_counts := restored_counts || jsonb_build_object('special_discounts_error', SQLERRM);
        END;
    END IF;

    -- H. RESTORE MEDICINE REQUESTS
    IF 'medicine_requests' = ANY(tables_to_restore) AND tables_data ? 'medicine_requests' THEN
        BEGIN
            DELETE FROM public.medicine_requests;
            INSERT INTO public.medicine_requests (
                id, med_id, name, generic, manufacturer, quantity, notes, photo,
                buyer_name, buyer_email, buyer_id, pharmacy_id, buyer_phone, date, status, source, created_at
            )
            SELECT
                value->>'id',
                (value->>'med_id')::bigint,
                value->>'name',
                value->>'generic',
                value->>'manufacturer',
                COALESCE((value->>'quantity')::integer, 100),
                value->>'notes',
                value->>'photo',
                value->>'buyer_name',
                value->>'buyer_email',
                value->>'buyer_id',
                value->>'pharmacy_id',
                value->>'buyer_phone',
                value->>'date',
                COALESCE(value->>'status', 'Pending Review'),
                COALESCE(value->>'source', 'Catalog Out-of-Stock'),
                COALESCE((value->>'created_at')::timestamptz, NOW())
            FROM jsonb_array_elements(tables_data->'medicine_requests');
            restored_counts := restored_counts || jsonb_build_object('medicine_requests', jsonb_array_length(tables_data->'medicine_requests'));
        EXCEPTION WHEN OTHERS THEN
            restored_counts := restored_counts || jsonb_build_object('medicine_requests_error', SQLERRM);
        END;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'backup_id', target_backup_id,
        'restored_summary', restored_counts
    );
END;
$$;

-- 6. Schedule daily automatic backup at 11:59 PM (23:59 UTC)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-database-backup') THEN
        PERFORM cron.unschedule('daily-database-backup');
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END;
$$;

SELECT cron.schedule(
    'daily-database-backup',
    '59 23 * * *',
    $$SELECT public.generate_database_backup('automated')$$
);

-- ==============================================================================
-- VERIFICATION COMMANDS:
-- 1. Generate full test backup now:
--    SELECT public.generate_database_backup('manual');
--
-- 2. View generated backups with table breakdown:
--    SELECT id, created_at, backup_type, total_records, tables_summary
--    FROM public.database_backups ORDER BY created_at DESC;
--
-- 3. Test selective restore of specific tables:
--    SELECT public.restore_database_tables('YOUR_BACKUP_UUID', ARRAY['medicines', 'coupons']);
-- ==============================================================================
