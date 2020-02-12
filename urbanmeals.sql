CREATE DATABASE /*!32312 IF NOT EXISTS*/ `urbanmeals` /*!40100 DEFAULT CHARACTER SET latin1 */;

USE `urbanmeals`;

--
-- Table structure for table `Category`
--

DROP TABLE IF EXISTS `Category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Category` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `code` char(11) DEFAULT NULL,
  `name` varchar(30) DEFAULT NULL,
  `image` varchar(50) NOT NULL DEFAULT '/assets/categoryimages/default.png',
  PRIMARY KEY (`ID`),
  UNIQUE KEY `code_UNIQUE` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Category_Map`
--

DROP TABLE IF EXISTS `Category_Map`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Category_Map` (
  `CategoryID` int(10) unsigned NOT NULL,
  `ItemID` int(10) unsigned NOT NULL,
  PRIMARY KEY (`CategoryID`,`ItemID`),
  KEY `ItemID` (`ItemID`),
  CONSTRAINT `Category_Map_ibfk_1` FOREIGN KEY (`CategoryID`) REFERENCES `Category` (`ID`),
  CONSTRAINT `Category_Map_ibfk_2` FOREIGN KEY (`ItemID`) REFERENCES `Item` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Collab`
--

DROP TABLE IF EXISTS `Collab`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Collab` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `phone` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--  
-- Table structure for table `Hotel`
--

DROP TABLE IF EXISTS `Hotel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Hotel` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  `code` char(11) NOT NULL,
  `latitude` decimal(8,6) NOT NULL,
  `longitude` decimal(9,6) NOT NULL,
  `type` char(1) NOT NULL,
  `openingTime` time NOT NULL,
  `closingTime` time NOT NULL,
  `enabled` char(1) NOT NULL DEFAULT 'N',
  PRIMARY KEY (`ID`),
  FULLTEXT KEY `fulltext_index` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=139 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Hotel_Admins`
--

DROP TABLE IF EXISTS `Hotel_Admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Hotel_Admins` (
  `userID` int(10) unsigned NOT NULL,
  `hotelID` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`userID`),
  KEY `hotelID` (`hotelID`),
  CONSTRAINT `Hotel_Admins_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `User` (`ID`),
  CONSTRAINT `Hotel_Admins_ibfk_2` FOREIGN KEY (`hotelID`) REFERENCES `Hotel` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Hotel_Description`
--

DROP TABLE IF EXISTS `Hotel_Description`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Hotel_Description` (
  `hotelID` int(10) unsigned NOT NULL,
  `body` text NOT NULL,
  PRIMARY KEY (`hotelID`),
  CONSTRAINT `Hotel_Description_ibfk_1` FOREIGN KEY (`hotelID`) REFERENCES `Hotel` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Hotel_Pictures`
--

DROP TABLE IF EXISTS `Hotel_Pictures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Hotel_Pictures` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `hotelID` int(10) unsigned NOT NULL,
  `imageURL` varchar(50) NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `Hotel_Pictures_ibfk_1` (`hotelID`),
  CONSTRAINT `Hotel_Pictures_ibfk_1` FOREIGN KEY (`hotelID`) REFERENCES `Hotel` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Hotel_Profile`
--

DROP TABLE IF EXISTS `Hotel_Profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Hotel_Profile` (
  `hotelID` int(10) unsigned NOT NULL,
  `street` varchar(60) DEFAULT '',
  `place` varchar(30) NOT NULL DEFAULT 'Kochi',
  `city` varchar(30) DEFAULT '',
  `pincode` char(6) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `mainDP` int(10) unsigned NOT NULL,
  PRIMARY KEY (`hotelID`),
  KEY `mainDP` (`mainDP`),
  CONSTRAINT `Hotel_Profile_ibfk_1` FOREIGN KEY (`hotelID`) REFERENCES `Hotel` (`ID`),
  CONSTRAINT `Hotel_Profile_ibfk_2` FOREIGN KEY (`mainDP`) REFERENCES `Pictures` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Hotel_Promotion_Banner`
--

DROP TABLE IF EXISTS `Hotel_Promotion_Banner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Hotel_Promotion_Banner` (
  `hotelID` int(10) unsigned NOT NULL,
  `bannerURL` varchar(50) DEFAULT NULL,
  KEY `Hotel_Promotion_Banner_ibfk_1` (`hotelID`),
  CONSTRAINT `Hotel_Promotion_Banner_ibfk_1` FOREIGN KEY (`hotelID`) REFERENCES `Hotel` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Hotel_Rating`
--

DROP TABLE IF EXISTS `Hotel_Rating`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Hotel_Rating` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `userID` int(10) unsigned NOT NULL,
  `hotelID` int(10) unsigned NOT NULL,
  `rating` decimal(3,2) NOT NULL,
  `creationTime` datetime NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `unique_index` (`userID`,`hotelID`),
  KEY `hotelID` (`hotelID`),
  CONSTRAINT `Hotel_Rating_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `User` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `Hotel_Rating_ibfk_2` FOREIGN KEY (`hotelID`) REFERENCES `Hotel` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=342 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Hotel_Timing`
--

DROP TABLE IF EXISTS `Hotel_Timing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Hotel_Timing` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `hotelID` int(10) unsigned NOT NULL,
  `dayOfWeek` tinyint(4) NOT NULL,
  `timeStatus` char(1) NOT NULL,
  `startTime` time NOT NULL,
  `endTime` time NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `unique_indextime` (`hotelID`,`dayOfWeek`),
  CONSTRAINT `Hotel_Timing_ibfk_1` FOREIGN KEY (`hotelID`) REFERENCES `Hotel` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Item`
--

DROP TABLE IF EXISTS `Item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Item` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `code` char(11) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `hotelID` int(10) unsigned NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `code_UNIQUE` (`code`),
  KEY `hotelID` (`hotelID`),
  CONSTRAINT `Item_ibfk_1` FOREIGN KEY (`hotelID`) REFERENCES `Hotel` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=9142 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Item_Pictures`
--

DROP TABLE IF EXISTS `Item_Pictures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Item_Pictures` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `code` char(11) DEFAULT NULL,
  `userID` int(10) unsigned NOT NULL,
  `itemID` int(10) unsigned NOT NULL,
  `imageURL` varchar(50) NOT NULL,
  `thumbnailURL` varchar(50) DEFAULT NULL,
  `creationTime` datetime NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `code_UNIQUE` (`code`),
  KEY `Item_Pictures_ibfk_1` (`userID`),
  KEY `Item_Pictures_ibfk_2` (`itemID`),
  CONSTRAINT `Item_Pictures_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `User` (`ID`),
  CONSTRAINT `Item_Pictures_ibfk_2` FOREIGN KEY (`itemID`) REFERENCES `Item` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Item_Rating`
--

DROP TABLE IF EXISTS `Item_Rating`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Item_Rating` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `userID` int(10) unsigned NOT NULL,
  `itemID` int(10) unsigned NOT NULL,
  `taste` decimal(3,2) NOT NULL,
  `presentation` decimal(3,2) NOT NULL,
  `quantity` decimal(3,2) NOT NULL,
  `creationTime` datetime NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `unique` (`userID`,`itemID`),
  KEY `Item_Rating_ibfk_2` (`itemID`),
  CONSTRAINT `Item_Rating_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `User` (`ID`),
  CONSTRAINT `Item_Rating_ibfk_2` FOREIGN KEY (`itemID`) REFERENCES `Item` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=359 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Item_Review`
--

DROP TABLE IF EXISTS `Item_Review`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Item_Review` (
  `ratingID` int(10) unsigned NOT NULL,
  `body` mediumtext,
  PRIMARY KEY (`ratingID`),
  KEY `fk_Item_Review_1_idx` (`ratingID`),
  CONSTRAINT `fk_Item_Review_1` FOREIGN KEY (`ratingID`) REFERENCES `Item_Rating` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Item_Suggestions`
--

DROP TABLE IF EXISTS `Item_Suggestions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Item_Suggestions` (
  `itemID` int(10) unsigned NOT NULL,
  `placeID` int(10) unsigned NOT NULL,
  `imageURL` varchar(50) NOT NULL DEFAULT '/assets/item/default.png',
  UNIQUE KEY `itemID_UNIQUE` (`itemID`),
  KEY `Item_Suggestions_ibfk_2` (`placeID`),
  CONSTRAINT `Item_Suggestions_ibfk_1` FOREIGN KEY (`itemID`) REFERENCES `Item` (`ID`),
  CONSTRAINT `Item_Suggestions_ibfk_2` FOREIGN KEY (`placeID`) REFERENCES `Places` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Login_Session`
--

DROP TABLE IF EXISTS `Login_Session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Login_Session` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `userID` int(10) unsigned NOT NULL,
  `sessionToken` char(32) NOT NULL,
  `creationTime` datetime NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `sessionToken_UNIQUE` (`sessionToken`),
  KEY `Login_Session_ibfk_1` (`userID`),
  CONSTRAINT `Login_Session_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `User` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=484 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Menu_Categories`
--

DROP TABLE IF EXISTS `Menu_Categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Menu_Categories` (
  `hotelID` int(10) unsigned NOT NULL,
  `categoryID` int(10) unsigned NOT NULL,
  KEY `hotelID` (`hotelID`),
  KEY `Menu_Categories_ibfk_2` (`categoryID`),
  CONSTRAINT `Menu_Categories_ibfk_1` FOREIGN KEY (`hotelID`) REFERENCES `Hotel` (`ID`),
  CONSTRAINT `Menu_Categories_ibfk_2` FOREIGN KEY (`categoryID`) REFERENCES `Category` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Pictures`
--

DROP TABLE IF EXISTS `Pictures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Pictures` (
  `ID` int(10) unsigned NOT NULL,
  `url` varchar(50) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Places`
--

DROP TABLE IF EXISTS `Places`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Places` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(25) NOT NULL,
  `latitude` decimal(8,6) NOT NULL,
  `longitude` decimal(9,6) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Price`
--

DROP TABLE IF EXISTS `Price`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Price` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `amount` decimal(6,2) DEFAULT NULL,
  `description` varchar(30) DEFAULT NULL,
  `itemID` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `itemID` (`itemID`),
  CONSTRAINT `Price_ibfk_1` FOREIGN KEY (`itemID`) REFERENCES `Item` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9812 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `SMS_OTP`
--

DROP TABLE IF EXISTS `SMS_OTP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `SMS_OTP` (
  `userID` int(10) unsigned NOT NULL,
  `token` char(32) NOT NULL,
  `pin` smallint(6) NOT NULL,
  `creationTime` datetime NOT NULL,
  PRIMARY KEY (`userID`),
  UNIQUE KEY `token_UNIQUE` (`token`),
  CONSTRAINT `SMS_OTP_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `User` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Survey`
--

DROP TABLE IF EXISTS `Survey`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Survey` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `qNo` char(2) NOT NULL,
  `answerNo` char(7) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=4959 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `User` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `creationTime` datetime NOT NULL,
  `phoneVerified` char(1) NOT NULL DEFAULT 'N',
  `blogger` char(1) NOT NULL DEFAULT 'N',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=341 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `User_Bio`
--

DROP TABLE IF EXISTS `User_Bio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `User_Bio` (
  `userID` int(10) unsigned NOT NULL,
  `body` text,
  PRIMARY KEY (`userID`),
  CONSTRAINT `User_Bio_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `User` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `User_Locations`
--

DROP TABLE IF EXISTS `User_Locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `User_Locations` (
  `userID` int(10) unsigned NOT NULL,
  `latitude` decimal(8,6) NOT NULL,
  `longitude` decimal(8,6) NOT NULL,
  `writtenTime` datetime NOT NULL,
  KEY `User_Locations_ibfk_1` (`userID`),
  CONSTRAINT `User_Locations_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `User` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `User_Password`
--

DROP TABLE IF EXISTS `User_Password`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `User_Password` (
  `userID` int(10) unsigned NOT NULL,
  `hash` char(60) NOT NULL,
  PRIMARY KEY (`userID`),
  CONSTRAINT `User_Password_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `User` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `User_Profile`
--

DROP TABLE IF EXISTS `User_Profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `User_Profile` (
  `userID` int(10) unsigned NOT NULL,
  `firstName` varchar(30) NOT NULL,
  `lastName` varchar(30) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `website` varchar(50) NOT NULL DEFAULT '',
  `displayPicture` varchar(50) NOT NULL DEFAULT '/assets/UserDP/default.png',
  PRIMARY KEY (`userID`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `phone_UNIQUE` (`phone`),
  UNIQUE KEY `userID_UNIQUE` (`userID`),
  CONSTRAINT `fk_User_Profile_1` FOREIGN KEY (`userID`) REFERENCES `User` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `WebUser`
--

DROP TABLE IF EXISTS `WebUser`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `WebUser` (
  `ID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `voucher` char(5) NOT NULL,
  `creationTime` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `voucher_UNIQUE` (`voucher`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=758 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'urbanmeals'
--
/*!50003 DROP FUNCTION IF EXISTS `calculate_distance` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`remote`@`%` FUNCTION `calculate_distance`(lat1 decimal(8,6), lng1 decimal(9,6), lat2 decimal(8,6), lng2 decimal(9,6)) RETURNS decimal(7,3)
BEGIN
    DECLARE R INT;
    DECLARE dLat DECIMAL(30,15);
    DECLARE dLng DECIMAL(30,15);
    DECLARE a1 DECIMAL(30,15);
    DECLARE a2 DECIMAL(30,15);
    DECLARE a DECIMAL(30,15);
    DECLARE c DECIMAL(30,15);
    DECLARE d DECIMAL(30,15);

    SET R = 6371; -- Earth's radius in miles
    SET dLat = RADIANS( lat2 ) - RADIANS( lat1 );
    SET dLng = RADIANS( lng2 ) - RADIANS( lng1 );
    SET a1 = SIN( dLat / 2 ) * SIN( dLat / 2 );
    SET a2 = SIN( dLng / 2 ) * SIN( dLng / 2 ) * COS( RADIANS( lng1 )) * COS( RADIANS( lat2 ) );
    SET a = a1 + a2;
    SET c = 2 * ATAN2( SQRT( a ), SQRT( 1 - a ) );
    SET d = R * c;
RETURN d;
RETURN 1;
END ;;
DELIMITER ;
