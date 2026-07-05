-- sql-add-photos.sql
-- Camera Roll photos: table + lookbook storage bucket.
-- Applied to production 2026-07-04 via Supabase Management API.

CREATE TABLE IF NOT EXISTS public.photos (
    id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url    TEXT        NOT NULL,
    storage_path TEXT        NOT NULL DEFAULT '',
    sort_order   INTEGER     NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Photos viewable by everyone"
    ON public.photos FOR SELECT USING (true);

CREATE POLICY "Admins can insert photos"
    ON public.photos FOR INSERT
    WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can update photos"
    ON public.photos FOR UPDATE
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can delete photos"
    ON public.photos FOR DELETE
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Storage bucket for direct uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('lookbook', 'lookbook', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Lookbook publicly viewable"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'lookbook');

CREATE POLICY "Admins can upload lookbook"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'lookbook'
        AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Admins can update lookbook"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'lookbook'
        AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Admins can delete lookbook"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'lookbook'
        AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Seed with the photos that were previously hardcoded (same order)
INSERT INTO public.photos (image_url, sort_order)
SELECT * FROM (VALUES
    ('/Lookbook/Lookbook39.JPEG', 1),
    ('/Lookbook/WhiteTee2.png',   2),
    ('/Lookbook/Lookbook18.jpeg', 3),
    ('/Lookbook/Lookbook19.jpeg', 4),
    ('/Lookbook/Lookbook40.jpg',  5),
    ('/Lookbook/Lookbook29.PNG',  6),
    ('/Lookbook/Lookbook5.JPEG',  7),
    ('/Lookbook/Lookbook9.jpg',   8),
    ('/Lookbook/Lookbook38.JPG',  9),
    ('/Lookbook/Lookbook2.JPEG',  10),
    ('/Lookbook/Lookbook1.JPEG',  11),
    ('/Lookbook/Lookbook8.jpg',   12),
    ('/Lookbook/Lookbook37.JPG',  13),
    ('/MLookbook/Lookbook10.jpg', 14),
    ('/Lookbook/Lookbook12.jpeg', 15),
    ('/Lookbook/Lookbook14.jpeg', 16),
    ('/Lookbook/Lookbook36.jpg',  17),
    ('/Lookbook/Lookbook22.jpeg', 18),
    ('/Lookbook/Lookbook16.JPG',  19),
    ('/Lookbook/Lookbook35.PNG',  20),
    ('/Lookbook/Lookbook4.JPEG',  21),
    ('/Lookbook/Lookbook3.JPEG',  22),
    ('/Lookbook/Lookbook11.jpg',  23)
) AS seed(image_url, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.photos);
