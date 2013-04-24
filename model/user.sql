SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;
USE `mydb` ;

-- -----------------------------------------------------
-- Table `mydb`.`user`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `mydb`.`user` (
  `id` VARCHAR(16) NOT NULL ,
  `name` VARCHAR(45) NULL ,
  `email` VARCHAR(45) NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`role`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `mydb`.`role` (
  `name` VARCHAR(16) NOT NULL ,
  PRIMARY KEY (`name`) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`user_role`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `mydb`.`user_role` (
  `description` VARCHAR(100) NULL ,
  `user_id` VARCHAR(16) NOT NULL ,
  `role_name` VARCHAR(16) NOT NULL ,
  PRIMARY KEY (`user_id`, `role_name`) ,
  INDEX `fk_user_role_role1_idx` (`role_name` ASC) ,
  CONSTRAINT `fk_user_role_user`
    FOREIGN KEY (`user_id` )
    REFERENCES `mydb`.`user` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_role_role1`
    FOREIGN KEY (`role_name` )
    REFERENCES `mydb`.`role` (`name` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

USE `mydb` ;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
