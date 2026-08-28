CREATE TABLE `catalogSyncRuns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source` varchar(32) NOT NULL,
	`mode` enum('api','file') NOT NULL,
	`status` enum('prepared','running','completed','failed') NOT NULL DEFAULT 'prepared',
	`importedProducts` int NOT NULL DEFAULT 0,
	`duplicateSkus` int NOT NULL DEFAULT 0,
	`message` text,
	`startedAt` timestamp,
	`finishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `catalogSyncRuns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`externalOrderId` varchar(128),
	`status` enum('pending_review','awaiting_payment','confirmed','ready_for_pickup','out_for_delivery','completed','cancelled') NOT NULL DEFAULT 'pending_review',
	`fulfillment` enum('delivery','pickup') NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'BRL',
	`subtotalCents` int NOT NULL,
	`shippingCents` int,
	`totalCents` int NOT NULL,
	`statusNote` text,
	`source` varchar(32) NOT NULL DEFAULT 'shopify',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_externalOrderId_unique` UNIQUE(`externalOrderId`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_customerId_users_id_fk` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;