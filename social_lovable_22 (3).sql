-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Nov 05, 2025 at 01:21 PM
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `plans`
--

INSERT INTO `plans` (`id`, `name`, `price`, `monthly_posts`, `ai_posts`, `linked_accounts`, `features`, `is_active`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Free Plan', '0.00', 5, 3, 1, '{\"support\": \"email\", \"analytics\": false, \"scheduling\": true, \"ai_generation\": true, \"basic_posting\": true}', 1, 'Perfect for getting started with social media management', '2025-10-13 04:59:52', '2025-10-15 09:59:04'),
(2, 'Pro Plan', '19.99', 50, 20, 3, '{\"support\": \"priority\", \"analytics\": true, \"scheduling\": true, \"ai_generation\": true, \"basic_posting\": true, \"custom_branding\": true}', 1, 'Ideal for small businesses and content creators', '2025-10-13 04:59:52', '2025-10-13 04:59:52'),
(3, 'Business Plan', '49.99', 200, 100, 10, '{\"support\": \"priority\", \"analytics\": true, \"scheduling\": true, \"ai_generation\": true, \"basic_posting\": true, \"custom_branding\": true, \"advanced_analytics\": true, \"team_collaboration\": true}', 1, 'Perfect for growing businesses and agencies', '2025-10-13 04:59:52', '2025-10-13 04:59:52'),
(4, 'Enterprise Plan', '99.99', 500, 300, 25, '{\"support\": \"dedicated\", \"analytics\": true, \"api_access\": true, \"scheduling\": true, \"white_label\": true, \"ai_generation\": true, \"basic_posting\": true, \"custom_branding\": true, \"advanced_analytics\": true, \"team_collaboration\": true}', 1, 'For large organizations with extensive social media needs', '2025-10-13 04:59:52', '2025-10-13 04:59:52'),
(5, 'Dummy', '0.00', 10, 5, 1, NULL, 0, NULL, '2025-10-28 06:04:25', '2025-10-28 06:04:25');

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
  `video_url` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `title`, `content`, `platforms`, `status`, `is_ai_generated`, `ai_prompt`, `scheduled_at`, `published_at`, `user_id`, `category`, `tags`, `media_urls`, `analytics`, `image_prompt`, `image_url`, `video_url`, `created_at`, `updated_at`) VALUES
(1, 'jewelery', 'Here\'s a social media post for Tanishq jewelry on Instagram, incorporating the given details:\r\n\r\n**Post:**\r\n\"Colors of love, colors of joy! This Holi, let\'s add a touch of gold to our celebrations! \r\n\r\nAt Tanishq, we believe that jewelry is not just a form of personal adornment, but a symbol of love, tradition, and culture. That\'s why we\'ve curated a stunning collection of gold jewelry, perfect for the festive season!\r\n\r\nFrom elegant necklaces to dazzling earrings, and from intricate rings to beautiful bangles, our collection has something for everyone. So, why wait? Shop now and make this Holi a memorable one!\r\n\r\n**Image:** A beautiful photo of a woman wearing a stunning gold necklace and earrings, with a splash of colorful Holi powder in the background.\r\n\r\n**Hashtags:** #DpPunjab #HoliVibes #GoldJewelry #Tanishq #JewelryLove #FestivalFashion #PersonalAdornment #Love #Tradition #Culture\r\n\r\n**Caption in Punjabi:** ਰੰਗਾਂ ਦਾ ਤਿਉਹਾਰ, ਪਿਆਰ ਦਾ ਤਿਉਹਾਰ! ਇਸ ਹੋਲੀ ਤੇ ਸੋਨੇ ਦਾ ਰੰਗ ਭਰੋ! ਤਨਿਸ਼ਕ ਵਿਚ ਸਾਨੂੰ ਯਕੀਨ ਹੈ ਕਿ ਗਹਿਣਾ ਸਿਰਫ ਸ਼ਿੰਗਾਰ ਦਾ ਸਾਧਨ ਨਹੀਂ, ਬਲਕਿ ਇਹ ਪਿਆਰ, ਰਿਵਾਜ, ਅਤੇ ਸਭਿਆਚਾਰ ਦਾ ਪ੍ਰਤੀਕ ਵੀ ਹੈ। ਇਸ ਲਈ ਅਸੀਂ ਹੋਲੀ ਦੇ ਤਿਉਹਾਰ ਲਈ ਸੋਨੇ ਦੇ ਗਹਿਣਿਆਂ ਦਾ ਇਕ ਅਦਭੁਤ ਸੰਗ੍ਰਹਿ ਤਿਆਰ ਕੀਤਾ ਹੈ! \r\n\r\n**Call-to-Action:** Shop now and get ready to shine this Holi! #Tanishq #HoliSpecial #GoldJewelry #JewelryLovers #Punjab\"', '\"[\\\"Instagram\\\"]\"', 'draft', 1, 'Business/Creator: jewelery\r\nDescription: Jewelry is a form of personal adornment made from precious metals, gemstones, and other decorative materials. It includes items such as necklaces, earrings, rings, bracelets, bangles, and anklets. Jewelry is not only worn for beauty but also symbolizes love, tradition, culture, and status. From ancient times to modern fashion, jewelry has always been an expression of personality and elegance.\r\nPlatforms: instagaram\r\nBrand Voice: tanishq\r\nHashtags: dp punjab\r\nImage Style: gold jewelery\r\nFestival/Event: holi', NULL, NULL, 2, NULL, NULL, NULL, NULL, 'gold jewelery', 'https://res.cloudinary.com/diapmjeoc/image/upload/v1762248740/user_2_test/kz5cqscwori3sgyzbrcy.jpg', 'https://res.cloudinary.com/diapmjeoc/video/upload/v1762248749/user_2_test/ol9dlacgtzst11voxelo.mp4', '2025-11-04 09:32:34', '2025-11-04 09:32:34'),
(3, 'jewelery', 'Here\'s a post for Holi, incorporating the details you provided:\r\n\r\n**Image:** A beautiful, vibrant photo of a woman wearing a stunning gold necklace and earrings, set against a colorful Holi-themed backdrop.\r\n\r\n**Caption:**\r\n\"Rangon ki duniya mein, sona hai sabse sundar! (In the world of colors, gold is the most beautiful!)\r\nThis Holi, celebrate the vibrancy of life with Tanishq\'s exquisite gold jewelry!\r\nFrom traditional to modern designs, our collection has something for every style and preference. \r\nWhether you\'re playing with colors or just enjoying the festive spirit, make it a memorable one with our stunning gold pieces. \r\n#HoliVibes #GoldJewelry #Tanishq #DPunjab #FestivalOfColors #JewelryLovers #IndianFestivals\"\r\n\r\n**Instagram Story:**\r\n\"Happy Holi from Tanishq!\r\nSwipe right to explore our stunning gold jewelry collection, perfect for the festive season!\r\n Share your Holi moments with us, and tag us in your posts! #HoliCelebrations #GoldJewelryLove #Tanishq\"\r\n\r\n**Reels:**\r\nCreate a short, engaging Reel showcasing Tanishq\'s gold jewelry collection, with a mix of traditional and modern designs. Use a popular Holi song as the background music, and add some colorful, festive filters to make it more engaging. \r\n\r\n**Instagram Live:**\r\nHost a live session with a Tanishq expert, who can showcase the latest gold jewelry collection, share styling tips, and answer customer queries. Offer special discounts or promotions to viewers who shop during the live session. \r\n\r\nThis campaign aims to leverage the festive spirit of Holi to showcase Tanishq\'s stunning gold jewelry collection, while engaging with customers and creating a memorable brand experience.', '\"[\\\"Instagram\\\"]\"', 'draft', 1, 'Business/Creator: jewelery\r\nDescription: Jewelry is a form of personal adornment made from precious metals, gemstones, and other decorative materials. It includes items such as necklaces, earrings, rings, bracelets, bangles, and anklets. Jewelry is not only worn for beauty but also symbolizes love, tradition, culture, and status. From ancient times to modern fashion, jewelry has always been an expression of personality and elegance.\r\nPlatforms: instagaram\r\nBrand Voice: tanishq\r\nHashtags: dp punjab\r\nImage Style: gold jewelery\r\nFestival/Event: holi', NULL, NULL, 2, NULL, NULL, NULL, NULL, 'gold jewelery', 'https://res.cloudinary.com/diapmjeoc/image/upload/v1762249549/user_2_test/wxr705ebttjdseblnbyt.jpg', NULL, '2025-11-04 09:45:49', '2025-11-04 09:45:49');

-- --------------------------------------------------------

--
-- Table structure for table `profiles`
--

DROP TABLE IF EXISTS `profiles`;
CREATE TABLE IF NOT EXISTS `profiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `business_name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `platforms` varchar(255) DEFAULT NULL,
  `brand_voice` varchar(255) DEFAULT NULL,
  `hashtags` varchar(255) DEFAULT NULL,
  `image_style` varchar(255) DEFAULT NULL,
  `festival` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `profiles`
--

INSERT INTO `profiles` (`id`, `user_id`, `business_name`, `description`, `platforms`, `brand_voice`, `hashtags`, `image_style`, `festival`, `created_at`, `updated_at`) VALUES
(1, 2, 'jewelery', 'Jewelry is a form of personal adornment made from precious metals, gemstones, and other decorative materials. It includes items such as necklaces, earrings, rings, bracelets, bangles, and anklets. Jewelry is not only worn for beauty but also symbolizes love, tradition, culture, and status. From ancient times to modern fashion, jewelry has always been an expression of personality and elegance.', 'instagaram', 'tanishq', 'dp punjab', 'gold jewelery', 'holi', '2025-10-16 10:40:01', '2025-11-03 12:53:56');

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
-- Table structure for table `schedules`
--

DROP TABLE IF EXISTS `schedules`;
CREATE TABLE IF NOT EXISTS `schedules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `platforms` json NOT NULL,
  `days` json NOT NULL,
  `times` json NOT NULL,
  `recurrence` varchar(255) DEFAULT NULL,
  `customDateFrom` date DEFAULT NULL,
  `customDateTo` date DEFAULT NULL,
  `singleDate` date DEFAULT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `schedules`
--

INSERT INTO `schedules` (`id`, `userId`, `platforms`, `days`, `times`, `recurrence`, `customDateFrom`, `customDateTo`, `singleDate`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 2, '[\"instagram\"]', '[\"tuesday\"]', '{\"tuesday\": [\"18:23\"]}', NULL, NULL, NULL, NULL, '1', '2025-11-05 12:53:31', '2025-11-05 13:06:40'),
(2, 2, '[\"instagram\"]', '[\"single_date\"]', '{\"single_date\": [\"23:28\", \"20:23\"]}', NULL, NULL, NULL, '2025-11-27', '1', '2025-11-05 12:53:31', '2025-11-05 12:53:31'),
(3, 2, '[\"instagram\"]', '[\"tuesday\"]', '{\"tuesday\": [\"19:38\"]}', NULL, NULL, NULL, NULL, '1', '2025-11-05 13:07:46', '2025-11-05 13:18:03'),
(4, 2, '[\"facebook\", \"instagram\"]', '[\"single_date\", \"thursday\", \"sunday\", \"custom_date\"]', '{\"sunday\": [\"20:49\", \"23:49\", \"23:49\"], \"thursday\": [\"18:50\", \"22:48\"], \"custom_date\": [\"23:49\", \"19:49\"], \"single_date\": [\"22:37\", \"19:48\", \"20:48\", \"22:48\"]}', NULL, '2025-11-08', '2025-11-11', '2025-11-12', '1', '2025-11-05 13:07:46', '2025-11-05 13:19:49');

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
  `instagram_business_id` text,
  `response_type` text,
  `token_expires_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `metadata` json DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `social_accounts`
--

INSERT INTO `social_accounts` (`id`, `user_id`, `platform`, `account_id`, `account_name`, `app_id`, `app_secret`, `access_token`, `refresh_token`, `instagram_business_id`, `response_type`, `token_expires_at`, `is_active`, `metadata`, `created_at`, `updated_at`) VALUES
(4, 3, 'Facebook', NULL, NULL, 'ffffffffffff-444', 'ffffffffff-4444', NULL, NULL, NULL, NULL, NULL, 0, NULL, '2025-10-13 08:34:43', '2025-10-13 09:27:53'),
(8, 2, 'Facebook', NULL, NULL, '2078981645972721', 'a2d090aa2b0b42aeaef2425319c5ded7', 'EAAdi0qKAtPEBPZBov6VpDD0LUCrHJqKy1oZBZBZB8WTBqAnRFj0IfSf1tuZBHjJAWidkESCDlAFL1Ryq9wL3jy4wwp7IeK9Y6J7iyIZB6ca9ZCe5PRy55MfTd46nWEVLOezqeSZCJTcICpPn2WBXCCyvLMT9gpEduhuopIZBOSpa3TPJDZA446xpkxxTAfedNiJn2KupLk0DZAZBTQDfkaIviRAU4TY7KJYwNrsakei2qkvVi0aLM0Y5ZCdmf84tZAS1UvyC90TECJ9TOtyaqHGHDaBJst6RRAIBTsopuq', NULL, NULL, NULL, NULL, 0, NULL, '2025-10-14 11:05:47', '2025-10-30 05:46:53'),
(9, 2, 'Instagram', NULL, NULL, '1519636216049823', '003e8626534116b9956c139c1c0bb462', 'EAAdi0qKAtPEBPZBov6VpDD0LUCrHJqKy1oZBZBZB8WTBqAnRFj0IfSf1tuZBHjJAWidkESCDlAFL1Ryq9wL3jy4wwp7IeK9Y6J7iyIZB6ca9ZCe5PRy55MfTd46nWEVLOezqeSZCJTcICpPn2WBXCCyvLMT9gpEduhuopIZBOSpa3TPJDZA446xpkxxTAfedNiJn2KupLk0DZAZBTQDfkaIviRAU4TY7KJYwNrsakei2qkvVi0aLM0Y5ZCdmf84tZAS1UvyC90TECJ9TOtyaqHGHDaBJst6RRAIBTsopuq', NULL, NULL, NULL, NULL, 1, NULL, '2025-10-24 12:46:36', '2025-10-29 13:01:48');

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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `user_id`, `plan_id`, `status`, `start_date`, `end_date`, `posts_used`, `ai_posts_used`, `auto_renew`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 'cancelled', '2025-10-15 07:18:06', NULL, 0, 0, 0, '2025-10-15 07:18:06', '2025-10-15 07:18:57'),
(2, 2, 2, 'cancelled', '2025-10-15 07:19:00', NULL, 0, 0, 0, '2025-10-15 07:19:00', '2025-10-15 07:19:26'),
(3, 2, 1, 'cancelled', '2025-10-17 06:45:01', NULL, 0, 0, 0, '2025-10-17 06:45:01', '2025-10-17 06:45:11'),
(4, 2, 4, 'cancelled', '2025-10-17 06:45:55', NULL, 0, 0, 0, '2025-10-17 06:45:55', '2025-10-17 06:46:03'),
(5, 2, 3, 'cancelled', '2025-10-17 06:46:05', NULL, 0, 0, 0, '2025-10-17 06:46:05', '2025-10-17 06:46:10'),
(6, 2, 3, 'cancelled', '2025-10-17 06:46:23', NULL, 0, 0, 0, '2025-10-17 06:46:23', '2025-10-17 06:46:40'),
(7, 2, 3, 'cancelled', '2025-10-17 06:46:43', NULL, 0, 0, 0, '2025-10-17 06:46:43', '2025-10-17 06:48:07'),
(8, 2, 1, 'cancelled', '2025-10-28 06:12:12', NULL, 3, 3, 0, '2025-10-28 06:12:12', '2025-10-28 06:30:53');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(255) DEFAULT NULL,
  `api_key` text,
  `api_url` text,
  `is_active` tinyint(1) DEFAULT NULL,
  `cloudinary_cloud_name` text,
  `cloudinary_api_key` text,
  `cloudinary_api_secret` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `type`, `api_key`, `api_url`, `is_active`, `cloudinary_cloud_name`, `cloudinary_api_key`, `cloudinary_api_secret`, `created_at`, `updated_at`) VALUES
(1, 'groq', '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', 'https://api.groq.com/openai/v1/chat/completions', 0, 'diapmjeoc', '623293742125568', '6mzyLVSYqqjhbUbECHqvGPayE_E', '2025-11-01 10:48:21', '2025-11-03 13:26:46');

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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `user_name`, `user_fname`, `user_lname`, `email`, `user_phone`, `user_type`, `is_admin`, `password`, `role_id`, `avatar_url`, `full_name`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'Admin', 'User', 'admin@gmail.com', NULL, 'admin', 'on', '$2a$12$KN8Icqvo4.KQJ2a39A6R0.BlSofKj.WGJ5xLQfVOv5ZjILCnhnAUS', 1, NULL, NULL, '2025-10-13 04:59:53', '2025-10-13 04:59:53'),
(2, 'test', 'test-first', 'test-last', 'test@gmail.com', '1111111111', 'client', 'off', '$2a$12$Q/WcQ0LMMM8UhVFu6hsYKeen8Cf6vCp8ecgUro0ZaiIVFMDkmxDUS', 2, NULL, NULL, '2025-10-13 05:12:10', '2025-10-13 05:12:10'),
(3, 'test-2', 'test-first', 'test-last', 'test2@gmail.com', '1111111111', 'client', 'off', '$2a$12$xPt6QlpJhsGG3ihspWO8W.Ijb3NyJ7.BHb4UukjjqyARa6udIuETW', 2, NULL, NULL, '2025-10-13 05:57:41', '2025-10-13 05:57:41'),
(4, 'himanshu@gmail.com', 'himanshu', 'Doe', 'himanshu@gmail.com', '12345678944', 'client', 'off', '$2a$12$CqCCZ3VMJ60R1XtbYWxJ9.NIM.6x5pBQisV2ZPTjVtUtydR1uP6ji', 2, NULL, NULL, '2025-10-28 06:08:41', '2025-10-28 06:08:41');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `profiles`
--
ALTER TABLE `profiles`
  ADD CONSTRAINT `profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `schedules`
--
ALTER TABLE `schedules`
  ADD CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

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
