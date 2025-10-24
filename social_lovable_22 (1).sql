-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Oct 24, 2025 at 01:27 PM
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
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `title`, `content`, `platforms`, `status`, `is_ai_generated`, `ai_prompt`, `scheduled_at`, `published_at`, `user_id`, `category`, `tags`, `media_urls`, `analytics`, `image_prompt`, `image_url`, `created_at`, `updated_at`) VALUES
(7, 'clothes', '🚀 Exciting news about clothes!\n\nclothes is revolutionizing the way we think about marketing. Whether you\'re new to this space or a seasoned professional, there\'s something for everyone.\n\nKey highlights:\n• Innovation in clothes\n• Benefits for adults\n• Future opportunities\n\nWhat are your thoughts on clothes? Share your experience in the comments below!\n\n#clothes #Innovation #Marketing', '[\"Facebook\"]', 'draft', 1, 'clothes', NULL, NULL, 3, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-13 05:59:02', '2025-10-13 05:59:02'),
(15, 'sfs', '**Unlock Your Potential with SFS**\n\nDiscover the power of SFS, a revolutionary platform designed to empower adults in their personal and professional lives. Our cutting-edge solutions cater to the diverse needs of modern adults, providing unparalleled support and guidance.\n\nWith SFS, you can:\n\n* Enhance your skills and knowledge\n* Boost your confidence and self-esteem\n* Achieve your goals and aspirations\n* Connect with like-minded individuals\n\nJoin our community today and experience the transformative impact of SFS. Stay ahead of the curve and unlock your full potential. Learn more about our innovative services and take the first step towards a brighter future.', '[\"Facebook\"]', 'published', 1, 'sfs', '2025-10-16 05:38:00', '2025-10-16 05:38:03', 2, NULL, NULL, NULL, NULL, 'fish', 'https://image.pollinations.ai/prompt/fish?width=1024&height=1024&nologo=true', '2025-10-16 05:37:05', '2025-10-16 05:38:03'),
(16, 'shoes', '\"Elevate Your Style with Our Premium Footwear Collection\n\nDiscover the perfect blend of comfort and sophistication with our latest range of shoes, designed specifically for adults. From sleek and modern designs to timeless classics, our collection has something for everyone.\n\nWith a focus on quality and craftsmanship, our shoes are built to last, ensuring you can enjoy your favorite styles for years to come. Whether you\'re dressing up for a special occasion or dressing down for a casual day out, our shoes are the perfect choice.\n\nVisit us today and experience the comfort, style, and versatility of our premium footwear collection. Treat your feet to the best and take your shoe game to the next level. Explore now and elevate your style!\"', '[\"Facebook\"]', 'published', 1, 'shoes', '2025-10-16 05:52:00', '2025-10-16 05:52:03', 2, NULL, NULL, NULL, NULL, 'shoes', 'https://image.pollinations.ai/prompt/shoes?width=1024&height=1024&nologo=true', '2025-10-16 05:51:44', '2025-10-16 05:52:03'),
(17, 'shoes collection 1', 'FFFFFFFFFFFFFF', '[\"Facebook\"]', 'published', 1, 'Business/Creator: shoes collection 1\nDescription: cacs\nPlatforms: scs\nBrand Voice: scsc\nHashtags: scsc\nImage Style: minimal', '2025-10-16 11:59:00', '2025-10-16 11:59:06', 2, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-16 11:51:09', '2025-10-16 11:59:06'),
(18, '2e2', 'Based on the provided details, I will create a comprehensive outline for the 2e2 brand.\n\n**Business/Creator:** 2e2\n**Description:** qsqs (assuming this is a placeholder, I\'ll create a generic description) - 2e2 is a innovative company that specializes in providing cutting-edge solutions to simplify and streamline business processes.\n\n**Platforms:** scs (assuming this refers to social media platforms, I\'ll list a few) - Twitter, Instagram, Facebook, LinkedIn\n\n**Brand Voice:** scsc (assuming this refers to a tone of voice, I\'ll describe a generic tone) - 2e2\'s brand voice is professional, approachable, and informative. We aim to educate and engage our audience with clear and concise language.\n\n**Hashtags:** scsc (assuming this refers to a set of hashtags, I\'ll create a few) - #2e2Innovates #SimplifyYourBusiness #StreamlineYourProcess\n\n**Image Style:** minimal - 2e2\'s visual identity features a clean and minimalist aesthetic, with a focus on simple shapes, bold typography, and a limited color palette. This style is reflected in our logo, website, and social media graphics.\n\nHere\'s an example of what a social media post from 2e2 might look like:\n\n**Twitter Post:**\n\"Simplify your business processes with 2e2\'s innovative solutions! Our expert team is dedicated to helping you streamline your operations and increase productivity. #2e2Innovates #SimplifyYourBusiness\"\n\n**Instagram Post:**\n\"Minimalism is key to our design philosophy at 2e2. We believe that simplicity is the foundation of innovation. Check out our latest blog post to learn more about how our minimalist approach can benefit your business. #2e2Innovates #MinimalistDesign\"\n\n**Facebook Post:**\n\"Are you tired of complicated business processes holding you back? At 2e2, we\'re dedicated to providing cutting-edge solutions to simplify and streamline your operations. Our team of experts is here to help you every step of the way. #2e2Innovates #StreamlineYourProcess\"\n\n**LinkedIn Post:**\n\"As a business leader, you understand the importance of efficiency and productivity. At 2e2, we\'re committed to helping you achieve your goals with our innovative solutions and expert guidance. Let\'s work together to simplify your business processes and take your company to the next level. #2e2Innovates #SimplifyYourBusiness\"', '[\"Facebook\"]', 'published', 1, 'Business/Creator: 2e2\nDescription: qsqs\nPlatforms: scs\nBrand Voice: scsc\nHashtags: scsc\nImage Style: minimal', '2025-10-16 12:39:00', '2025-10-16 12:39:04', 2, NULL, NULL, NULL, NULL, 'clothes', NULL, '2025-10-16 12:38:34', '2025-10-16 12:39:04'),
(19, '2e2', 'It seems like you\'ve provided a template with placeholders, but without actual content. To create a cohesive brand identity for \"2e2\", I\'ll fill in the details with hypothetical information. Feel free to replace these with your actual preferences.\n\n**Title:** 2e2\n**Details:** Business/Creator: 2e2 is a cutting-edge tech firm specializing in innovative software solutions.\n**Description:** At 2e2, we\'re passionate about crafting intuitive and user-friendly products that simplify complex tasks, making life easier for our customers.\n**Platforms:** Our products and services are available on Web, Mobile (iOS and Android), and Desktop (Windows and macOS) platforms.\n**Brand Voice:** Our tone is approachable, informative, and slightly humorous, aiming to educate and engage our audience without being overly technical.\n**Hashtags:** #InnovateWith2e2 #TechForAll #SimplifyYourLife #SoftwareSolutions\n**Image Style:** We prefer a minimalistic aesthetic, focusing on clean lines, ample whitespace, and a limited color palette that reflects our brand\'s personality: calming blues (#4567b7) and energetic oranges (#ff9900).\n\nThis setup provides a clear and modern brand identity for 2e2, emphasizing innovation, user experience, and approachability.', '[\"Facebook\"]', 'published', 1, 'Business/Creator: 2e2\nDescription: qsqs\nPlatforms: scs\nBrand Voice: scsc\nHashtags: scsc\nImage Style: minimal', '2025-10-15 23:14:00', '2025-10-16 12:42:03', 2, NULL, NULL, NULL, NULL, 'sparrow', 'https://image.pollinations.ai/prompt/sparrow?width=1024&height=1024&nologo=true', '2025-10-16 12:40:56', '2025-10-16 12:44:53'),
(20, 'shoes', 'Here\'s a potential social media post based on the provided details:\n\n**Post:**\nElevate your style with our branded shoes\nFrom sleek and modern to bold and statement-making, our collection has something for everyone.\nShop now and experience the comfort and quality of our shoes\n#scsc #shoes #minimalstyle\n\n**Image:**\nA minimalist photo of a pair of shoes against a plain background, with a focus on the shoe\'s design and details.\n\n**Platform:**\nThe post will be published on the SCS platform.\n\n**Brand Voice:**\nThe tone of the post is consistent with the SCSC brand voice, which is modern, sleek, and sophisticated.\n\n**Hashtags:**\nThe post includes the #scsc hashtag, which is the primary hashtag for the brand, as well as #shoes and #minimalstyle to reach a wider audience interested in fashion and minimalist design.\n\nLet me know if you want to make any changes or if you have any other requests!', '[\"Facebook\"]', 'published', 1, 'Business/Creator: shoes\nDescription: branded shoes\nPlatforms: scs\nBrand Voice: scsc\nHashtags: scsc\nImage Style: minimal', NULL, NULL, 2, NULL, NULL, NULL, NULL, 'ss', 'https://image.pollinations.ai/prompt/ss?width=1024&height=1024&nologo=true', '2025-10-17 06:48:39', '2025-10-17 06:48:39'),
(21, 'shoes', 'Here\'s a social media post for the Diwali festival:\n\n**Image:** A simple, minimalist photo of a pair of branded shoes on a clean, white background. The shoes are decorated with intricate, traditional Indian designs to give a festive touch.\n\n**Caption:**\n\"Add a sparkle to your Diwali celebrations with our exclusive range of branded shoes! \nFrom elegant heels to comfortable flats, our collection has something for everyone. \nVisit us on SCS and get ready to shine this festive season! #SCSC #DiwaliVibes #BrandedShoes #MinimalChic\"\n\n**Brand Voice:** The tone of the post is elegant, sophisticated, and festive, reflecting the SCSC brand voice.\n\n**Hashtags:** #SCSC #DiwaliVibes #BrandedShoes #MinimalChic\n\n**Platforms:** The post will be published on SCS ( likely a social commerce platform).\n\nThis post aims to showcase the branded shoes in a simple yet elegant way, highlighting their quality and style, while also giving a nod to the festive spirit of Diwali.', '[\"Facebook\"]', 'published', 1, 'Business/Creator: shoes\nDescription: branded shoes\nPlatforms: scs\nBrand Voice: scsc\nHashtags: scsc\nImage Style: minimal\nFestival/Event: Diwali', '2025-10-17 11:12:00', '2025-10-17 11:12:03', 2, NULL, NULL, NULL, NULL, 'Diwali special sport black shoes', 'https://image.pollinations.ai/prompt/Diwali_special_sport_black_shoes?width=1024&height=1024&nologo=true', '2025-10-17 11:10:05', '2025-10-17 11:12:03'),
(22, 'shoes', 'this is my manual post', '[\"Facebook\"]', 'published', 1, 'Business/Creator: shoes\nDescription: branded shoes\nPlatforms: scs\nBrand Voice: scsc\nHashtags: scsc\nImage Style: minimal\nFestival/Event: Diwali', '2025-10-17 11:18:00', '2025-10-17 11:18:03', 2, NULL, NULL, NULL, NULL, 'chakla belan', 'https://image.pollinations.ai/prompt/chakla_belan?width=1024&height=1024&nologo=true', '2025-10-17 11:16:56', '2025-10-17 11:18:03'),
(23, 'shoes', 'qwfwfwqfwqfw', '[\"Facebook\"]', 'published', 1, 'Business/Creator: shoes\nDescription: branded shoes\nPlatforms: scs\nBrand Voice: scsc\nHashtags: scsc\nImage Style: minimal\nFestival/Event: Diwali', '2025-10-17 11:19:00', '2025-10-17 11:19:02', 2, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-17 11:18:43', '2025-10-17 11:19:02'),
(24, 'shoes', 't6r6rzz z ', '[\"Facebook\", \"Instagram\"]', 'published', 1, 'Business/Creator: shoes\nDescription: branded shoes\nPlatforms: scs\nBrand Voice: scsc\nHashtags: scsc\nImage Style: minimal\nFestival/Event: Diwali', NULL, NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 12:56:25', '2025-10-24 12:56:25'),
(25, 'shoes', 't6r6rzz z ', '[\"Instagram\"]', 'published', 1, 'Business/Creator: shoes\nDescription: branded shoes\nPlatforms: scs\nBrand Voice: scsc\nHashtags: scsc\nImage Style: minimal\nFestival/Event: Diwali', NULL, NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 12:58:03', '2025-10-24 12:58:03'),
(26, 'shoes', 'scscscscscsc', '[\"Instagram\"]', 'published', 1, 'Business/Creator: shoes\nDescription: branded shoes\nPlatforms: scs\nBrand Voice: scsc\nHashtags: scsc\nImage Style: minimal\nFestival/Event: Diwali', NULL, NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 12:58:38', '2025-10-24 12:58:38'),
(27, 'shoes', 'scscscscscsc', '[\"Instagram\"]', 'published', 1, 'Business/Creator: shoes\nDescription: branded shoes\nPlatforms: scs\nBrand Voice: scsc\nHashtags: scsc\nImage Style: minimal\nFestival/Event: Diwali', NULL, NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 12:59:07', '2025-10-24 12:59:07'),
(28, 'shoes', 'scscscscscsc', '[\"Instagram\"]', 'published', 1, 'Business/Creator: shoes\nDescription: branded shoes\nPlatforms: scs\nBrand Voice: scsc\nHashtags: scsc\nImage Style: minimal\nFestival/Event: Diwali', NULL, NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 12:59:53', '2025-10-24 12:59:53'),
(29, 'shoes', 'scscscscscsc', '[\"Instagram\"]', 'published', 1, 'Business/Creator: shoes\nDescription: branded shoes\nPlatforms: scs\nBrand Voice: scsc\nHashtags: scsc\nImage Style: minimal\nFestival/Event: Diwali', NULL, NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 13:00:37', '2025-10-24 13:00:37'),
(30, 'shoes', 'scscscscscsc', '[\"Instagram\"]', 'published', 1, 'Business/Creator: shoes\nDescription: branded shoes\nPlatforms: scs\nBrand Voice: scsc\nHashtags: scsc\nImage Style: minimal\nFestival/Event: Diwali', NULL, NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 13:06:09', '2025-10-24 13:06:09'),
(31, 'shoes', 'scscscscscsc', '[\"Instagram\"]', 'published', 1, 'Business/Creator: shoes\nDescription: branded shoes\nPlatforms: scs\nBrand Voice: scsc\nHashtags: scsc\nImage Style: minimal\nFestival/Event: Diwali', NULL, NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 13:08:58', '2025-10-24 13:08:58'),
(32, 'shoes', 'NIlesh is Backend Devloper', '[\"Instagram\"]', 'published', 1, 'Business/Creator: shoes\nDescription: branded shoes\nPlatforms: scs\nBrand Voice: scsc\nHashtags: scsc\nImage Style: minimal\nFestival/Event: Diwali', NULL, NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-24 13:12:20', '2025-10-24 13:12:20'),
(33, 'shoes', 'Here\'s a potential social media post for the \"shoes\" business:\n\n**Image:** A minimalist photo of a pair of branded shoes on a clean, simple background. The shoes are the main focus of the image, with a subtle sparkle effect to hint at the festive season.\n\n**Caption:**\n\"Add a sparkle to your Diwali celebrations with our stunning branded shoes! From sleek and sophisticated to bold and statement-making, our collection has something for everyone. #SCSC #DiwaliVibes #ShoesToDieFor\"\n\n**Platform:** SCS (assuming this refers to a social media platform, such as Instagram or Facebook)\n\n**Brand Voice:** The tone of the caption is consistent with the \"scsc\" brand voice, which appears to be sleek, modern, and fashionable.\n\n**Hashtags:** #SCSC #DiwaliVibes #ShoesToDieFor (using the branded hashtag #SCSC, as well as relevant festival-themed hashtags)\n\nThis post aims to showcase the branded shoes in a stylish and festive light, while also highlighting the excitement and joy of the Diwali celebrations. The minimalist image style and sleek caption are designed to appeal to the target audience and reflect the \"scsc\" brand voice.', '[\"Instagram\"]', 'published', 1, 'Business/Creator: shoes\nDescription: branded shoes\nPlatforms: scs\nBrand Voice: scsc\nHashtags: scsc\nImage Style: minimal\nFestival/Event: Diwali', NULL, NULL, 2, NULL, NULL, NULL, NULL, 'black nose', 'https://image.pollinations.ai/prompt/black_nose?width=1024&height=1024&nologo=true', '2025-10-24 13:16:16', '2025-10-24 13:17:33'),
(34, 'shoes', 'Here\'s a potential social media post for the \"Shoes\" business:\n\n**Post:** Diwali Special Offer!\nCelebrate the festival of lights with a spark in your step! Get 20% off on our branded shoes collection, only on SCS!\n**Image:** A minimalist photo of a pair of shoes with a subtle Diwali-themed background, such as a few diyas or a string of fairy lights.\n**Caption:** \"Add a touch of elegance to your Diwali celebrations with our stunning shoes collection! Use code DIWALI20 at checkout to redeem your 20% discount. #SCSC #DiwaliVibes #ShoesLove #MinimalChic\"\n**Tone:** The tone of the post is festive and inviting, with a touch of sophistication and elegance, reflecting the SCSC brand voice.\n**Hashtags:** #SCSC #DiwaliVibes #ShoesLove #MinimalChic, to reach a wider audience and create a buzz around the brand.\n**Call-to-Action:** The post encourages users to visit the SCS platform and use the code DIWALI20 at checkout to redeem the discount, driving sales and engagement.', '[\"Instagram\"]', 'published', 1, 'Business/Creator: shoes\nDescription: branded shoes\nPlatforms: scs\nBrand Voice: scsc\nHashtags: scsc\nImage Style: minimal\nFestival/Event: Diwali', NULL, NULL, 2, NULL, NULL, NULL, NULL, 'dog', 'https://image.pollinations.ai/prompt/dog?width=1024&height=1024&nologo=true', '2025-10-24 13:19:15', '2025-10-24 13:19:15'),
(35, 'shoes', 'Here\'s a potential social media post for the \"shoes\" business:\n\n**Image:** A minimalist photo of a pair of branded shoes on a clean, simple background. The shoes are the focus of the image, with a subtle sparkle or glow to hint at the festive season.\n\n**Caption:**\n\"Sparkle this Diwali with our stunning branded shoes! From sleek and sophisticated to bold and beautiful, our collection has something for everyone. Treat yourself or gift someone special with our exclusive range. #SCSC #DiwaliVibes #ShoesToDieFor\"\n\n**Platform:** SCS (assuming this is a social commerce platform)\n\n**Brand Voice:** SCSC (modern, trendy, and fashionable, with a touch of sophistication)\n\n**Hashtags:** #SCSC #DiwaliVibes #ShoesToDieFor (to reach a wider audience and create a buzz around the brand)\n\nThis post aims to showcase the branded shoes in a stylish and attention-grabbing way, while also highlighting the festive spirit of Diwali. The minimalist image style and modern brand voice are designed to appeal to a fashion-conscious audience, while the hashtags help to increase the post\'s visibility and reach.', '[\"Instagram\"]', 'published', 1, 'Business/Creator: shoes\nDescription: branded shoes\nPlatforms: scs\nBrand Voice: scsc\nHashtags: scsc\nImage Style: minimal\nFestival/Event: Diwali', '2025-10-24 13:24:00', '2025-10-24 13:24:07', 2, NULL, NULL, NULL, NULL, 'shoes black sports', 'https://image.pollinations.ai/prompt/shoes_black_sports?width=1024&height=1024&nologo=true', '2025-10-24 13:23:13', '2025-10-24 13:24:07');

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
(1, 2, 'shoes', 'branded shoes', 'scs', 'scsc', 'scsc', 'minimal', 'Diwali', '2025-10-16 10:40:01', '2025-10-17 11:07:18');

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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `social_accounts`
--

INSERT INTO `social_accounts` (`id`, `user_id`, `platform`, `account_id`, `account_name`, `app_id`, `app_secret`, `access_token`, `refresh_token`, `token_expires_at`, `is_active`, `metadata`, `created_at`, `updated_at`) VALUES
(4, 3, 'Facebook', NULL, NULL, 'ffffffffffff-444', 'ffffffffff-4444', NULL, NULL, NULL, 1, NULL, '2025-10-13 08:34:43', '2025-10-13 09:27:53'),
(8, 2, 'Facebook', NULL, NULL, '2934798226703542', 'acb8d713392b5fb7e59e0022b63d4056', 'EAAptLvXKRLYBPpZASatSRNGZAXuj2rUdWfEgcpynEehm0KPoZCe39Vwadubbppymm5fJ8kqiqEUWlFopyed3JFpsZA9n4PMZBD5ZBvpYuZBROrk8CAG4C2Hv71kVAGkvcYFSpcK81jeeFZBvgF4APtmk5h9eAlyucEkfyAkcNKXtmcKmBc5d3h77ZBWQZCfrgc7dEGbUMdzrbf4i74mP6RZBExqwNFx32WYZB2tsiZCiTton4l9GbR87IZCjZAxauZCKHtGV', NULL, NULL, 0, NULL, '2025-10-14 11:05:47', '2025-10-23 06:54:28'),
(9, 2, 'Instagram', NULL, NULL, '1519636216049823', '003e8626534116b9956c139c1c0bb462', 'IGAAVmGeDYcJ9BZAFNhdXpaYUJZAWGdHblBnZATh5WThoRHhfQ1dvNTN5cjFzZAWJndzJTWDJPX0diVHVFS2U2WGVqZAElvcHI3azQxMXZAyQjQxZA3B0Uy1xZATFEMUhZAR25ZAakRqQVFrOEQ0dXRzazZACNy01Mzd4T1lXOGVDNGhHcHpSMHZAxdUdwLW5vbEJaWFV0SXk5d28xZAQZDZD', NULL, NULL, 1, NULL, '2025-10-24 12:46:36', '2025-10-24 12:46:36');

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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

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
(7, 2, 3, 'cancelled', '2025-10-17 06:46:43', NULL, 0, 0, 0, '2025-10-17 06:46:43', '2025-10-17 06:48:07');

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
-- Constraints for table `profiles`
--
ALTER TABLE `profiles`
  ADD CONSTRAINT `profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

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
