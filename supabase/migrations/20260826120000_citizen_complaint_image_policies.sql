-- Citizens may only add and view image metadata for complaints they reported.
CREATE POLICY "Citizens can view own complaint images"
ON public.complaint_images FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.complaints WHERE complaints.id = complaint_images.complaint_id AND complaints.citizen_id = auth.uid()));

CREATE POLICY "Citizens can add own complaint images"
ON public.complaint_images FOR INSERT TO authenticated
WITH CHECK (uploaded_by = auth.uid() AND EXISTS (SELECT 1 FROM public.complaints WHERE complaints.id = complaint_images.complaint_id AND complaints.citizen_id = auth.uid()));

-- The bucket already exists. The first path segment is the complaint UUID.
CREATE POLICY "Citizens can upload own complaint files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'complaint-images' AND (storage.foldername(name))[1] IN (SELECT id::text FROM public.complaints WHERE citizen_id = auth.uid()));

CREATE POLICY "Citizens can view own complaint files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'complaint-images' AND (storage.foldername(name))[1] IN (SELECT id::text FROM public.complaints WHERE citizen_id = auth.uid()));
