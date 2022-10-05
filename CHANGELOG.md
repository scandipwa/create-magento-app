# Changelog

## v2.0.0 (05/10/2022)
## What's Changed
* Update dependencies-for-platforms.js by @aNereds in https://github.com/scandipwa/create-magento-app/pull/108
* PHP containers are finally here! by @ejnshtein in https://github.com/scandipwa/create-magento-app/pull/107

**Full Changelog**: https://github.com/scandipwa/create-magento-app/compare/@scandipwa/magento-scripts@1.16.1...@scandipwa/magento-scripts@2.0.0
---

## v2.0.0-alpha.23 (05/10/2022)
- Fixed running `magento-scripts` under ngrok error "ngrok.io redirected you too many times". fc77a9a02dbb653bbc6bc514d974e5f675ad43d6
- Fixed setting of `web/secure/use_in_frontend`, `web/secure/use_in_adminhtml` and `web/secure/enable_upgrade_insecure` confiugrations in `core_config_data` when running under SSL or ngrok. d5584d52658d691dc9b3f387189b6db56006e755 c1359baf1a0b7786313a51d3f24ff03ab5999f60
---

## v2.0.0-alpha.22 (05/10/2022)
- Fixed `update-env-php` task skipping update completely if setup persisted query is not needed.  8c5d8a955948dd90620eb53c0c86f3aafb69211c
---

## v2.0.0-alpha.21 (30/09/2022)
- Fixed health check for `maildev` container. 0d069e94021bade8ffc8a3348d50fc6857354ab9
- `magento-scripts` will set SMTP settings for [mageplaza/module-smtp](https://github.com/mageplaza/magento-2-smtp) instead of default Magento settings. 4bde35a1f71041c05997f1bf7fb2095b8b3c5226
- `COMPOSER_AUTH` environmental variable in `status` command is formatted as JSON to take up less space in the terminal. bbdff22f0f81ddc542349d7e2afb65ec3200b790
- Updated `cli` command output. ecdb902f0358fa21508bf442b3845ed0e9f0bca8 2e2244ed8455b2f0da01c8a089aac477457c7b5f
- Fixed `logs` command. 416992139c1c4aa7c65e2f1a084fade0435f5050
- `magento-scripts` will check the correct path when the user will try to link the theme from outside of the Magento project. b1e156871f15fe1d7961ee483fc25a992de81342
- Prepare file system tasks will not exit the start-up process only if it fails VSCode or PHPStorm configurations. 6c21d8f9c57f59398bdd6d4f55dc9127fb95acfd
---

## v2.0.0-alpha.20 (20/09/2022)
### Changed

- Config file validator will correctly validate maildev configuration in `cma.js`. 29da197c4d4caa46e018bebbe1f0ce95889c492f
- `getProjectConfigFilePath` function is made fail-safe which should improve error rates during phpstorm configuration setup. a33b2b19d278334930dfa795e03ff479166daf75
- Added validation for theme location in `link` command. The theme should be always placed inside the Magento folder. 634cd89f05e613d7315e64500826bc1f96b4bd86 41cb22851efc5f563c12d49055bf5bc8c33d5973
- Fixed running some commands in `cli` inside containers (like `cvc` for Clear Varnish Cache). b2ed81583e6601906ba444303739f5682c2c88b4
---

## v2.0.0-alpha.19 (15/09/2022)
### Added

- Added maildev container. 75526c2af16211122427aa08ea9b2a8f9fb10bf9
---

## v2.0.0-alpha.18 (15/09/2022)
### Changed

- Fixed removing the `composer_home-data` volume if other containers are using it. a4d4ae2ee2a514156aa0d5d76c18cf5ca0e021eb
---

## v2.0.0-alpha.17 (14/09/2022)
### Added

- Added Magento 2.2.10 support. 191a15759b0c24c0835e44aa95914b239c7756b6
- Added support for installing Composer plugins inside project images (like [prestissimo](https://github.com/hirak/prestissimo) for Composer 1 to speed up installation). aaca882a81ba2cc37fdaed925aaa20e8af5dd1ce

### Changed

- Fixed usage of composer cache on Linux systems without Docker Desktop. The volume will be converted automatically on the first start. 6e612d0c62d1f979f4fc8b0a57549d010b909ac6 4ed8448bfd8421cdd50185694af045ba3f14bf60 4fbfb139c0cf18d3f3c28b77ebcbeac5b54f0adc 39a2abcdf326f60390beca9abe04d32be71fdab6
---

## v2.0.0-alpha.16 (12/09/2022)
### Changed

- Fixed Docker `volume-api` and `removeLocalVolumes` task. 2981ff13d340f3b403241498ab3958b18fe0b0c0
---

## v2.0.0-alpha.15 (12/09/2022)
### Added

- Added `bin/magento` to the project image so you can run `magento <command>` inside the container. 74105275047f95945be4e060b070499a4b936960
- Added Varnish container description to display `health check` config status. adf650dec96d69214ce3db0e4bf6b40debc4680f
- Added description to CLI command on how to debug PHP commands in cli, related to issue [#110](https://github.com/scandipwa/create-magento-app/issues/110). df6a750e7043c866e30b76f08cbe45a5d3e8b68d

### Changed

- Fixed Docker requirement check not working correctly because of missing context. fe811571b2079ba25fd6cb347eab29f4a2dfd0ec
- Fixed running project with SSL enabled if a user uses Docker Desktop. 524dab8e301725d02e740050e9010f43c4fc75ad
- Updated MariaDB container description. 7081db67638870d6235b3326eb042963c3af48db
---

## v2.0.0-alpha.13 (09/09/2022)
## Docker Desktop on Linux, Varnish Healthcheck improvements, database access fixes and more!

### Added

- `start` command received 2 new options: `--pull-images` and `--reset-global-config`. 4f03cd874e4fd46044b99866c2bdb7a1679d9e28
- Error stack logging is added to `start` command. ab89f8664791f24e566c3ac05baff26fc4519322

### Changed

- The PHP 8.1 image was updated to PHP version 8.1.10. ba2e5bc9efb2b54975added049c65678d303aaf0
- Refactored docker check, install and running status tasks to work correctly with Docker Desktop, added context switching when running Docker Desktop on Linux, added context to docker API, add logs to docker container API. 3c7f5240f280c2713f72e9df7f05e5865e395469
- Docker volumes will be created after FS is prepared. b2c699013dd2358f07992ac0b4828c987eef545b
- `magento-scripts-php-ioncube-extension` was updated for `magento-scripts` v2. 7494e160c9f6cca6bab8e02c14a24a15e42e1f8a
- Local volumes will be recreated during `start` command and removed during `stop` command to reduce FS dependency to Docker. eb85e380cb8c7e15dc4e443d81ef140006a704b8
- XDebug configuration was moved to a separate configuration file with its own config in `cma.js`. 913a4ec87011d1534ab62c38b52539105c38de3e
- Varnish health check is now disabled **by default**. It still can be enabled in `cma.js`. 4098457855ce7f9cf4d67c9379856a6a27e7417b
- Creation of `magento` user in the database was moved from MariaDB container env variables to a separate task. Should resolve issues with **access denied** during connection to the database. acaeba726dd3be8f305da26d1cfcd5dc706580fa
- OPCache settings were updated. 5555089fe06aa68be8cc99efe51f08c897500279

### Removed

- Removed installation of `patch` and `bash` into container images as they are added to base images. ffce6d750463bfbcd3d8689b11fc9a20db8284f3 bf316fb05866be1e35efc362ff5926601fea36b6

---

## v1.17.0 (01/09/2022)
## Magento 2.4.5, 2.4.4-p1, 2.4.3-p3, 2.3.7-p4 support is here!

### Fixed

- Fixed incorrect dependency name for curl on Fedora. #108

### Changed

- Refactored `enable-magento-composer-plugins` to better support composer-way of allow-plugins configuration 5d77178cc722be39f68148648c04bef65a22c2bd
- Removed `intl` PHP extension from PHP extensions list as it is coming bundled during PHP compilation. bae023fecd83ae32324750bf55c4e7aae43bde73
- With Magento 2.4.5, 2.4.4-p1, 2.4.3-p3, 2.3.7-p4 came support for 2.3.4-p1, 2.3.2-p1. ec5fb5de8104dec54771d43663263f2db14f48f1
- Added a recursive option to `creating cache folder` task. 048560c9c9b26291497580496bc09d5493d4e01e
---

## v2.0.0-alpha.0 - v2.0.0-alpha.10 (01/09/2022)
## PHP containers are here and no more MySQL!

This version brings a significant change in how `magento-scripts` operates.

We removed PHPBrew and MySQL in favour of our custom docker PHP image and MariaDB.

### Why was PHPBrew removed?

[PHPBrew](https://github.com/phpbrew/phpbrew) is a great utility for building multiple PHP versions on your system, but unfortunately it has a major design flaw - it needs PHP to build PHP. And not just any PHP, PHPBrew requires PHP 7.4 to run.

Another major problem is that it relies on system packages, that's why we have a lot of dependencies on [prerequisites](https://docs.create-magento-app.com/) page in our documentation as well as a ton of logic to validate and install missing dependencies on each start of the project.  
Recently Ubuntu released major LTS version 22.04 with a change from OpenSSL 1 to OpenSSL 3 which broke compilation for all PHP versions older than PHP 8.1.

And at this point, we decided to move back to PHP container.

This change will greatly reduce installation time for CMA on a new system since instead of compiling PHP we will just download images will PHP and all basic PHP extensions and run it right away.

#### Will this affect speed on macOS?

For the best experience on macOS, it is recommended to enable VirtioFS in the **Docker Desktop** settings > **Experimental Features** section.

See [blog post from the Docker team introducing VirtioFS](https://www.docker.com/blog/speed-boost-achievement-unlocked-on-docker-desktop-4-6-for-mac/).

### Why was MySQL removed?

We observed a very strange behaviour with MySQL 5.7 on Linux systems with Docker Engine. When started container will consume all resources given to the system and basically freeze the computer.

In addition to that, we already have [MariaDB](https://hub.docker.com/_/mariadb) in our setup for macOS on ARM64 chips (M1) because MariaDB actually has ARM64 images that can run on those systems.

So we decided to bring more consistency to our setup and move everyone to [MariaDB](https://hub.docker.com/_/mariadb).

Since existing setups are still running on MySQL we developed a migration script that will run if it detects that you have MySQL volume in your project. The process is automated, the user just needs to press ENTER a few times to get a new working setup.

### How the version 2 will behave compared to the version 1?

When `magento-scripts` starts, it will just check if you have Docker on your system, it is running and you have permission to access docker.socket (`/var/run/docker.sock`). That is it for **Requirements check** step.  
In the next step, it will make sure that the project is stopped, as it was previously, and then begin configuring it.  
The configuration step includes converting the setup from MySQL to MariaDB, pulling container images, creating a docker network, creating volumes and building project images.  
During the build of project images `magento-scripts` will create 2 new images for your project. We need 2 images because one is a standard PHP container image and the second one includes the XDebug PHP extension, so we can change to debug image **on-the-fly** with one command option ([-d](https://docs.create-magento-app.com/getting-started/available-commands/start#d-debug)).  
After the project image is built we start running Magento right away.  
No more broken dependencies, mess in your system dependencies and hours wasted on PHP compilations (finally!).

### What else?

- Dead Varnish instance will now be handled during the **Waiting for Varnish** step for Magento 2.3.x versions. 3593e7aaff40efff07148dabf4ab1cfda615c25b
- Added fix for collation issue in the `import-db` command. 4c13c6876304d45cac5d8abfefd1119c7f6c5796
- `--import-db` option was removed from `start` command. aa36b7e7be011a62178289f660086fd7cbdcc9b9
- Composer in the project image will store packages in separate volume for the cache. 114172d395220b8303c9202dcfb4c8e37a313d38
- Added ElasticSearch 6.8 image for X86/ARM64 architectures. `magento-scripts` will be able to run Magento 2.3.0-2.3.4 on ARM64 systems (and M1 macs). 9905605197dab118ec176607c74310ad63816191 62e9ad496ddf183f6e702223779d61169e58e36f
- Make env overridable for ElasticSearch. 3fa8a2a7945adcc78284fe478038293b70136903
- Added Magento 2.4.5, 2.4.4-p1, 2.4.3-p3, 2.3.7-p4 support. b69f200f95eadc70ca48a29ba59c9a7784fc641f
- Fixed running of `php`, `composer` and `magento` "binaries" from `cli`. All options (like `php --version`, or `composer --version`) will be processed correctly now. 401646539ba79ca3d6b30eaf9b6023d50bb5fdfa
- If the PHP container is not running start a new container instead. (affected commands: `exec`, `cli`) 1e8358ef79b130a49bae640698a5e6d892e3a5d5 98acf6121e6596b51aa4556fadbb0c09c94cf2ae

### Final notes

All our PHP & Elasticsearh 6.8 images are hosted in [ScandiPWA repo packages](https://github.com/scandipwa/create-magento-app/pkgs/container/create-magento-app) and the source code of all images is located in [./container-images](https://github.com/scandipwa/create-magento-app/tree/php-container/container-images) folder.
---

## v1.16.1 (08/07/2022)
- Fixed an issue with missing **admin_user** table on empty database. 5d0a682a50540803380b683fe75d6ab1a2d652f0
- Moved **waiting for varnish to return code 200** task to run after theme setup. 96efa57e8c1582e99d9d578cfa707015eea0733a
---

## v1.16.0 (08/07/2022)
## Bug Fixes

- Fixed checking for the process running as root on Windows. 10b808c212851e447998fc225575d5df7f2def3b
- Fixed an issue with parsing and building of `workspace.xml` configuration for PHPStorm. eaefa83a796dbe63a54341c3f29c237fda3c4515
- Fixed retrieval of disabled PHP extensions. This will resolve issues with the XDebug extension being installed every time it is disabled instead of just enabling it. c28833d4134aa39cf0fa64303c9be7a3b6637c48
- Added `keepalive` setting in Nginx container configuration files to resolve possible issues with running Varnish on some projects. 29812c045719da2ca227f526b2b5761eb613acdf
- Check for installing Rosetta 2 has been moved before installing MacOS dependencies. 508468c348c9906f75b999df462da53ee6bed46f
- PHP-FPM start has been moved before starting Docker services. 57c203bbdfac36c31acc462eb3ae5811efc9c46f
- Added Magento setup in database after running Magento project setup if `setup:db:status` returns code **1**. 09e5986d078143d03968eff8f34e91841a9e6bf6
- Added check for if a user with username **admin** exists in the database before running `setup:install`. ebf8660afbeb20b70068f52a896c4174685d882e

## Improvements

- Added **ssl-terminator** to `exec` and `logs` command description. 61568bf770a1ecaf9e8c94e1c394b7bde472270d c71d5efda7e2ad7a8605fd7f55043416d97627d5
- Persisted Query setup has been moved to **update-env-php** task. 23288514718e66d3d698250528c7cc1c82191aa1
- Added updating of adminuri setting from `cma.js` to `env.php` in **update-env-php** task. 23288514718e66d3d698250528c7cc1c82191aa1
- Added a prompt to disable or remove **prestissimo** Composer plugin in your project if you have it installed. 4cecab9d8a6687f96c834e50f961e13d55b944bc b2be66e48cfee28d92818422f530f2decc9ea09f
- Resolved memory leak issue in `execAsyncCommand` utility. a40a8762434723a7d42d2a2f5ccc515f6ecea99c
- `status` command will now also print port forwarding information for containers that are connected to **host** network. eceeefcbd3a9553aa132b40b3c0e9320b724c136
- Refactored container image pulling logic to eliminate race conditions. a40b53371dd621d8b32427d6ecd55f3892d8ad33
- Added check for if docker containers have started or not. f628da6e0d326e64b68c58b47854661ead85436e
- Refactored database dump import logic, added option to choose user to use in MySQL client during database import. c24f6bf92b1be217dd3ebb97fb77e576f7483b15
- + Added prompt to drop database `magento` before importing dump to eliminate possible interference with old data in database. 00f9495d779ab7cbabca9a5fe527340eb9206069
---

## v1.15.7 (09/06/2022)
### Bug Fixes

- Removed `xmlrpc` PHP extension from the extension list as it was redundant for the setup. Also, it was removed from PHP 8.0 and moved to PECL, but ATM on PECL only beta versions are available. 1b00d02363f3d3d68293166e8d523d0b862d76af
- Added correct proxy timeouts in `ssl-terminator` Nginx container to prevent 504 errors. 4b1822a358081de271d9dd696ab038a00845b23b
- Fixed `missing cache folder` for `ssl-terminator`. 8880b0811d487ad1e8ee777bd4c1cf1a8cb4d147

### Improvements

- Database migration changes! #70 (Thanks @aleksandrsm)
  - Magento `setup:install` will not remove the database if the installation of it was unsuccessful. 2db6851dd569c8c3e3d1ecf92d03384856c8932f
  - `magento-scripts` will check it `env.php` and `config.php` files exists and if they don't, or database is empty, will install fresh database using `setup:install`
- Added automatic installation of Brew using the native path as well as using Rosetta 2 on M1 macs. PHPBrew dependencies were moved to general dependency list. 50588e2763a7b73aba072c3c64139793e979d5ef
---

## v1.15.6 (07/06/2022)
### Bug Fixes

- Fixed issue with connection to MariaDB on MacOS with M1. fe0710ce5b9b437e61b0d04b04975d41a12ce07e

### Improvements

- Removed the second prompt after confirming to enable composer plugins. 3d4d3368a612311055c317285d6bcb888955f363
---

## v1.15.5 (07/06/2022)
### Bug Fixes

- Fixed an issue for older Magento versions that don't have 2FA module installed. 138d48651ce93f07f0474efda521457ff14b5ae9
---

## v1.15.4 (07/06/2022)
### Bug Fixes

- Fixed `execAsync` type error. bd5a632f7677964d8e85b46f72213da0ef35b9b3
- Fixed type errors in PHP Storm config setup. 9e3a4c077cdadb9e18f5dcf5b89d81cff1b96c12 1ecdf56fa66297585c7f8b399351ae5f6e01f75b
---

## v1.15.3 (06/06/2022)
### Bug Fixes

- Fixed a few places where type errors can occur during creation of phpstorm configuration. a540e1bb17bcbe323990bfaa6178427649675b6b 70ecb8bebf6e5bce251e91f101e37204cc7d8c41 e69649d7fe0da9ddf5d898b93d2c57ae4863299e
- Fixed an issue with connecting to MySQL if the `magento` database does not exist. 2f1f156ac1a8575218e3c2fae71062b40a7edc58

### Improvements

- Added handling of the error during Magento installation to the database if the encryption key is not  valid. (`The default website isn't defined. Set the website and try again.`). c7954105c66d3c79fe1d5a20717fe62467a1dcdc
- Added `gd` to dependency list on macOS for compiling PHP for PHPBrew. d10fd5b27ab034e0fa6c1ec538c1c2f7a7a8e3e8

---

## v1.15.2 (03/06/2022)
### Bug Fixes

- Fixed an issue `Cannot read property repositories of null`. e423f6aa3550fc3f233f7b4becd4b5d18b6dd9ec
---

## v1.15.1 (03/06/2022)
## Small but important Bug Fixes!

### Bug Fixes

- Added Magento edition retrieval for config file generation, as sometimes `cma.js` does not exist, but `composer.json` does and **magento-scripts** are still asking for edition to choose. 1ba846dbe2c33332e000795d9ed40bf34b0c006d
- Added logging for analytics errors in `GA_DEBUG` mode. 4d82c0a4d0d26e037ced1a63bdcef62ff675178c
- Bumped `smol-request` to 2.1.2. dbc6fbf6786b6461573641b5ead3134bbcdc942e
---

## v1.15.0 (03/06/2022)
## Varnish is finally here with a ton of other Improvements and Bug Fixes!

### Improvements

- `exec` command now supports running proper commands when executing. dc8a86713c01cafe3c0ece5d41c7d74d6f92ea9b
  To run a long command inside a container wrap it in quotes: `npm run exec mysql "mysql -umagento -pmagento"`
- Added check for existing tables in database before truncating them. 245c06490714f4f28d6a78b0d4ea4dc209aee1ad
- Added check for empty characters in credentials in `auth.json` file. eaf67948663224285f2a68f9c3931be8cb491315
- Improved running `magento-scripts` on M1 Macs. Now you won't need to always run `magento-scripts` in **Rosetta Terminal**. It will work even from the native one if you have both versions of [brew](https://brew.sh/) installed.
- If you click on **Skip dependency installation** option during missing dependency installation prompt, setup will continue instead of throwing an error. 2453ccbdd6651c85f3f63548e7d284b1efea3359
- ElasticSearch will now be pulled from [Docker Hub](https://hub.docker.com/_/elasticsearch) instead of [docker.elastic.co](https://www.docker.elastic.co/). b1e399a228ee6d9d4d24c05c64ec488d95d2fea0
- `cli` command output was updated, it also includes aliases to clean varnish cache and connect to mysql. bf380a4dcf587e71b2ead5559ea33ab6d00dba15 3764dc7878062c988a0061b731c47b065a5e177c
  <img width="390" alt="Screenshot 2022-06-03 at 5 36 09 PM" src="https://user-images.githubusercontent.com/18352350/171875834-edff70a2-c4c0-40e5-b298-90c9db720e3e.png">
- Changed Docker container logic to respect all arm systems, not only arm Macs. e91f724d0517a454632a8b45e46fce2d2840268b
- Added automatic Docker installation on Mac. c949098b9c590c1ff2606e7fa0c111e0edc5f102
- Added OOTB PHPStorm configuration setup with PHP CodeSniffer, PHPCSFixer, PHPMD, ESLint, StyleLint. #105 
- Added PHP extensions validation for cases when the user tries to compile incorrect PHP with incorrect variants by themselves. #104 
- Improved analytics collection. #102
- Added **Varnish** to setup.  #97 #101 With **Varnish** also were enabled PHP APC (#49) and PHP OPCache extensions (c8861ad5994fd7aa61d633445c521c9ae961401d).
  When **Varnish** is enabled application routing will be different. We added a second **Nginx** container called (`SSL Terminator`) for SSL termination. By default request path will look like this: `Request -> SSL Terminator (Nginx) -> Application Nginx`. When **Varnish** is enabled, request path will be different: `Request -> SSL Terminator -> Varnish -> Application Nginx`.
  Also, when **Varnish** is enabled, `magento-scripts` will also enable **full_page** cache in **Magento**, but don't you worry! Our default **Varnish** VCL configuration file have cache bypassing for `/static/frontend` so it won't impact you frontend theme development! 4d54cfa1a201ae5feddbcbf5ed2b96d5f7ea0810
  If you are developing extensions for the Admin panel, you might want to disable **Varnish** as it will cache all static content in the Admin panel.
- Improved theme-building experience. #98 
- Added handling of not running Docker. `magento-scripts` will prompt to start docker if it is down. #95 
-`magento-scripts` will now prevent running itself as root to avoid a ton of possible issues. #96 
- Added support for Magento 2.4.4, 2.4.3-p2, 2.3.7-p3 and 2.3.7-p2. #91
- Added `PATH` environment variable forwarding in PHP-FPM. c9671807f10cb415c8772517c05657d59c1d0463


### Bug Fixes

- Fixed **sodium** PHP extension installation on M1 Macs. 095c4a329cb178b63b02050cf02540b2223ebe35
- Fixed persisted query setup which worked on each start due to typo. 124d9a03e8ab2e67848d5f12dd8ac98d9345fd86
- Fixed an issue with missing cache folder when cache folder is not present, but SSL config is enabled. #99
- Fixed issues on Fedora-based systems with dependency installation. 4b71aeaededc64902bfcbb83285fb1c4ddec15cf 31366096f1aba411b00db9f5df8ed5a9968f2e5d
---

## v1.14.0 (05/04/2022)
## Big Improvements and Important Bug Fixes!

### Bug Fixes

- Fix dependency issue for compiling PHP on mac #77
- Magento default page builder will be disabled by CMA due to a bug in the Magento Admin panel that lead to infinite loading on some pages #54 (Thanks @AleksandrsKondratjevs)
- Fixed composer version parsing as [Composer 2.3.0](https://blog.packagist.com/composer-2-3/) changed `composer --version` command output which broke parsing of this command #84
- Fixed an issue with a missing PHP directory (`bash: /home/ubuntu/.phpbrew/php/php-7.4.27/bin/php: No such file or directory`) cfe440d7a92bf79f8f8a9997d2eb5ba78a7153c6

#### Analytics Fixes

- Startup timings are now correctly reported in ms #75
- Resolved issues with error reporting #76

#### CMA Extensions Fixes

- Fixed handling of the missing Downloads directory for ionCube extension #85

### Improvements

- Improved composer credentials obtain mechanism as well as credentials validation #89
- Improved support for Magento 2.3.0-2.3.6 on macOS #90
- Added check for `xdg-open` in `PATH` on WSL system #66
- Introduced a new `os-platform` utility that will improve dependency installation support for different Linux distros, like **EndeavourOS** #73
- Added proper support for running CMA with Ngrok and updated start command output to accommodate changes made to setup #83
- Added a prompt for fixing permission issues with `docker.socket` #88
- Updated `status` command port forwarding output to be easily understandable 805cfd722e0e3b9e73ff9bba5a8bba8a2e827e7b

---

## v1.13.4 (10/02/2022)
## Bug Fixes and Improvements

### Bug FIxes

- Fixed issue when `composer.json` does not have `config` property which lead to error while checking for enabled plugins on Composer 2.2. e93821bf821e8821557f054679b97b8f69f78894
- On WSL added a check for `xdg-open` utility availability in `PATH` variable and CMA will be able to open the browser. #57 

### Improvements

- Fixed task output when installing Magento in the database. ed0ab571d986a51097ec86a135d921e2dcc59629
- Added a skip case to the "connect to MySQL" task which reduced wait time for about 3 seconds when running the `start` command with the `-s` option. 56a22644cfa8268e20b33406b34b31fed5b8e15e
- Added a note after `start` command is finished about using `cli` command for accessing Magento CLI, Composer and PHP. e9e088aaec4360cb26c63ca85a534d070a5b9ef2

---

## v1.13.3 (08/02/2022)
## Bug Fixes

- Fixed issue for projects running with SSL enabled on ports other than 80. #63
- Resolved issue with `cleanup` command. e7861f5ae8a2125053a424a8ec97eafb2b3a0148
- Added prompt to run `apt update` before installing missing dependencies on Ubuntu. #58 
- Added description to `logs` and `exec` commands. #56 321649252a462e66a446dd31a24792cdf7136518
- Added `cmake` to dependencies list for Ubuntu. 4232423973d53c59f290b8ea826db80c47756fc9
---

## magento-scripts-php-ioncube-extension 0.0.1 (08/02/2022)
`@scandipwa/magento-scripts-php-ioncube-extension` is now publically available!

Follow [this instructions to get it setup](https://github.com/scandipwa/create-magento-app/blob/master/build-packages/magento-scripts-php-ioncube-extension/readme.md)!
---

## v1.13.2 (14/01/2022)
## Bug Fixes

- Fixed issue when the database has some tables but not those that CMA needs to work with. Added check if a specific table exists in the database at all. #50 
- Fixed MySQL nodejs client issue with connecting to database in some instances.
  Looks like it does not work properly with the host parameter value as `localhost` so changed it to `127.0.0.1`. #51 
- Fixed issue with retrieving PHP version from the shell if some PHP extension prints warning in the console. e1b4dc09c94bdad2b590b290553269d54429cf26
---

## v1.13.1 (14/01/2022)
## Bug Fixes

- Fixed a typo in SQL syntax for retrieving table count. 67ddc73a775196c28c8d73f79b5ea3a149040820
---

## v1.13.0 (11/01/2022)
## Bug Fixes and Improvements!

### Bug Fixes

- Fixed handling of `allow-plugins` configuration in `composer.json` that is required by Composer 2.2. #47
- Fixed automatic Docker installation on Ubuntu. 972a70ca923ac83f8f6ed3c6897c1078212331f0
- Fixed PHPBrew not able to properly run on systems with PHP 8.1 and newer. #41 

### Improvements

- Added troubleshooting guide if Composer installation fails for some reason. #45 
- Added Magento Edition selection prompt for initial installation.
- Since Composer fixed issues with Magento in 2.2.1, reverted changes that hardcoded Composer on version 2.1.14 for Magento 2.3.7(p1), 2.4.2(p1,p2), 2.4.3(p1). Those versions will now use latest Composer 2. cad3aed0e0f9f21a02aa3190256dc95e7659a312
- CMA now should respect the `$PHPBREW_HOME` environment variable if you want to install PHPBrew using a non-default directory (`$HOME/.phpbrew`).