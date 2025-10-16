-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Oct 16, 2025 at 10:21 AM
-- Server version: 5.7.36
-- PHP Version: 7.4.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `social_lovable_22`
--

-- --------------------------------------------------------

--
-- Table structure for table `plans`
--

DROP TABLE IF EXISTS `plans`;
CREATE TABLE IF NOT EXISTS `plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `monthly_posts` int(11) NOT NULL DEFAULT '0',
  `ai_posts` int(11) NOT NULL DEFAULT '0',
  `linked_accounts` int(11) NOT NULL DEFAULT '1',
  `features` json DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `description` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `plans`
--

INSERT INTO `plans` (`id`, `name`, `price`, `monthly_posts`, `ai_posts`, `linked_accounts`, `features`, `is_active`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Free Plan', '0.00', 5, 3, 1, '{\"support\": \"email\", \"analytics\": false, \"scheduling\": true, \"ai_generation\": true, \"basic_posting\": true}', 1, 'Perfect for getting started with social media management', '2025-10-13 04:59:52', '2025-10-15 09:59:04'),
(2, 'Pro Plan', '19.99', 50, 20, 3, '{\"support\": \"priority\", \"analytics\": true, \"scheduling\": true, \"ai_generation\": true, \"basic_posting\": true, \"custom_branding\": true}', 1, 'Ideal for small businesses and content creators', '2025-10-13 04:59:52', '2025-10-13 04:59:52'),
(3, 'Business Plan', '49.99', 200, 100, 10, '{\"support\": \"priority\", \"analytics\": true, \"scheduling\": true, \"ai_generation\": true, \"basic_posting\": true, \"custom_branding\": true, \"advanced_analytics\": true, \"team_collaboration\": true}', 1, 'Perfect for growing businesses and agencies', '2025-10-13 04:59:52', '2025-10-13 04:59:52'),
(4, 'Enterprise Plan', '99.99', 500, 300, 25, '{\"support\": \"dedicated\", \"analytics\": true, \"api_access\": true, \"scheduling\": true, \"white_label\": true, \"ai_generation\": true, \"basic_posting\": true, \"custom_branding\": true, \"advanced_analytics\": true, \"team_collaboration\": true}', 1, 'For large organizations with extensive social media needs', '2025-10-13 04:59:52', '2025-10-13 04:59:52');

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
CREATE TABLE IF NOT EXISTS `posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `platforms` json NOT NULL,
  `status` enum('draft','scheduled','published') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `is_ai_generated` tinyint(1) NOT NULL DEFAULT '0',
  `ai_prompt` mediumtext COLLATE utf8mb4_unicode_ci,
  `scheduled_at` datetime DEFAULT NULL,
  `published_at` datetime DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `media_urls` json DEFAULT NULL,
  `analytics` json DEFAULT NULL,
  `image_prompt` text COLLATE utf8mb4_unicode_ci,
  `image_url` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `title`, `content`, `platforms`, `status`, `is_ai_generated`, `ai_prompt`, `scheduled_at`, `published_at`, `user_id`, `category`, `tags`, `media_urls`, `analytics`, `image_prompt`, `image_url`, `created_at`, `updated_at`) VALUES
(7, 'clothes', '🚀 Exciting news about clothes!\n\nclothes is revolutionizing the way we think about marketing. Whether you\'re new to this space or a seasoned professional, there\'s something for everyone.\n\nKey highlights:\n• Innovation in clothes\n• Benefits for adults\n• Future opportunities\n\nWhat are your thoughts on clothes? Share your experience in the comments below!\n\n#clothes #Innovation #Marketing', '[\"Facebook\"]', 'draft', 1, 'clothes', NULL, NULL, 3, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-13 05:59:02', '2025-10-13 05:59:02'),
(15, 'sfs', '**Unlock Your Potential with SFS**\n\nDiscover the power of SFS, a revolutionary platform designed to empower adults in their personal and professional lives. Our cutting-edge solutions cater to the diverse needs of modern adults, providing unparalleled support and guidance.\n\nWith SFS, you can:\n\n* Enhance your skills and knowledge\n* Boost your confidence and self-esteem\n* Achieve your goals and aspirations\n* Connect with like-minded individuals\n\nJoin our community today and experience the transformative impact of SFS. Stay ahead of the curve and unlock your full potential. Learn more about our innovative services and take the first step towards a brighter future.', '[\"Facebook\"]', 'published', 1, 'sfs', '2025-10-16 05:38:00', '2025-10-16 05:38:03', 2, NULL, NULL, NULL, NULL, 'fish', 'https://image.pollinations.ai/prompt/fish?width=1024&height=1024&nologo=true', '2025-10-16 05:37:05', '2025-10-16 05:38:03'),
(16, 'shoes', '\"Elevate Your Style with Our Premium Footwear Collection\n\nDiscover the perfect blend of comfort and sophistication with our latest range of shoes, designed specifically for adults. From sleek and modern designs to timeless classics, our collection has something for everyone.\n\nWith a focus on quality and craftsmanship, our shoes are built to last, ensuring you can enjoy your favorite styles for years to come. Whether you\'re dressing up for a special occasion or dressing down for a casual day out, our shoes are the perfect choice.\n\nVisit us today and experience the comfort, style, and versatility of our premium footwear collection. Treat your feet to the best and take your shoe game to the next level. Explore now and elevate your style!\"', '[\"Facebook\"]', 'published', 1, 'shoes', '2025-10-16 05:52:00', '2025-10-16 05:52:03', 2, NULL, NULL, NULL, NULL, 'shoes', 'https://image.pollinations.ai/prompt/shoes?width=1024&height=1024&nologo=true', '2025-10-16 05:51:44', '2025-10-16 05:52:03');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `permissions` json DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `permissions`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'Administrator role with full access', '{\"plans\": [\"create\", \"read\", \"update\", \"delete\"], \"posts\": [\"create\", \"read\", \"update\", \"delete\"], \"users\": [\"create\", \"read\", \"update\", \"delete\"], \"analytics\": [\"read\"], \"subscriptions\": [\"create\", \"read\", \"update\", \"delete\"], \"social_accounts\": [\"create\", \"read\", \"update\", \"delete\"]}', '2025-10-13 04:59:52', '2025-10-13 04:59:52'),
(2, 'client', 'Client role with limited access', '{\"posts\": [\"create\", \"read\", \"update\", \"delete\"], \"profile\": [\"read\", \"update\"], \"subscriptions\": [\"read\"], \"social_accounts\": [\"create\", \"read\", \"update\", \"delete\"]}', '2025-10-13 04:59:52', '2025-10-13 04:59:52');

-- --------------------------------------------------------

--
-- Table structure for table `social_accounts`
--

DROP TABLE IF EXISTS `social_accounts`;
CREATE TABLE IF NOT EXISTS `social_accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `platform` varchar(255) NOT NULL,
  `account_id` varchar(255) DEFAULT NULL,
  `account_name` varchar(255) DEFAULT NULL,
  `app_id` text,
  `app_secret` text,
  `access_token` text,
  `refresh_token` text,
  `token_expires_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `metadata` json DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `social_accounts`
--

INSERT INTO `social_accounts` (`id`, `user_id`, `platform`, `account_id`, `account_name`, `app_id`, `app_secret`, `access_token`, `refresh_token`, `token_expires_at`, `is_active`, `metadata`, `created_at`, `updated_at`) VALUES
(4, 3, 'Facebook', NULL, NULL, 'ffffffffffff-444', 'ffffffffff-4444', NULL, NULL, NULL, 1, NULL, '2025-10-13 08:34:43', '2025-10-13 09:27:53'),
(8, 2, 'Facebook', NULL, NULL, '2934798226703542', 'acb8d713392b5fb7e59e0022b63d4056', 'EAAptLvXKRLYBPpZASatSRNGZAXuj2rUdWfEgcpynEehm0KPoZCe39Vwadubbppymm5fJ8kqiqEUWlFopyed3JFpsZA9n4PMZBD5ZBvpYuZBROrk8CAG4C2Hv71kVAGkvcYFSpcK81jeeFZBvgF4APtmk5h9eAlyucEkfyAkcNKXtmcKmBc5d3h77ZBWQZCfrgc7dEGbUMdzrbf4i74mP6RZBExqwNFx32WYZB2tsiZCiTton4l9GbR87IZCjZAxauZCKHtGV', NULL, NULL, 1, NULL, '2025-10-14 11:05:47', '2025-10-14 11:05:47');

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

DROP TABLE IF EXISTS `subscriptions`;
CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `plan_id` int(11) DEFAULT NULL,
  `status` enum('active','inactive','cancelled','expired') NOT NULL DEFAULT 'active',
  `start_date` datetime NOT NULL,
  `end_date` datetime DEFAULT NULL,
  `posts_used` int(11) NOT NULL DEFAULT '0',
  `ai_posts_used` int(11) NOT NULL DEFAULT '0',
  `auto_renew` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `plan_id` (`plan_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `user_id`, `plan_id`, `status`, `start_date`, `end_date`, `posts_used`, `ai_posts_used`, `auto_renew`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 'cancelled', '2025-10-15 07:18:06', NULL, 0, 0, 0, '2025-10-15 07:18:06', '2025-10-15 07:18:57'),
(2, 2, 2, 'cancelled', '2025-10-15 07:19:00', NULL, 0, 0, 0, '2025-10-15 07:19:00', '2025-10-15 07:19:26');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(255) NOT NULL,
  `user_fname` varchar(255) DEFAULT NULL,
  `user_lname` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `user_phone` varchar(255) DEFAULT NULL,
  `user_type` enum('admin','client') DEFAULT 'client',
  `is_admin` varchar(255) DEFAULT 'off',
  `password` varchar(255) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `user_name`, `user_fname`, `user_lname`, `email`, `user_phone`, `user_type`, `is_admin`, `password`, `role_id`, `avatar_url`, `full_name`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'Admin', 'User', 'admin@gmail.com', NULL, 'admin', 'on', '$2a$12$KN8Icqvo4.KQJ2a39A6R0.BlSofKj.WGJ5xLQfVOv5ZjILCnhnAUS', 1, NULL, NULL, '2025-10-13 04:59:53', '2025-10-13 04:59:53'),
(2, 'test', 'test-first', 'test-last', 'test@gmail.com', '1111111111', 'client', 'off', '$2a$12$Q/WcQ0LMMM8UhVFu6hsYKeen8Cf6vCp8ecgUro0ZaiIVFMDkmxDUS', 2, NULL, NULL, '2025-10-13 05:12:10', '2025-10-13 05:12:10'),
(3, 'test-2', 'test-first', 'test-last', 'test2@gmail.com', '1111111111', 'client', 'off', '$2a$12$xPt6QlpJhsGG3ihspWO8W.Ijb3NyJ7.BHb4UukjjqyARa6udIuETW', 2, NULL, NULL, '2025-10-13 05:57:41', '2025-10-13 05:57:41');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `social_accounts`
--
ALTER TABLE `social_accounts`
  ADD CONSTRAINT `social_accounts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `subscriptions_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
