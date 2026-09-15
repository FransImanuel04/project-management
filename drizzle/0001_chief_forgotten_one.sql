PRAGMA foreign_keys=OFF;--> statement-breakpoint
DROP INDEX `projects_slug_unique`;--> statement-breakpoint
CREATE TABLE `__new_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`key` text NOT NULL,
	`description` text,
	`icon` text DEFAULT 'folder' NOT NULL,
	`icon_color` text DEFAULT '#d7774b' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);--> statement-breakpoint
INSERT INTO `__new_projects` (`id`, `name`, `key`, `description`, `icon`, `icon_color`, `created_at`, `updated_at`)
SELECT `id`, `name`, upper(`slug`), `description`, 'folder', '#d7774b', `created_at`, `updated_at`
FROM `projects`;--> statement-breakpoint
DROP TABLE `projects`;--> statement-breakpoint
ALTER TABLE `__new_projects` RENAME TO `projects`;--> statement-breakpoint
CREATE UNIQUE INDEX `projects_key_unique` ON `projects` (`key`);--> statement-breakpoint
PRAGMA foreign_keys=ON;