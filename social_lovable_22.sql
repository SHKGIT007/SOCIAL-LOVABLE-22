-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Nov 08, 2025 at 10:58 AM
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
-- Table structure for table `aigenrateposts`
--

DROP TABLE IF EXISTS `aigenrateposts`;
CREATE TABLE IF NOT EXISTS `aigenrateposts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('0','1') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `is_ai_generated` tinyint(1) NOT NULL DEFAULT '0',
  `ai_prompt` text COLLATE utf8mb4_unicode_ci,
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `aigenrateposts`
--

INSERT INTO `aigenrateposts` (`id`, `title`, `content`, `status`, `is_ai_generated`, `ai_prompt`, `scheduled_at`, `published_at`, `user_id`, `category`, `tags`, `media_urls`, `analytics`, `image_prompt`, `image_url`, `video_url`, `created_at`, `updated_at`) VALUES
(1, 'jewelery', 'Here\'s a social media post for Tanishq Jewelry on Instagram, incorporating the given details:\n\n**Post:**\n\"Rangon ki duniya mein, apna rang bharne ka samay hai! (It\'s time to add your color to the world of colors!) \n\nHappy Holi from Tanishq!\n\nAs we celebrate the vibrant festival of Holi, we\'re inspired by the beauty of green gemstones. Our stunning green jewelry collection is a perfect blend of tradition and modernity, just like the festival itself.\n\nAdorn yourself with our exquisite green jewelry pieces, each one crafted with love and precision. From elegant earrings to stunning necklaces, our collection has something for everyone.\n\n**Shop Now** and add a pop of color to your Holi celebrations!\n\n**Hashtags:** #DpPunjab #HoliVibes #GreenJewelry #Tanishq #JewelryLover #FestivalFashion #IndianJewelry #ColorfulJewelry\n\n**Image:** A beautiful model wearing a stunning green gemstone necklace, with a vibrant Holi-inspired backdrop. The image should be bright, colorful, and eye-catching, showcasing the beauty of Tanishq\'s green jewelry collection.\n\n**Call-to-Action (CTA):** Shop Now (link to Tanishq\'s website or online store)\n\nThis post aims to capture the essence of Holi and the beauty of green gemstones, while showcasing Tanishq\'s stunning jewelry collection. The hashtags #DpPunjab and #HoliVibes will help reach a wider audience, especially in Punjab and among Holi enthusiasts. The brand voice is consistent with Tanishq\'s elegant and sophisticated tone, making the post appealing to jewelry lovers and festival enthusiasts alike.', '0', 0, 'Title: jewelery\nDetails: Business/Creator: jewelery\nDescription: Jewelry is a form of personal adornment made from precious metals, gemstones, and other decorative materials. It includes items such as necklaces, earrings, rings, bracelets, bangles, and anklets. Jewelry is not only worn for beauty but also symbolizes love, tradition, culture, and status. From ancient times to modern fashion, jewelry has always been an expression of personality and elegance.\nPlatforms: instagaram\nBrand Voice: tanishq\nHashtags: dp punjab\nImage Style: green jewelery\nFestival/Event: holi', NULL, NULL, 2, NULL, NULL, NULL, NULL, 'green jewelery', 'https://image.pollinations.ai/prompt/green_jewelery?width=1024&height=1024&nologo=true', NULL, '2025-11-07 11:56:13', '2025-11-07 11:56:13'),
(2, 'jewelery', 'Here\'s a social media post for Tanishq Jewelry on Instagram, incorporating the given details:\n\n**Post:** \n\"Holi Hai! \nAs we dive into the vibrant colors of Holi, let\'s add a pop of green to our celebrations with our stunning green jewelry collection! \nFrom elegant emeralds to vibrant peridots, our green jewelry pieces are sure to make you shine like a diamond in the crowd. \nWhether you\'re celebrating with loved ones or simply embracing the spirit of the festival, our jewelry is the perfect way to express your personality and elegance. \nSo, go ahead and make a statement with our gorgeous green jewels! \n#DPpunjab #HoliVibes #GreenJewelry #Tanishq #JewelryLover #HoliCelebrations #FestivalFashion\"\n\n**Image:** A beautiful model wearing a stunning green emerald necklace, with a vibrant green background and Holi-themed decorations. The model\'s outfit is a traditional Indian attire, with a mix of modern and traditional elements, reflecting the Tanishq brand voice.\n\n**Caption Style:** The caption is written in a fun, playful tone, with a touch of elegance and sophistication, reflecting the Tanishq brand voice. The use of hashtags #DPpunjab and #HoliVibes connects the post to the local audience and the festival, while #GreenJewelry and #JewelryLover highlight the product and target audience.', '0', 1, 'Title: jewelery\nDetails: Business/Creator: jewelery\nDescription: Jewelry is a form of personal adornment made from precious metals, gemstones, and other decorative materials. It includes items such as necklaces, earrings, rings, bracelets, bangles, and anklets. Jewelry is not only worn for beauty but also symbolizes love, tradition, culture, and status. From ancient times to modern fashion, jewelry has always been an expression of personality and elegance.\nPlatforms: instagaram\nBrand Voice: tanishq\nHashtags: dp punjab\nImage Style: green jewelery\nFestival/Event: holi', NULL, NULL, 2, NULL, NULL, NULL, NULL, 'green jewelery', 'https://image.pollinations.ai/prompt/green_jewelery?width=1024&height=1024&nologo=true', NULL, '2025-11-07 12:14:10', '2025-11-07 12:14:10'),
(3, 'jewelery', 'Here\'s a post for the jewelry business on Instagram:\n\n**Post:**\n\"Holi Hai! \nAs the festival of colors approaches, add a splash of green to your celebrations with our stunning green jewelry collection!\nFrom elegant emeralds to vibrant peridot, our pieces are designed to make you shine like a ray of sunshine. \nAt Tanishq, we believe that jewelry is not just a form of personal adornment, but a way to express your personality and elegance. \nSo, why settle for ordinary when you can wear extraordinary? \nShop our green jewelry collection now and make this Holi a memorable one! \n#DPpunjab #HoliVibes #GreenJewelry #Tanishq #JewelryLover #FestivalFashion #ColorfulCelebrations\"\n\n**Image:** A beautiful model wearing a stunning green necklace with emeralds and peridot, surrounded by colorful Holi decorations. The image is bright, vibrant, and eye-catching, with a mix of green and colorful hues.\n\n**Instagram Story:**\n\"Get ready to shine this Holi with our green jewelry collection! Swipe up to shop now and don\'t forget to use #DPpunjab for a chance to be featured on our page! \"\n\n**Instagram Reels:**\nA short video showcasing the green jewelry collection, with a mix of close-up shots and models wearing the pieces. The video is set to upbeat music and has a fun, festive vibe. The reel ends with a call-to-action, encouraging viewers to shop the collection now.', '0', 1, 'Title: jewelery\nDetails: Business/Creator: jewelery\nDescription: Jewelry is a form of personal adornment made from precious metals, gemstones, and other decorative materials. It includes items such as necklaces, earrings, rings, bracelets, bangles, and anklets. Jewelry is not only worn for beauty but also symbolizes love, tradition, culture, and status. From ancient times to modern fashion, jewelry has always been an expression of personality and elegance.\nPlatforms: instagaram\nBrand Voice: tanishq\nHashtags: dp punjab\nImage Style: green jewelery\nFestival/Event: holi', NULL, NULL, 2, NULL, NULL, NULL, NULL, 'green jewelery', 'https://image.pollinations.ai/prompt/green_jewelery?width=1024&height=1024&nologo=true', NULL, '2025-11-07 16:11:54', '2025-11-07 16:11:54'),
(4, 'jewelery', 'Here\'s a post for the jewelry business on Instagram:\n\n**Image:** A beautiful photo of a woman wearing a stunning green gemstone necklace, with a vibrant green backdrop to match the Holi theme. The jewelry piece is designed in a traditional Indian style, with intricate details and a mix of modern and classic elements.\n\n**Caption:**\n\"Rang Barse, with Tanishq! This Holi, add a touch of elegance to your celebrations with our exquisite green jewelry collection! From statement necklaces to delicate earrings, our pieces are designed to make you shine. Just like the colors of Holi, our jewelry symbolizes love, joy, and new beginnings. #Tanishq #HoliVibes #GreenJewelry #DPpunjab #FestivalFashion #JewelryLover #IndianJewelry #TraditionalMeetsModern\"\n\n**Brand Voice:** The caption is written in a warm and inviting tone, with a touch of playfulness to match the festive spirit of Holi. The use of \"Rang Barse\" (a popular Holi phrase) and the hashtag #HoliVibes adds to the celebratory feel.\n\n**Hashtags:** #Tanishq #HoliVibes #GreenJewelry #DPpunjab #FestivalFashion #JewelryLover #IndianJewelry #TraditionalMeetsModern\n\n**Call-to-Action:** The caption encourages users to explore Tanishq\'s green jewelry collection and make a statement this Holi. The hashtags #JewelryLover and #FestivalFashion invite users to share their own jewelry styles and festive looks, creating a sense of community and engagement.', '0', 1, 'Title: jewelery\nDetails: Business/Creator: jewelery\nDescription: Jewelry is a form of personal adornment made from precious metals, gemstones, and other decorative materials. It includes items such as necklaces, earrings, rings, bracelets, bangles, and anklets. Jewelry is not only worn for beauty but also symbolizes love, tradition, culture, and status. From ancient times to modern fashion, jewelry has always been an expression of personality and elegance.\nPlatforms: instagaram\nBrand Voice: tanishq\nHashtags: dp punjab\nImage Style: green jewelery\nFestival/Event: holi', NULL, NULL, 2, NULL, NULL, NULL, NULL, 'green jewelery', 'https://image.pollinations.ai/prompt/green_jewelery?width=1024&height=1024&nologo=true', NULL, '2025-11-07 16:21:27', '2025-11-07 16:21:27'),
(5, 'jewelery', 'Here\'s a post for the Instagram platform:\n\n**Image:** A beautiful model wearing a stunning yellow gold necklace with intricate designs, paired with matching earrings and a bright smile. The background is a vibrant mix of colors, capturing the essence of Holi.\n\n**Caption:**\n\"Rang Barse, with love and sparkle! This Holi, add a touch of sunshine to your celebrations with our stunning yellow gold jewelry collection! From statement necklaces to elegant earrings, our designs are sure to make you shine. #Tanishq #HoliVibes #YellowJewelry #DPpunjab #JewelryLover #FestivalFashion #RangBarse\"\n\n**Brand Voice:** Tanishq, a renowned jewelry brand, is known for its exquisite and traditional designs. The tone of the caption is festive, vibrant, and inviting, reflecting the spirit of Holi and the brand\'s personality.\n\n**Hashtags:**\n\n* #Tanishq: The brand\'s official hashtag\n* #HoliVibes: To connect with the festival and its celebrations\n* #YellowJewelry: To showcase the specific color theme of the jewelry\n* #DPpunjab: To reach a specific audience and create a local connection\n* #JewelryLover: To appeal to jewelry enthusiasts and fans\n* #FestivalFashion: To highlight the occasion and the jewelry\'s relevance\n* #RangBarse: A popular Holi phrase, adding a playful touch to the caption\n\nThis post aims to capture the essence of Holi and the beauty of yellow gold jewelry, while showcasing Tanishq\'s stunning collection and inviting customers to celebrate the festival with style and elegance.', '0', 1, 'Title: jewelery\nDetails: Business/Creator: jewelery\nDescription: Jewelry is a form of personal adornment made from precious metals, gemstones, and other decorative materials. It includes items such as necklaces, earrings, rings, bracelets, bangles, and anklets. Jewelry is not only worn for beauty but also symbolizes love, tradition, culture, and status. From ancient times to modern fashion, jewelry has always been an expression of personality and elegance.\nPlatforms: instagaram\nBrand Voice: tanishq\nHashtags: dp punjab\nImage Style: yellow jewelery\nFestival/Event: holi', NULL, NULL, 2, NULL, NULL, NULL, NULL, 'yellow jewelery', 'https://image.pollinations.ai/prompt/yellow_jewelery?model=flux&width=1024&height=1024&nologo=true', NULL, '2025-11-08 06:58:07', '2025-11-08 06:58:07'),
(6, 'jewelery', 'Here\'s a potential Instagram post for Tanishq jewelry, incorporating the given details:\n\n**Image:** A vibrant and colorful photo of a beautiful woman wearing stunning yellow jewelry, including a bold necklace, earrings, and bangles, against a backdrop of Holi celebrations.\n\n**Caption:**\n\"Rang Barse, with love and joy! This Holi, add a touch of sunshine to your celebrations with our exquisite yellow jewelry collection! From statement necklaces to elegant earrings, our pieces are designed to make you shine. At Tanishq, we believe that jewelry is not just a form of personal adornment, but a symbol of love, tradition, and culture. So, let\'s come together and celebrate the colors of life with our stunning yellow jewelry! #DpPunjab #HoliVibes #YellowJewelry #Tanishq #JewelryLover #FestivalFashion #ColorfulCelebrations\"\n\n**Hashtags:** #DpPunjab #HoliVibes #YellowJewelry #Tanishq #JewelryLover #FestivalFashion #ColorfulCelebrations\n\n**Brand Voice:** The caption is written in a warm and inviting tone, reflecting the Tanishq brand voice, which is known for its emphasis on tradition, culture, and elegance.\n\n**Image Style:** The image features yellow jewelry, which is the specified image style, and is set against a vibrant and colorful backdrop, capturing the essence of Holi celebrations.\n\n**Festival/Event:** The post is centered around the festival of Holi, which is a significant event in Indian culture, and is a great opportunity for Tanishq to showcase its stunning yellow jewelry collection.', '0', 1, 'Title: jewelery\nDetails: Business/Creator: jewelery\nDescription: Jewelry is a form of personal adornment made from precious metals, gemstones, and other decorative materials. It includes items such as necklaces, earrings, rings, bracelets, bangles, and anklets. Jewelry is not only worn for beauty but also symbolizes love, tradition, culture, and status. From ancient times to modern fashion, jewelry has always been an expression of personality and elegance.\nPlatforms: instagaram\nBrand Voice: tanishq\nHashtags: dp punjab\nImage Style: yellow jewelery\nFestival/Event: holi', NULL, NULL, 2, NULL, NULL, NULL, NULL, 'yellow jewelery', 'https://image.pollinations.ai/prompt/yellow_jewelery?width=1024&height=1024&nologo=true', NULL, '2025-11-08 07:01:33', '2025-11-08 07:01:33'),
(7, 'jewelery', 'Here\'s a social media post for Tanishq jewelry on Instagram, incorporating the given details:\n\n**Post:**\n\"Holi Hai! \nAs we celebrate the festival of colors, let\'s add a touch of gold to our festivities! \nIntroducing our stunning collection of yellow jewelry, perfect for the occasion. \nFrom elegant necklaces to vibrant earrings, our pieces are designed to make you shine. \nAt Tanishq, we believe that jewelry is not just a form of personal adornment, but a symbol of love, tradition, and culture. \nSo, why settle for just any color when you can wear the brightest and most beautiful yellow jewelry? \n#HoliVibes #YellowJewelry #Tanishq #DpPunjab #JewelryLover #FestivalFashion #GoldJewelry #IndianJewelry #TraditionalElegance\"\n\n**Image:** A beautiful model wearing a stunning yellow gold necklace, earrings, and bangles, with a vibrant Holi-themed background. The image is bright, colorful, and eye-catching, perfect for the festive occasion.\n\n**Hashtags:** #DpPunjab #HoliVibes #YellowJewelry #Tanishq #JewelryLover #FestivalFashion #GoldJewelry #IndianJewelry #TraditionalElegance\n\n**Brand Voice:** The post is written in a tone that reflects Tanishq\'s brand voice, which is elegant, sophisticated, and festive. The language used is descriptive, and the tone is inviting, making the reader want to explore the collection and celebrate Holi with Tanishq\'s beautiful yellow jewelry.', '0', 1, 'Title: jewelery\nDetails: Business/Creator: jewelery\nDescription: Jewelry is a form of personal adornment made from precious metals, gemstones, and other decorative materials. It includes items such as necklaces, earrings, rings, bracelets, bangles, and anklets. Jewelry is not only worn for beauty but also symbolizes love, tradition, culture, and status. From ancient times to modern fashion, jewelry has always been an expression of personality and elegance.\nPlatforms: instagaram\nBrand Voice: tanishq\nHashtags: dp punjab\nImage Style: yellow jewelery\nFestival/Event: holi', NULL, NULL, 2, NULL, NULL, NULL, NULL, 'yellow jewelery', 'https://image.pollinations.ai/prompt/yellow_jewelery?width=1024&height=1024&nologo=true', NULL, '2025-11-08 10:09:11', '2025-11-08 10:09:11'),
(8, 'jewelery', 'Here\'s a social media post for Tanishq jewelry on Instagram, incorporating the given details:\n\n**Post:**\n\"Rang Barsay with Tanishq this Holi!\nAdd a touch of sunshine to your festive look with our vibrant yellow jewelry collection!\nFrom elegant necklaces to stunning earrings, our pieces are designed to make you shine brighter than the colors of Holi!\nCelebrate the joy of love, tradition, and culture with Tanishq\'s exquisite jewelry.\n#DpPunjab #HoliVibes #TanishqJewelry #YellowJewelry #FestivalFashion #RangBarsay\"\n\n**Image:** A beautiful model wearing a stunning yellow necklace and earrings, with a bright and colorful Holi-themed background. The image showcases the intricate details of the jewelry pieces and the vibrant colors of the festival.\n\n**Caption Style:** The caption is written in a fun and playful tone, matching the spirit of the Holi festival. The use of emojis and hashtags adds to the festive atmosphere, while the brand voice remains elegant and sophisticated, reflecting the Tanishq brand.\n\n**Call-to-Action:** The post encourages users to visit Tanishq\'s Instagram page or website to explore their yellow jewelry collection and get ready to celebrate Holi in style!', '0', 1, 'Title: jewelery\nDetails: Business/Creator: jewelery\nDescription: Jewelry is a form of personal adornment made from precious metals, gemstones, and other decorative materials. It includes items such as necklaces, earrings, rings, bracelets, bangles, and anklets. Jewelry is not only worn for beauty but also symbolizes love, tradition, culture, and status. From ancient times to modern fashion, jewelry has always been an expression of personality and elegance.\nPlatforms: instagaram\nBrand Voice: tanishq\nHashtags: dp punjab\nImage Style: yellow jewelery\nFestival/Event: holi', NULL, NULL, 2, NULL, NULL, NULL, NULL, 'yellow jewelery', 'https://image.pollinations.ai/prompt/yellow_jewelery?width=1024&height=1024&nologo=true', NULL, '2025-11-08 10:44:58', '2025-11-08 10:44:58');

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
  `status` enum('draft','scheduled','published') CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT 'draft',
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
  `scheduleId` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `title`, `content`, `platforms`, `status`, `is_ai_generated`, `ai_prompt`, `scheduled_at`, `published_at`, `user_id`, `category`, `tags`, `media_urls`, `analytics`, `image_prompt`, `image_url`, `video_url`, `scheduleId`, `created_at`, `updated_at`) VALUES
(1, 'Auto Post for facebook at 14:19', 'Scheduled post for facebook at 14:19', '[\"facebook\"]', 'published', 0, NULL, '2025-11-08 08:49:00', '2025-11-08 08:49:00', 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2025-11-08 08:49:00', '2025-11-08 08:49:00'),
(2, 'Auto Post for facebook at 14:28', 'Scheduled post for facebook at 14:28', '[\"facebook\"]', 'published', 0, NULL, '2025-11-08 08:58:00', '2025-11-08 08:58:00', 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2025-11-08 08:58:00', '2025-11-08 08:58:00'),
(3, 'Auto Post for facebook at 14:35', 'Scheduled post for facebook at 14:35', '[\"facebook\"]', 'published', 0, NULL, '2025-11-08 09:05:00', '2025-11-08 09:05:00', 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2025-11-08 09:05:00', '2025-11-08 09:05:00'),
(4, 'Auto Post for facebook at 14:45', 'Scheduled post for facebook at 14:45', '[\"facebook\"]', 'published', 0, NULL, '2025-11-08 09:15:00', '2025-11-08 09:15:01', 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2025-11-08 09:15:01', '2025-11-08 09:15:01'),
(5, 'Auto Post for facebook at 15:07', 'Scheduled post for facebook at 15:07', '[\"facebook\"]', 'published', 1, NULL, '2025-11-08 09:37:00', '2025-11-08 09:37:01', 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2025-11-08 09:37:01', '2025-11-08 09:37:01'),
(6, 'Auto Post for facebook at 15:08', 'Scheduled post for facebook at 15:08', '[\"facebook\"]', 'published', 1, NULL, '2025-11-08 09:38:00', '2025-11-08 09:38:01', 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2025-11-08 09:38:01', '2025-11-08 09:38:01'),
(7, 'Auto Post for facebook at 15:13', 'Scheduled post for facebook at 15:13', '[\"facebook\"]', 'published', 1, NULL, '2025-11-08 09:43:00', '2025-11-08 09:43:00', 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2025-11-08 09:43:00', '2025-11-08 09:43:00'),
(8, 'Auto Post for facebook at 15:38', 'Scheduled post for facebook at 15:38', '[\"facebook\"]', 'published', 1, NULL, '2025-11-08 10:08:00', '2025-11-08 10:08:01', 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, '2025-11-08 10:08:01', '2025-11-08 10:08:01'),
(9, 'jewelery', 'Here\'s a social media post for Tanishq jewelry on Instagram, incorporating the given details:\r\n\r\n**Post:**\r\n\"Holi Hai! \r\nAs we celebrate the festival of colors, let\'s add a touch of gold to our festivities! \r\nIntroducing our stunning collection of yellow jewelry, perfect for the occasion. \r\nFrom elegant necklaces to vibrant earrings, our pieces are designed to make you shine. \r\nAt Tanishq, we believe that jewelry is not just a form of personal adornment, but a symbol of love, tradition, and culture. \r\nSo, why settle for just any color when you can wear the brightest and most beautiful yellow jewelry? \r\n#HoliVibes #YellowJewelry #Tanishq #DpPunjab #JewelryLover #FestivalFashion #GoldJewelry #IndianJewelry #TraditionalElegance\"\r\n\r\n**Image:** A beautiful model wearing a stunning yellow gold necklace, earrings, and bangles, with a vibrant Holi-themed background. The image is bright, colorful, and eye-catching, perfect for the festive occasion.\r\n\r\n**Hashtags:** #DpPunjab #HoliVibes #YellowJewelry #Tanishq #JewelryLover #FestivalFashion #GoldJewelry #IndianJewelry #TraditionalElegance\r\n\r\n**Brand Voice:** The post is written in a tone that reflects Tanishq\'s brand voice, which is elegant, sophisticated, and festive. The language used is descriptive, and the tone is inviting, making the reader want to explore the collection and celebrate Holi with Tanishq\'s beautiful yellow jewelry.', '[\"Facebook\"]', 'published', 1, 'Business/Creator: jewelery\r\nDescription: Jewelry is a form of personal adornment made from precious metals, gemstones, and other decorative materials. It includes items such as necklaces, earrings, rings, bracelets, bangles, and anklets. Jewelry is not only worn for beauty but also symbolizes love, tradition, culture, and status. From ancient times to modern fashion, jewelry has always been an expression of personality and elegance.\r\nPlatforms: instagaram\r\nBrand Voice: tanishq\r\nHashtags: dp punjab\r\nImage Style: yellow jewelery\r\nFestival/Event: holi', NULL, NULL, 2, NULL, NULL, NULL, NULL, 'yellow jewelery', 'https://res.cloudinary.com/diapmjeoc/image/upload/v1762596560/user_2_test/vq0wdoqvrup3bwhmfatv.jpg', NULL, NULL, '2025-11-08 10:09:21', '2025-11-08 10:09:21'),
(10, 'Auto Post for facebook at 16:02', 'Scheduled post for facebook at 16:02', '[\"facebook\"]', 'published', 1, NULL, '2025-11-08 10:32:00', '2025-11-08 10:32:01', 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, '2025-11-08 10:32:01', '2025-11-08 10:32:01'),
(11, 'Auto Post for facebook at 16:16', 'Scheduled post for facebook at 16:16', '[\"facebook\"]', 'published', 1, NULL, '2025-11-08 10:46:00', '2025-11-08 10:46:01', 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, '2025-11-08 10:46:01', '2025-11-08 10:46:01');

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
(1, 2, 'jewelery', 'Jewelry is a form of personal adornment made from precious metals, gemstones, and other decorative materials. It includes items such as necklaces, earrings, rings, bracelets, bangles, and anklets. Jewelry is not only worn for beauty but also symbolizes love, tradition, culture, and status. From ancient times to modern fashion, jewelry has always been an expression of personality and elegance.', 'instagaram', 'tanishq', 'dp punjab', 'yellow jewelery', 'holi', '2025-10-16 10:40:01', '2025-11-08 06:57:10');

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
  `lastRunAt` datetime DEFAULT NULL,
  `timezone` varchar(50) NOT NULL DEFAULT 'Asia/Kolkata',
  `isPaused` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('0','1') NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `schedules`
--

INSERT INTO `schedules` (`id`, `userId`, `platforms`, `days`, `times`, `recurrence`, `customDateFrom`, `customDateTo`, `singleDate`, `lastRunAt`, `timezone`, `isPaused`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 2, '[\"facebook\"]', '[\"daily\"]', '{\"daily\": [\"13:58\", \"14:28\", \"14:31\", \"15:13\"]}', NULL, NULL, NULL, NULL, '2025-11-08 10:58:00', 'Asia/Kolkata', 0, '1', '2025-11-08 07:07:59', '2025-11-08 10:58:00'),
(2, 2, '[\"facebook\"]', '[\"friday\", \"saturday\"]', '{\"friday\": [\"14:17\"], \"saturday\": [\"14:08\"]}', NULL, NULL, NULL, NULL, '2025-11-08 10:58:00', 'Asia/Kolkata', 0, '1', '2025-11-08 08:45:26', '2025-11-08 10:58:00'),
(3, 2, '[\"facebook\"]', '[\"daily\"]', '{\"daily\": [\"16:16\"]}', NULL, NULL, NULL, NULL, '2025-11-08 10:58:00', 'Asia/Kolkata', 0, '1', '2025-11-08 09:57:05', '2025-11-08 10:58:00'),
(4, 2, '[\"facebook\"]', '[\"tuesday\"]', '{\"tuesday\": [\"03:27\"]}', NULL, NULL, NULL, NULL, '2025-11-08 10:58:00', 'Asia/Kolkata', 0, '1', '2025-11-08 09:57:05', '2025-11-08 10:58:00');

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
(8, 2, 'Facebook', NULL, NULL, '2078981645972721', 'a2d090aa2b0b42aeaef2425319c5ded7', 'EAAdi0qKAtPEBPxdvMqAZCUE8wpekNIteYKb57IM2yKQ6O9kugT0qXECR1144GeDHNFDFkLuxvOUYyvdSFjX8G7DL7M6gVKEWaZCZCqI6w8fWoi2fUQnOJzuOhiL318p4Ec4SOuUwSFFtoZAi7YImx5kjilgNWDGR85Q4ZCKrWaQQ4T8pSgQegZCtRgBn5ZBOzaHb7e3FCkcxtM9n023dJIZCJIZAe82qO1PFZArbvKrGVb6ngoG6bfJOOvbm0a1stYhc1UpX5mUEYth0bil4hB9F9A6dMNCaneTSTcZAq2M', NULL, NULL, NULL, NULL, 1, NULL, '2025-10-14 11:05:47', '2025-11-07 09:01:04'),
(9, 2, 'Instagram', NULL, NULL, '1519636216049823', '003e8626534116b9956c139c1c0bb462', 'EAAdi0qKAtPEBPxdvMqAZCUE8wpekNIteYKb57IM2yKQ6O9kugT0qXECR1144GeDHNFDFkLuxvOUYyvdSFjX8G7DL7M6gVKEWaZCZCqI6w8fWoi2fUQnOJzuOhiL318p4Ec4SOuUwSFFtoZAi7YImx5kjilgNWDGR85Q4ZCKrWaQQ4T8pSgQegZCtRgBn5ZBOzaHb7e3FCkcxtM9n023dJIZCJIZAe82qO1PFZArbvKrGVb6ngoG6bfJOOvbm0a1stYhc1UpX5mUEYth0bil4hB9F9A6dMNCaneTSTcZAq2M', NULL, NULL, NULL, NULL, 1, NULL, '2025-10-24 12:46:36', '2025-11-07 09:01:07');

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
-- Constraints for table `aigenrateposts`
--
ALTER TABLE `aigenrateposts`
  ADD CONSTRAINT `aigenrateposts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

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
