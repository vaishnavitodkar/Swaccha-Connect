### tables
| table_name               |
| ------------------------ |
| cleanup_drives           |
| cleanup_volunteers       |
| complaint_comments       |
| complaint_images         |
| complaint_status_history |
| complaint_votes          |
| complaints               |
| municipalities           |
| notifications            |
| profiles                 |
| wards                    |

### columns
| table_name               | column_name         | data_type                | is_nullable | column_default                 |
| ------------------------ | ------------------- | ------------------------ | ----------- | ------------------------------ |
| cleanup_drives           | id                  | uuid                     | NO          | gen_random_uuid()              |
| cleanup_drives           | municipality_id     | uuid                     | YES         | null                           |
| cleanup_drives           | ward_id             | uuid                     | YES         | null                           |
| cleanup_drives           | title               | text                     | NO          | null                           |
| cleanup_drives           | description         | text                     | YES         | null                           |
| cleanup_drives           | location            | text                     | YES         | null                           |
| cleanup_drives           | latitude            | double precision         | YES         | null                           |
| cleanup_drives           | longitude           | double precision         | YES         | null                           |
| cleanup_drives           | start_time          | timestamp with time zone | NO          | null                           |
| cleanup_drives           | end_time            | timestamp with time zone | YES         | null                           |
| cleanup_drives           | max_volunteers      | integer                  | YES         | null                           |
| cleanup_drives           | created_by          | uuid                     | YES         | null                           |
| cleanup_drives           | created_at          | timestamp with time zone | NO          | now()                          |
| cleanup_volunteers       | id                  | uuid                     | NO          | gen_random_uuid()              |
| cleanup_volunteers       | cleanup_drive_id    | uuid                     | NO          | null                           |
| cleanup_volunteers       | user_id             | uuid                     | NO          | null                           |
| cleanup_volunteers       | joined_at           | timestamp with time zone | NO          | now()                          |
| complaint_comments       | id                  | uuid                     | NO          | gen_random_uuid()              |
| complaint_comments       | complaint_id        | uuid                     | NO          | null                           |
| complaint_comments       | user_id             | uuid                     | NO          | null                           |
| complaint_comments       | comment             | text                     | NO          | null                           |
| complaint_comments       | created_at          | timestamp with time zone | NO          | now()                          |
| complaint_comments       | updated_at          | timestamp with time zone | NO          | now()                          |
| complaint_images         | id                  | uuid                     | NO          | gen_random_uuid()              |
| complaint_images         | complaint_id        | uuid                     | NO          | null                           |
| complaint_images         | uploaded_by         | uuid                     | NO          | null                           |
| complaint_images         | image_type          | USER-DEFINED             | NO          | 'report'::complaint_image_type |
| complaint_images         | storage_path        | text                     | NO          | null                           |
| complaint_images         | created_at          | timestamp with time zone | NO          | now()                          |
| complaint_status_history | id                  | uuid                     | NO          | gen_random_uuid()              |
| complaint_status_history | complaint_id        | uuid                     | NO          | null                           |
| complaint_status_history | status              | USER-DEFINED             | NO          | null                           |
| complaint_status_history | changed_by          | uuid                     | YES         | null                           |
| complaint_status_history | note                | text                     | YES         | null                           |
| complaint_status_history | created_at          | timestamp with time zone | NO          | now()                          |
| complaint_votes          | id                  | uuid                     | NO          | gen_random_uuid()              |
| complaint_votes          | complaint_id        | uuid                     | NO          | null                           |
| complaint_votes          | user_id             | uuid                     | NO          | null                           |
| complaint_votes          | created_at          | timestamp with time zone | NO          | now()                          |
| complaints               | id                  | uuid                     | NO          | gen_random_uuid()              |
| complaints               | citizen_id          | uuid                     | NO          | null                           |
| complaints               | municipality_id     | uuid                     | YES         | null                           |
| complaints               | ward_id             | uuid                     | YES         | null                           |
| complaints               | assigned_officer_id | uuid                     | YES         | null                           |
| complaints               | category            | USER-DEFINED             | NO          | null                           |
| complaints               | title               | text                     | NO          | null                           |
| complaints               | description         | text                     | YES         | null                           |
| complaints               | latitude            | double precision         | NO          | null                           |
| complaints               | longitude           | double precision         | NO          | null                           |
| complaints               | address             | text                     | YES         | null                           |
| complaints               | status              | USER-DEFINED             | NO          | 'reported'::complaint_status   |
| complaints               | priority_score      | integer                  | NO          | 0                              |
| complaints               | vote_count          | integer                  | NO          | 0                              |
| complaints               | is_duplicate        | boolean                  | NO          | false                          |
| complaints               | duplicate_of        | uuid                     | YES         | null                           |
| complaints               | reported_at         | timestamp with time zone | NO          | now()                          |
| complaints               | acknowledged_at     | timestamp with time zone | YES         | null                           |
| complaints               | assigned_at         | timestamp with time zone | YES         | null                           |
| complaints               | scheduled_at        | timestamp with time zone | YES         | null                           |
| complaints               | started_at          | timestamp with time zone | YES         | null                           |
| complaints               | completed_at        | timestamp with time zone | YES         | null                           |
| complaints               | closed_at           | timestamp with time zone | YES         | null                           |
| complaints               | created_at          | timestamp with time zone | NO          | now()                          |
| complaints               | updated_at          | timestamp with time zone | NO          | now()                          |
| municipalities           | id                  | uuid                     | NO          | gen_random_uuid()              |
| municipalities           | name                | text                     | NO          | null                           |
| municipalities           | state               | text                     | NO          | null                           |
| municipalities           | district            | text                     | YES         | null                           |
| municipalities           | created_at          | timestamp with time zone | NO          | now()                          |
| notifications            | id                  | uuid                     | NO          | gen_random_uuid()              |
| notifications            | user_id             | uuid                     | NO          | null                           |
| notifications            | title               | text                     | NO          | null                           |
| notifications            | message             | text                     | NO          | null                           |
| notifications            | complaint_id        | uuid                     | YES         | null                           |
| notifications            | is_read             | boolean                  | NO          | false                          |
| notifications            | created_at          | timestamp with time zone | NO          | now()                          |
| profiles                 | id                  | uuid                     | NO          | null                           |
| profiles                 | full_name           | text                     | YES         | null                           |
| profiles                 | phone               | text                     | YES         | null                           |
| profiles                 | role                | USER-DEFINED             | NO          | 'citizen'::user_role           |
| profiles                 | municipality_id     | uuid                     | YES         | null                           |
| profiles                 | ward_id             | uuid                     | YES         | null                           |
| profiles                 | avatar_url          | text                     | YES         | null                           |
| profiles                 | created_at          | timestamp with time zone | NO          | now()                          |
| profiles                 | updated_at          | timestamp with time zone | NO          | now()                          |
| wards                    | id                  | uuid                     | NO          | gen_random_uuid()              |
| wards                    | municipality_id     | uuid                     | NO          | null                           |
| wards                    | name                | text                     | NO          | null                           |
| wards                    | ward_number         | text                     | YES         | null                           |
| wards                    | created_at          | timestamp with time zone | NO          | now()                          |

### RLS policies
| schemaname | tablename                | policyname                                  | permissive | roles           | cmd    | qual                      | with_check                |
| ---------- | ------------------------ | ------------------------------------------- | ---------- | --------------- | ------ | ------------------------- | ------------------------- |
| public     | cleanup_drives           | Authenticated users can view cleanup drives | PERMISSIVE | {authenticated} | SELECT | true                      | null                      |
| public     | cleanup_volunteers       | Users can join cleanup drives               | PERMISSIVE | {authenticated} | INSERT | null                      | (user_id = auth.uid())    |
| public     | cleanup_volunteers       | Users can leave cleanup drives              | PERMISSIVE | {authenticated} | DELETE | (user_id = auth.uid())    | null                      |
| public     | cleanup_volunteers       | Users can view volunteer registrations      | PERMISSIVE | {authenticated} | SELECT | true                      | null                      |
| public     | complaint_comments       | Authenticated users can view comments       | PERMISSIVE | {authenticated} | SELECT | true                      | null                      |
| public     | complaint_comments       | Users can create comments                   | PERMISSIVE | {authenticated} | INSERT | null                      | (user_id = auth.uid())    |
| public     | complaint_comments       | Users can update own comments               | PERMISSIVE | {authenticated} | UPDATE | (user_id = auth.uid())    | (user_id = auth.uid())    |
| public     | complaint_status_history | Authenticated users can view status history | PERMISSIVE | {authenticated} | SELECT | true                      | null                      |
| public     | complaint_votes          | Authenticated users can view votes          | PERMISSIVE | {authenticated} | SELECT | true                      | null                      |
| public     | complaint_votes          | Users can remove own vote                   | PERMISSIVE | {authenticated} | DELETE | (user_id = auth.uid())    | null                      |
| public     | complaint_votes          | Users can vote                              | PERMISSIVE | {authenticated} | INSERT | null                      | (user_id = auth.uid())    |
| public     | complaints               | Authenticated users can view complaints     | PERMISSIVE | {authenticated} | SELECT | true                      | null                      |
| public     | complaints               | Citizens can create complaints              | PERMISSIVE | {authenticated} | INSERT | null                      | (citizen_id = auth.uid()) |
| public     | complaints               | Citizens can update own complaints          | PERMISSIVE | {authenticated} | UPDATE | (citizen_id = auth.uid()) | (citizen_id = auth.uid()) |
| public     | municipalities           | Authenticated users can view municipalities | PERMISSIVE | {authenticated} | SELECT | true                      | null                      |
| public     | notifications            | Users can update own notifications          | PERMISSIVE | {authenticated} | UPDATE | (user_id = auth.uid())    | (user_id = auth.uid())    |
| public     | notifications            | Users can view own notifications            | PERMISSIVE | {authenticated} | SELECT | (user_id = auth.uid())    | null                      |
| public     | profiles                 | Users can update own profile                | PERMISSIVE | {authenticated} | UPDATE | (id = auth.uid())         | (id = auth.uid())         |
| public     | profiles                 | Users can view own profile                  | PERMISSIVE | {authenticated} | SELECT | (id = auth.uid())         | null                      |
| public     | wards                    | Authenticated users can view wards          | PERMISSIVE | {authenticated} | SELECT | true                      | null                      |

### functions
| routine_name    | routine_type |
| --------------- | ------------ |
| handle_new_user | FUNCTION     |

### triggers

### enums
| schema_name | enum_name            | enum_value           |
| ----------- | -------------------- | -------------------- |
| public      | complaint_category   | garbage_dump         |
| public      | complaint_category   | overflowing_bin      |
| public      | complaint_category   | illegal_dumping      |
| public      | complaint_category   | plastic_waste        |
| public      | complaint_category   | construction_waste   |
| public      | complaint_category   | dead_animal          |
| public      | complaint_category   | sewage               |
| public      | complaint_category   | public_toilet        |
| public      | complaint_category   | other                |
| public      | complaint_image_type | report               |
| public      | complaint_image_type | before               |
| public      | complaint_image_type | after                |
| public      | complaint_status     | reported             |
| public      | complaint_status     | acknowledged         |
| public      | complaint_status     | assigned             |
| public      | complaint_status     | scheduled            |
| public      | complaint_status     | in_progress          |
| public      | complaint_status     | completed            |
| public      | complaint_status     | citizen_verification |
| public      | complaint_status     | closed               |
| public      | complaint_status     | reopened             |
| public      | complaint_status     | rejected             |
| public      | user_role            | citizen              |
| public      | user_role            | officer              |
| public      | user_role            | admin                |

### relationships/foreign keys
| table_name               | column_name         | referenced_table | referenced_column | constraint_name                            |
| ------------------------ | ------------------- | ---------------- | ----------------- | ------------------------------------------ |
| cleanup_drives           | created_by          | profiles         | id                | cleanup_drives_created_by_fkey             |
| cleanup_drives           | municipality_id     | municipalities   | id                | cleanup_drives_municipality_id_fkey        |
| cleanup_drives           | ward_id             | wards            | id                | cleanup_drives_ward_id_fkey                |
| cleanup_volunteers       | cleanup_drive_id    | cleanup_drives   | id                | cleanup_volunteers_cleanup_drive_id_fkey   |
| cleanup_volunteers       | user_id             | profiles         | id                | cleanup_volunteers_user_id_fkey            |
| complaint_comments       | complaint_id        | complaints       | id                | complaint_comments_complaint_id_fkey       |
| complaint_comments       | user_id             | profiles         | id                | complaint_comments_user_id_fkey            |
| complaint_images         | complaint_id        | complaints       | id                | complaint_images_complaint_id_fkey         |
| complaint_images         | uploaded_by         | profiles         | id                | complaint_images_uploaded_by_fkey          |
| complaint_status_history | changed_by          | profiles         | id                | complaint_status_history_changed_by_fkey   |
| complaint_status_history | complaint_id        | complaints       | id                | complaint_status_history_complaint_id_fkey |
| complaint_votes          | complaint_id        | complaints       | id                | complaint_votes_complaint_id_fkey          |
| complaint_votes          | user_id             | profiles         | id                | complaint_votes_user_id_fkey               |
| complaints               | assigned_officer_id | profiles         | id                | complaints_assigned_officer_id_fkey        |
| complaints               | citizen_id          | profiles         | id                | complaints_citizen_id_fkey                 |
| complaints               | duplicate_of        | complaints       | id                | complaints_duplicate_of_fkey               |
| complaints               | municipality_id     | municipalities   | id                | complaints_municipality_id_fkey            |
| complaints               | ward_id             | wards            | id                | complaints_ward_id_fkey                    |
| notifications            | complaint_id        | complaints       | id                | notifications_complaint_id_fkey            |
| notifications            | user_id             | profiles         | id                | notifications_user_id_fkey                 |
| profiles                 | municipality_id     | municipalities   | id                | profiles_municipality_id_fkey              |
| profiles                 | ward_id             | wards            | id                | profiles_ward_id_fkey                      |
| wards                    | municipality_id     | municipalities   | id                | wards_municipality_id_fkey                 |

### primary keys/unique constraints
| table_name               | constraint_name                                 | constraint_type | column_name      |
| ------------------------ | ----------------------------------------------- | --------------- | ---------------- |
| cleanup_drives           | cleanup_drives_pkey                             | PRIMARY KEY     | id               |
| cleanup_volunteers       | cleanup_volunteers_pkey                         | PRIMARY KEY     | id               |
| cleanup_volunteers       | cleanup_volunteers_cleanup_drive_id_user_id_key | UNIQUE          | cleanup_drive_id |
| cleanup_volunteers       | cleanup_volunteers_cleanup_drive_id_user_id_key | UNIQUE          | user_id          |
| complaint_comments       | complaint_comments_pkey                         | PRIMARY KEY     | id               |
| complaint_images         | complaint_images_pkey                           | PRIMARY KEY     | id               |
| complaint_status_history | complaint_status_history_pkey                   | PRIMARY KEY     | id               |
| complaint_votes          | complaint_votes_pkey                            | PRIMARY KEY     | id               |
| complaint_votes          | complaint_votes_complaint_id_user_id_key        | UNIQUE          | complaint_id     |
| complaint_votes          | complaint_votes_complaint_id_user_id_key        | UNIQUE          | user_id          |
| complaints               | complaints_pkey                                 | PRIMARY KEY     | id               |
| municipalities           | municipalities_pkey                             | PRIMARY KEY     | id               |
| notifications            | notifications_pkey                              | PRIMARY KEY     | id               |
| profiles                 | profiles_pkey                                   | PRIMARY KEY     | id               |
| wards                    | wards_pkey                                      | PRIMARY KEY     | id               |

### indexes
| schemaname | tablename                | indexname                                       | indexdef                                                                                                                                 |
| ---------- | ------------------------ | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| public     | cleanup_drives           | cleanup_drives_pkey                             | CREATE UNIQUE INDEX cleanup_drives_pkey ON public.cleanup_drives USING btree (id)                                                        |
| public     | cleanup_volunteers       | cleanup_volunteers_cleanup_drive_id_user_id_key | CREATE UNIQUE INDEX cleanup_volunteers_cleanup_drive_id_user_id_key ON public.cleanup_volunteers USING btree (cleanup_drive_id, user_id) |
| public     | cleanup_volunteers       | cleanup_volunteers_pkey                         | CREATE UNIQUE INDEX cleanup_volunteers_pkey ON public.cleanup_volunteers USING btree (id)                                                |
| public     | complaint_comments       | complaint_comments_pkey                         | CREATE UNIQUE INDEX complaint_comments_pkey ON public.complaint_comments USING btree (id)                                                |
| public     | complaint_images         | complaint_images_pkey                           | CREATE UNIQUE INDEX complaint_images_pkey ON public.complaint_images USING btree (id)                                                    |
| public     | complaint_status_history | complaint_status_history_pkey                   | CREATE UNIQUE INDEX complaint_status_history_pkey ON public.complaint_status_history USING btree (id)                                    |
| public     | complaint_status_history | status_history_complaint_idx                    | CREATE INDEX status_history_complaint_idx ON public.complaint_status_history USING btree (complaint_id)                                  |
| public     | complaint_votes          | complaint_votes_complaint_id_user_id_key        | CREATE UNIQUE INDEX complaint_votes_complaint_id_user_id_key ON public.complaint_votes USING btree (complaint_id, user_id)               |
| public     | complaint_votes          | complaint_votes_complaint_idx                   | CREATE INDEX complaint_votes_complaint_idx ON public.complaint_votes USING btree (complaint_id)                                          |
| public     | complaint_votes          | complaint_votes_pkey                            | CREATE UNIQUE INDEX complaint_votes_pkey ON public.complaint_votes USING btree (id)                                                      |
| public     | complaints               | complaints_citizen_id_idx                       | CREATE INDEX complaints_citizen_id_idx ON public.complaints USING btree (citizen_id)                                                     |
| public     | complaints               | complaints_created_at_idx                       | CREATE INDEX complaints_created_at_idx ON public.complaints USING btree (created_at DESC)                                                |
| public     | complaints               | complaints_municipality_id_idx                  | CREATE INDEX complaints_municipality_id_idx ON public.complaints USING btree (municipality_id)                                           |
| public     | complaints               | complaints_officer_id_idx                       | CREATE INDEX complaints_officer_id_idx ON public.complaints USING btree (assigned_officer_id)                                            |
| public     | complaints               | complaints_pkey                                 | CREATE UNIQUE INDEX complaints_pkey ON public.complaints USING btree (id)                                                                |
| public     | complaints               | complaints_priority_idx                         | CREATE INDEX complaints_priority_idx ON public.complaints USING btree (priority_score DESC)                                              |
| public     | complaints               | complaints_status_idx                           | CREATE INDEX complaints_status_idx ON public.complaints USING btree (status)                                                             |
| public     | complaints               | complaints_ward_id_idx                          | CREATE INDEX complaints_ward_id_idx ON public.complaints USING btree (ward_id)                                                           |
| public     | municipalities           | municipalities_pkey                             | CREATE UNIQUE INDEX municipalities_pkey ON public.municipalities USING btree (id)                                                        |
| public     | notifications            | notifications_pkey                              | CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id)                                                          |
| public     | profiles                 | profiles_pkey                                   | CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id)                                                                    |
| public     | wards                    | wards_pkey                                      | CREATE UNIQUE INDEX wards_pkey ON public.wards USING btree (id)                                                                          |

### storage buckets
| id               | name             | public | file_size_limit | allowed_mime_types |
| ---------------- | ---------------- | ------ | --------------- | ------------------ |
| cleanup-images   | cleanup-images   | false  | 2097152         | null               |
| complaint-images | complaint-images | false  | 2097152         | null               |

### storage RLS policies
| policyname                                      | cmd    | roles           | qual                                   | with_check                             |
| ----------------------------------------------- | ------ | --------------- | -------------------------------------- | -------------------------------------- |
| Authenticated users can upload cleanup images   | INSERT | {authenticated} | null                                   | (bucket_id = 'cleanup-images'::text)   |
| Authenticated users can upload complaint images | INSERT | {authenticated} | null                                   | (bucket_id = 'complaint-images'::text) |
| Authenticated users can view cleanup images     | SELECT | {authenticated} | (bucket_id = 'cleanup-images'::text)   | null                                   |
| Authenticated users can view complaint images   | SELECT | {authenticated} | (bucket_id = 'complaint-images'::text) | null                                   |
| Users can delete complaint images               | DELETE | {authenticated} | (bucket_id = 'complaint-images'::text) | null                                   |

### realtime
| schemaname | tablename                |
| ---------- | ------------------------ |
| public     | complaint_comments       |
| public     | complaint_status_history |
| public     | complaint_votes          |
| public     | complaints               |
| public     | notifications            |

### db extensions
| extname            | extversion |
| ------------------ | ---------- |
| pg_stat_statements | 1.11       |
| pgcrypto           | 1.3        |
| plpgsql            | 1.0        |
| supabase_vault     | 0.3.1      |
| uuid-ossp          | 1.1        |