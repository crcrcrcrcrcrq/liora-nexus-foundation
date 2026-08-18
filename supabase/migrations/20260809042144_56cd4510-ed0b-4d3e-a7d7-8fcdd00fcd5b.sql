INSERT INTO public.booking_schedule (weekday, from_time, to_time, is_active)
SELECT w, '10:00'::time, '18:00'::time, true
FROM unnest(ARRAY[1,2,3,4,5]) AS w
WHERE NOT EXISTS (SELECT 1 FROM public.booking_schedule);