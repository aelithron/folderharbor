CREATE TABLE "acls" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "acls_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"allow" json DEFAULT '[]'::json NOT NULL,
	"deny" json DEFAULT '[]'::json NOT NULL
);
--> statement-breakpoint
CREATE TABLE "logs" (
	"userid" integer NOT NULL,
	"username" text,
	"action" text NOT NULL,
	"blurb" text DEFAULT 'took an action' NOT NULL,
	"body" json DEFAULT '{}'::json,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "roles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"permissions" text[] DEFAULT '{}' NOT NULL,
	"acls" integer[] DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sessions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"token" text NOT NULL,
	"userid" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"expiry" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"username" text NOT NULL,
	"password" text NOT NULL,
	"roles" integer[] DEFAULT '{}' NOT NULL,
	"permissions" text[] DEFAULT '{}' NOT NULL,
	"acls" integer[] DEFAULT '{}' NOT NULL,
	"locked" boolean DEFAULT false NOT NULL,
	"failedLogins" integer DEFAULT 0 NOT NULL,
	"resetFailedLogins" timestamp with time zone,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userid_users_id_fk" FOREIGN KEY ("userid") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;