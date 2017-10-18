# ************************************************************
# Host: 127.0.0.1 (MySQL 5.7.20)
# Database: beta
# Generation Time: 2017-10-18 13:54:17 +0800
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table place_signed
# ------------------------------------------------------------

DROP TABLE IF EXISTS `place_signed`;

CREATE TABLE `place_signed` (
  `visitor` varchar(36) NOT NULL DEFAULT '' COMMENT '签到人uuid',
  `placeid` varchar(36) NOT NULL DEFAULT '' COMMENT '签到点uuid',
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `stamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '签到时间',
  PRIMARY KEY (`visitor`,`placeid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='签到记录表';

# Dump of table places
# ------------------------------------------------------------

DROP TABLE IF EXISTS `places`;

CREATE TABLE `places` (
  `project_id` int(10) unsigned NOT NULL COMMENT '隶属项目id',
  `uuid` varchar(36) NOT NULL DEFAULT '' COMMENT '地点唯一uuid',
  `name` varchar(200) NOT NULL DEFAULT '' COMMENT '名称',
  `closed` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '1: 停用',
  `latitude` double NOT NULL,
  `longitude` double NOT NULL,
  `unsigned_icon` varchar(200) NOT NULL DEFAULT '' COMMENT '未签到图标',
  `signed_icon` varchar(200) NOT NULL DEFAULT '' COMMENT '已签到图标',
  `icon_width` smallint(5) unsigned NOT NULL DEFAULT '50' COMMENT '图标宽度',
  `icon_height` smallint(5) unsigned NOT NULL DEFAULT '50' COMMENT '图标高度',
  `picture` varchar(200) NOT NULL DEFAULT '' COMMENT '地点图片，配介绍文字',
  PRIMARY KEY (`uuid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='系统地点表';

LOCK TABLES `places` WRITE;
/*!40000 ALTER TABLE `places` DISABLE KEYS */;

INSERT INTO `places` (`project_id`, `uuid`, `name`, `closed`, `latitude`, `longitude`, `unsigned_icon`, `signed_icon`, `icon_width`, `icon_height`, `picture`)
VALUES
	(1,'22f15898-a139-11e7-8846-00163e2e9f1d','储气罐',0,39.98432,116.4991,'/net/fangzi-0.png','/net/fangzi-1.png',35,41,'https://www.tthus.com/images/cq.jpg');

/*!40000 ALTER TABLE `places` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table project
# ------------------------------------------------------------

DROP TABLE IF EXISTS `project`;

CREATE TABLE `project` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `shareTitle` varchar(200) DEFAULT '' COMMENT '分享标题',
  `shareImage` varchar(200) DEFAULT '' COMMENT '分享图片',
  `latitude` double NOT NULL COMMENT '预设坐标',
  `longitude` double NOT NULL COMMENT '预设坐标',
  `scale` tinyint(3) unsigned NOT NULL DEFAULT '16' COMMENT '地图预设缩放级别 建议：12-17',
  `centerRadius` smallint(5) unsigned NOT NULL DEFAULT '1000' COMMENT '初始时定位到用户位置，距预设位置的最短距离',
  `signedNeeded` tinyint(3) unsigned NOT NULL DEFAULT '5' COMMENT '领奖最少签到点',
  `signinRadius` smallint(5) unsigned NOT NULL DEFAULT '20' COMMENT '签到半径 米',
  `giftDetail` text NOT NULL COMMENT '纪念奖信息',
  `answerTimeLimit` tinyint(3) unsigned NOT NULL DEFAULT '20' COMMENT '答题限时 每题 ? 秒',
  `minCorrectNum` tinyint(3) unsigned NOT NULL DEFAULT '3' COMMENT '最少答对题目',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='项目配置';

LOCK TABLES `project` WRITE;
/*!40000 ALTER TABLE `project` DISABLE KEYS */;

INSERT INTO `project` (`id`, `create_time`, `shareTitle`, `shareImage`, `latitude`, `longitude`, `scale`, `centerRadius`, `signedNeeded`, `signinRadius`, `giftDetail`, `answerTimeLimit`, `minCorrectNum`)
VALUES
	(1,'2017-09-19 10:52:31','分享标题','https://avatars0.githubusercontent.com/u/19700641?s=460&v=4',39.983718,116.49831,18,1000,5,20,'恭喜您获得一份艺术节纪念版明信片！',20,3);

/*!40000 ALTER TABLE `project` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table question_group
# ------------------------------------------------------------

DROP TABLE IF EXISTS `question_group`;

CREATE TABLE `question_group` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `project_id` int(10) unsigned NOT NULL COMMENT '项目id',
  `sort` smallint(5) unsigned NOT NULL DEFAULT '999' COMMENT '排序，从小到大',
  `uuid` varchar(36) NOT NULL DEFAULT '' COMMENT '唯一uuid',
  `name` varchar(255) NOT NULL DEFAULT '' COMMENT '分组名称',
  `detail` tinytext NOT NULL COMMENT '领奖信息',
  `extra` tinytext NOT NULL COMMENT '领奖地点',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='问题分组';

LOCK TABLES `question_group` WRITE;
/*!40000 ALTER TABLE `question_group` DISABLE KEYS */;

INSERT INTO `question_group` (`id`, `project_id`, `sort`, `uuid`, `name`, `detail`, `extra`)
VALUES
	(1,1,1,'ca9e8b00-9c85-11e7-b2ce-7a5129dac85d','美食','请领取汉堡5折券一张','领奖地点：xxx');

/*!40000 ALTER TABLE `question_group` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table questions
# ------------------------------------------------------------

DROP TABLE IF EXISTS `questions`;

CREATE TABLE `questions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `group_id` int(10) unsigned NOT NULL COMMENT '类属问题组id',
  `sort` tinyint(3) unsigned NOT NULL DEFAULT '255' COMMENT '排序，从小到大',
  `title` varchar(255) NOT NULL DEFAULT '' COMMENT '问题标题',
  `choices` varchar(255) NOT NULL DEFAULT '' COMMENT '备选项： 半角 , 分隔',
  `answer` varchar(20) NOT NULL DEFAULT '255' COMMENT '正确答案索引， 从 0 开始',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='问题内容';

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;

INSERT INTO `questions` (`id`, `group_id`, `sort`, `title`, `choices`, `answer`)
VALUES
	(1,1,1,'1. xxx 在中国有几家店？','1家,2家,3家,4家,5家','1'),
	(2,1,2,'2. xxx 源于哪个国家？','美国,英国,德国,法国,印度','1'),
	(3,1,3,'3. xxx 哪年建立的？','1938年,1948年,1958年,1968年,1978年','0'),
	(4,1,4,'4. 下列哪一道菜是英国菜的代表？','肘子,汉堡,炸鱼薯条,披萨,咖喱牛肉','2'),
	(5,1,5,'5. xxx的主题文化是：','汽车,摩托车,帆板,电影,音乐','1');

/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table visitor_log
# ------------------------------------------------------------

DROP TABLE IF EXISTS `visitor_log`;

CREATE TABLE `visitor_log` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `visitor` varchar(36) NOT NULL DEFAULT '' COMMENT '访客uuid',
  `action` varchar(100) NOT NULL DEFAULT '' COMMENT '动作',
  `result` text NOT NULL COMMENT '结果',
  `stamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '发生时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `vistor` (`visitor`,`action`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='访客操作日志';



# Dump of table visitors
# ------------------------------------------------------------

DROP TABLE IF EXISTS `visitors`;

CREATE TABLE `visitors` (
  `uuid` varchar(36) NOT NULL DEFAULT '' COMMENT '用户唯一识别码uuid',
  `project_id` int(10) unsigned NOT NULL COMMENT '所属项目id',
  `openid` varchar(100) NOT NULL DEFAULT '' COMMENT '微信 openId',
  `unionid` varchar(100) DEFAULT '' COMMENT '微信 unionId',
  `rawdata` text COMMENT '用户信息，base64编码的 json 字符串',
  `systemInfo` text NOT NULL COMMENT '手机信息， json 字符串格式',
  `mobile` varchar(20) DEFAULT NULL COMMENT '手机号码',
  `active_stamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`project_id`,`openid`),
  KEY `uuid` (`uuid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='访客表';

/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
