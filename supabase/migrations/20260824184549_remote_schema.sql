


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."complaint_category" AS ENUM (
    'garbage_dump',
    'overflowing_bin',
    'illegal_dumping',
    'plastic_waste',
    'construction_waste',
    'dead_animal',
    'sewage',
    'public_toilet',
    'other'
);


ALTER TYPE "public"."complaint_category" OWNER TO "postgres";


CREATE TYPE "public"."complaint_image_type" AS ENUM (
    'report',
    'before',
    'after'
);


ALTER TYPE "public"."complaint_image_type" OWNER TO "postgres";


CREATE TYPE "public"."complaint_status" AS ENUM (
    'reported',
    'acknowledged',
    'assigned',
    'scheduled',
    'in_progress',
    'completed',
    'citizen_verification',
    'closed',
    'reopened',
    'rejected'
);


ALTER TYPE "public"."complaint_status" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'citizen',
    'officer',
    'admin'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.profiles (
    id,
    full_name
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."cleanup_drives" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "municipality_id" "uuid",
    "ward_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "location" "text",
    "latitude" double precision,
    "longitude" double precision,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone,
    "max_volunteers" integer,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."cleanup_drives" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cleanup_volunteers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cleanup_drive_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."cleanup_volunteers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."complaint_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "complaint_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "comment" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."complaint_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."complaint_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "complaint_id" "uuid" NOT NULL,
    "uploaded_by" "uuid" NOT NULL,
    "image_type" "public"."complaint_image_type" DEFAULT 'report'::"public"."complaint_image_type" NOT NULL,
    "storage_path" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."complaint_images" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."complaint_status_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "complaint_id" "uuid" NOT NULL,
    "status" "public"."complaint_status" NOT NULL,
    "changed_by" "uuid",
    "note" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."complaint_status_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."complaint_votes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "complaint_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."complaint_votes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."complaints" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "citizen_id" "uuid" NOT NULL,
    "municipality_id" "uuid",
    "ward_id" "uuid",
    "assigned_officer_id" "uuid",
    "category" "public"."complaint_category" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "latitude" double precision NOT NULL,
    "longitude" double precision NOT NULL,
    "address" "text",
    "status" "public"."complaint_status" DEFAULT 'reported'::"public"."complaint_status" NOT NULL,
    "priority_score" integer DEFAULT 0 NOT NULL,
    "vote_count" integer DEFAULT 0 NOT NULL,
    "is_duplicate" boolean DEFAULT false NOT NULL,
    "duplicate_of" "uuid",
    "reported_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "acknowledged_at" timestamp with time zone,
    "assigned_at" timestamp with time zone,
    "scheduled_at" timestamp with time zone,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "closed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."complaints" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."municipalities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "state" "text" NOT NULL,
    "district" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."municipalities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "complaint_id" "uuid",
    "is_read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "phone" "text",
    "role" "public"."user_role" DEFAULT 'citizen'::"public"."user_role" NOT NULL,
    "municipality_id" "uuid",
    "ward_id" "uuid",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."wards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "municipality_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "ward_number" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."wards" OWNER TO "postgres";


ALTER TABLE ONLY "public"."cleanup_drives"
    ADD CONSTRAINT "cleanup_drives_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cleanup_volunteers"
    ADD CONSTRAINT "cleanup_volunteers_cleanup_drive_id_user_id_key" UNIQUE ("cleanup_drive_id", "user_id");



ALTER TABLE ONLY "public"."cleanup_volunteers"
    ADD CONSTRAINT "cleanup_volunteers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."complaint_comments"
    ADD CONSTRAINT "complaint_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."complaint_images"
    ADD CONSTRAINT "complaint_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."complaint_status_history"
    ADD CONSTRAINT "complaint_status_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."complaint_votes"
    ADD CONSTRAINT "complaint_votes_complaint_id_user_id_key" UNIQUE ("complaint_id", "user_id");



ALTER TABLE ONLY "public"."complaint_votes"
    ADD CONSTRAINT "complaint_votes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."complaints"
    ADD CONSTRAINT "complaints_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."municipalities"
    ADD CONSTRAINT "municipalities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wards"
    ADD CONSTRAINT "wards_pkey" PRIMARY KEY ("id");



CREATE INDEX "complaint_votes_complaint_idx" ON "public"."complaint_votes" USING "btree" ("complaint_id");



CREATE INDEX "complaints_citizen_id_idx" ON "public"."complaints" USING "btree" ("citizen_id");



CREATE INDEX "complaints_created_at_idx" ON "public"."complaints" USING "btree" ("created_at" DESC);



CREATE INDEX "complaints_municipality_id_idx" ON "public"."complaints" USING "btree" ("municipality_id");



CREATE INDEX "complaints_officer_id_idx" ON "public"."complaints" USING "btree" ("assigned_officer_id");



CREATE INDEX "complaints_priority_idx" ON "public"."complaints" USING "btree" ("priority_score" DESC);



CREATE INDEX "complaints_status_idx" ON "public"."complaints" USING "btree" ("status");



CREATE INDEX "complaints_ward_id_idx" ON "public"."complaints" USING "btree" ("ward_id");



CREATE INDEX "status_history_complaint_idx" ON "public"."complaint_status_history" USING "btree" ("complaint_id");



ALTER TABLE ONLY "public"."cleanup_drives"
    ADD CONSTRAINT "cleanup_drives_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."cleanup_drives"
    ADD CONSTRAINT "cleanup_drives_municipality_id_fkey" FOREIGN KEY ("municipality_id") REFERENCES "public"."municipalities"("id");



ALTER TABLE ONLY "public"."cleanup_drives"
    ADD CONSTRAINT "cleanup_drives_ward_id_fkey" FOREIGN KEY ("ward_id") REFERENCES "public"."wards"("id");



ALTER TABLE ONLY "public"."cleanup_volunteers"
    ADD CONSTRAINT "cleanup_volunteers_cleanup_drive_id_fkey" FOREIGN KEY ("cleanup_drive_id") REFERENCES "public"."cleanup_drives"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cleanup_volunteers"
    ADD CONSTRAINT "cleanup_volunteers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."complaint_comments"
    ADD CONSTRAINT "complaint_comments_complaint_id_fkey" FOREIGN KEY ("complaint_id") REFERENCES "public"."complaints"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."complaint_comments"
    ADD CONSTRAINT "complaint_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."complaint_images"
    ADD CONSTRAINT "complaint_images_complaint_id_fkey" FOREIGN KEY ("complaint_id") REFERENCES "public"."complaints"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."complaint_images"
    ADD CONSTRAINT "complaint_images_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."complaint_status_history"
    ADD CONSTRAINT "complaint_status_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."complaint_status_history"
    ADD CONSTRAINT "complaint_status_history_complaint_id_fkey" FOREIGN KEY ("complaint_id") REFERENCES "public"."complaints"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."complaint_votes"
    ADD CONSTRAINT "complaint_votes_complaint_id_fkey" FOREIGN KEY ("complaint_id") REFERENCES "public"."complaints"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."complaint_votes"
    ADD CONSTRAINT "complaint_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."complaints"
    ADD CONSTRAINT "complaints_assigned_officer_id_fkey" FOREIGN KEY ("assigned_officer_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."complaints"
    ADD CONSTRAINT "complaints_citizen_id_fkey" FOREIGN KEY ("citizen_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."complaints"
    ADD CONSTRAINT "complaints_duplicate_of_fkey" FOREIGN KEY ("duplicate_of") REFERENCES "public"."complaints"("id");



ALTER TABLE ONLY "public"."complaints"
    ADD CONSTRAINT "complaints_municipality_id_fkey" FOREIGN KEY ("municipality_id") REFERENCES "public"."municipalities"("id");



ALTER TABLE ONLY "public"."complaints"
    ADD CONSTRAINT "complaints_ward_id_fkey" FOREIGN KEY ("ward_id") REFERENCES "public"."wards"("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_complaint_id_fkey" FOREIGN KEY ("complaint_id") REFERENCES "public"."complaints"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_municipality_id_fkey" FOREIGN KEY ("municipality_id") REFERENCES "public"."municipalities"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_ward_id_fkey" FOREIGN KEY ("ward_id") REFERENCES "public"."wards"("id");



ALTER TABLE ONLY "public"."wards"
    ADD CONSTRAINT "wards_municipality_id_fkey" FOREIGN KEY ("municipality_id") REFERENCES "public"."municipalities"("id") ON DELETE CASCADE;



CREATE POLICY "Authenticated users can view cleanup drives" ON "public"."cleanup_drives" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view comments" ON "public"."complaint_comments" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view complaints" ON "public"."complaints" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view municipalities" ON "public"."municipalities" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view status history" ON "public"."complaint_status_history" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view votes" ON "public"."complaint_votes" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view wards" ON "public"."wards" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Citizens can create complaints" ON "public"."complaints" FOR INSERT TO "authenticated" WITH CHECK (("citizen_id" = "auth"."uid"()));



CREATE POLICY "Citizens can update own complaints" ON "public"."complaints" FOR UPDATE TO "authenticated" USING (("citizen_id" = "auth"."uid"())) WITH CHECK (("citizen_id" = "auth"."uid"()));



CREATE POLICY "Users can create comments" ON "public"."complaint_comments" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can join cleanup drives" ON "public"."cleanup_volunteers" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can leave cleanup drives" ON "public"."cleanup_volunteers" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can remove own vote" ON "public"."complaint_votes" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update own comments" ON "public"."complaint_comments" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update own notifications" ON "public"."notifications" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "Users can view own notifications" ON "public"."notifications" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("id" = "auth"."uid"()));



CREATE POLICY "Users can view volunteer registrations" ON "public"."cleanup_volunteers" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can vote" ON "public"."complaint_votes" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."cleanup_drives" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cleanup_volunteers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."complaint_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."complaint_images" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."complaint_status_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."complaint_votes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."complaints" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."municipalities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."wards" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."complaint_comments";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."complaint_status_history";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."complaint_votes";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."complaints";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."notifications";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";


















GRANT ALL ON TABLE "public"."cleanup_drives" TO "anon";
GRANT ALL ON TABLE "public"."cleanup_drives" TO "authenticated";
GRANT ALL ON TABLE "public"."cleanup_drives" TO "service_role";



GRANT ALL ON TABLE "public"."cleanup_volunteers" TO "anon";
GRANT ALL ON TABLE "public"."cleanup_volunteers" TO "authenticated";
GRANT ALL ON TABLE "public"."cleanup_volunteers" TO "service_role";



GRANT ALL ON TABLE "public"."complaint_comments" TO "anon";
GRANT ALL ON TABLE "public"."complaint_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."complaint_comments" TO "service_role";



GRANT ALL ON TABLE "public"."complaint_images" TO "anon";
GRANT ALL ON TABLE "public"."complaint_images" TO "authenticated";
GRANT ALL ON TABLE "public"."complaint_images" TO "service_role";



GRANT ALL ON TABLE "public"."complaint_status_history" TO "anon";
GRANT ALL ON TABLE "public"."complaint_status_history" TO "authenticated";
GRANT ALL ON TABLE "public"."complaint_status_history" TO "service_role";



GRANT ALL ON TABLE "public"."complaint_votes" TO "anon";
GRANT ALL ON TABLE "public"."complaint_votes" TO "authenticated";
GRANT ALL ON TABLE "public"."complaint_votes" TO "service_role";



GRANT ALL ON TABLE "public"."complaints" TO "anon";
GRANT ALL ON TABLE "public"."complaints" TO "authenticated";
GRANT ALL ON TABLE "public"."complaints" TO "service_role";



GRANT ALL ON TABLE "public"."municipalities" TO "anon";
GRANT ALL ON TABLE "public"."municipalities" TO "authenticated";
GRANT ALL ON TABLE "public"."municipalities" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."wards" TO "anon";
GRANT ALL ON TABLE "public"."wards" TO "authenticated";
GRANT ALL ON TABLE "public"."wards" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































