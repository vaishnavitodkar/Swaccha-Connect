-- Keep the existing nullable relationship columns, but prevent mismatched ward/municipality pairs.
CREATE OR REPLACE FUNCTION public.validate_complaint_ward_municipality()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.municipality_id IS NOT NULL AND NEW.ward_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.wards
      WHERE id = NEW.ward_id AND municipality_id = NEW.municipality_id
    ) THEN
    RAISE EXCEPTION 'Selected ward does not belong to the selected municipality';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_complaint_ward_municipality_trigger
BEFORE INSERT OR UPDATE OF municipality_id, ward_id ON public.complaints
FOR EACH ROW EXECUTE FUNCTION public.validate_complaint_ward_municipality();
