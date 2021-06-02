# Changelog

## V1.5.1 (28/05/2021)
# System config, Bug Fixes and Performance Improvements!

# What is New

- System config is here!
 The file should be named `.cmarc` and located in the home directory of your user.
 Currently, only 2 options are available to tweak: `useNonOverlappingPorts`,  `analytics`.
  ```json
  // default ~/.cmarc
  {
    "useNonOverlappingPorts": false,
    "analytics": true
  }
  ```
  `useNonOverlappingPorts` feature will tell CMA to not use ports that are already used by other CMA instances, even if they are currently stopped.
  `analytics` will come in the following updates which will help us improve CMA, so an option to opt-out from it is already available!
  >**[NOTICE]** Since the `useNonOverlappingPorts` feature control has been moved from the projects config file, aka `cma.js` in your project root directory, you will need to remove this option from there.

  Documentation available [here](https://docs.create-magento-app.com/getting-started/config-file#system-configuration-file)!
- ElasticSearch MachineLearning option will now be automatically enabled on systems that support it.
 This feature was disabled before to keep compatibility for our developers running on older hardware, but now it will be enabled for systems that support the `SSE4.2` instruction set.

# Bug Fixes

- Fixed import and usage of stored programs in database dump. 19bf46c225273196eca812da84735ac63982ed2f
- Fixed undefined errors while extracting data (like retrieving versions) from command output which does not contain that data or data is corrupted.
  Now proper error message will be displayed if something goes wrong. c24836155b7e325fb98cb96f23ddd1a003f0a24b
  Reported from https://github.com/scandipwa/scandipwa/discussions/2598
- Fixed installation of `prestissimo` composer plugin on composer with version 2. 70ba9cc284c6142760cf6ed9f5f43ae430347477
---

## v1.5.0 (30/04/2021)
#  Apple Silicon, Magento 2.4.2 & 2.4.1-p1 support and bug fixes!

## What's New

### Apple Silicon support is here!
 When using CMA on Apple Silicon you might notice some differences compared to running it on the X86 system.
 Mainly, since MySQL image is not available with arm64 architecture, we are using MariaDB instead. MariaDB is a fork of MySQL and compatible with its API so there should be no problem.
Like everything new, not everything works with old software. Currently, containers might experience issues with networking, so if you get the message `This site can’t be reached` try to run the start command again, it should restart the containers and resolve the issue.

More about issues with containers on Apple Silicon available [here](https://docs.docker.com/docker-for-mac/apple-silicon/).

 Docs available [here](https://docs.create-magento-app.com/getting-started/prerequisites/installation-on-macos/installation-on-macos-apple-silicon)!
### Magento 2.4.2 & 2.4.1-p1 support is here!
 Now when running `magento-scripts` for the first time you will be given a prompt with all supported Magento versions.
 Currently 3 are supported: 2.4.1, 2.4.1-p1, 2.4.2.
 Magento 2.4.2 and 2.4.1-p1 requires a new dependency called `libsodium`. [Prerequisites](https://docs.create-magento-app.com/getting-started/prerequisites) are already updated and CMA will also check if you need to install additional dependencies and install them right away!

 More about supported Magento versions [here](https://docs.create-magento-app.com/getting-started/supported-magento-versions)!
### `magento-scripts` will now also check for the Node.js version!
 So you will get a proper error message on what to do with your out-of-date Node.js version.
 The minimum required Node.js version is still 12.
### [link](https://docs.create-magento-app.com/getting-started/available-commands/link) command will now also build theme if it is not built already.
 No more `"Template Magento_Theme::scandipwa_root.phtml "is not found"` error after install! 05378078310f071937a9f5f592b53902c2799499


## Bug Fixes

- Fixed a bug that prevents a user from choosing the desired port to run CMA on using the [--port](https://docs.create-magento-app.com/getting-started/available-commands/start#p-port) option. 352912d94a31c381adebcb0a21bf41c6daffcf21
- Fixed updating the `env.php` file if your installed PHP version is not 7.4.13. 695644d622f9377154842003b1cf149fe4e1867d
- Fixed skipping updating `app/etc/env.php` file if it does not exist. 2403892a4dbcf1f4e83590bfcf55436e6f4cf866
- Fixed installation of [prestissimo](https://github.com/hirak/prestissimo) on non-default php version.

## Miscellaneous
- Bumped XDebug version to [3.0.4](https://xdebug.org/announcements/2021-04-08)
- After the start command successfully finished, added a note about the status command containing MySQL credentials, container status, and more detailed info about the project. 656225035bf54ae1ba3a01475001d938e7e3162b
- Nginx template has been updated to be up-to-date with a template [from Magento repository](https://github.com/magento/magento2/blob/2.4-develop/nginx.conf.sample). 14b02edd6a6c8f731146bccb93c6eade87039d41
- Added `composer` configuration, so you can forcefully choose the composer version.
 Although, only version 1 and 2 is supported.
- Added `php.extensions` hooks configuration to do some actions before and after extension installation.
 As an example, hooks are currently used to edit the `/home/user/.phpbrew/php/php-<>/var/db/libsodium.ini` file because when the `libsodium` extension is installed, it uses dynamic library called `sodium.so` instead of `libsodium.so`. PHP throws an error that it `cannot load libsodium library` because it does not exist. In the post-install hook, we edit this file to point to the correct library name so everything goes smoothly. 416d37503c9bb47af44b1f6f6debb2249c14f68f

---

## v1.4.2-alpha.16, v1.3.2-alpha.4, v1.3.2-alpha.5 (26/04/2021)
# Magento 2.4.2 experimental support, composer configuration and XDebug version 3.0.4

## What's New

- Magento 2.4.2 support is finally here!
 Although, to get it properly working you might need to edit a vendor file. 
- `magento-scripts` will now also check for the Node.js version!
 So you will get a proper error message on what to do with your out-of-date Node.js version.
 The minimum required Node.js version is still 12.
- [link](https://docs.create-magento-app.com/getting-started/available-commands/link) command will now also build theme if it is not built already.
 No more `"Template Magento_Theme::scandipwa_root.phtml "is not found"` error after install! 05378078310f071937a9f5f592b53902c2799499

## Bug Fixes

- Fixed a bug that prevents a user from choosing the desired port to run CMA on using the [--port](https://docs.create-magento-app.com/getting-started/available-commands/start#p-port) option. 352912d94a31c381adebcb0a21bf41c6daffcf21
- Fixed updating the `env.php` file if your installed PHP version is not 7.4.13. 695644d622f9377154842003b1cf149fe4e1867d

## Miscellaneous
- Bumped XDebug version to [3.0.4](https://xdebug.org/announcements/2021-04-08)
- After the start command successfully finished, added a note about the status command containing MySQL credentials, container status, and more detailed info about the project. 656225035bf54ae1ba3a01475001d938e7e3162b
- Nginx template has been updated to be up-to-date with a template [from Magento repository](https://github.com/magento/magento2/blob/2.4-develop/nginx.conf.sample). 14b02edd6a6c8f731146bccb93c6eade87039d41
- Added `composer` configuration, so you can forcefully choose the composer version.
 Although, only version 1 and 2 is supported.
- Added `php.extensions` hooks configuration to do some actions before and after extension installation.
 As an example, is currently used to edit the `libsodium.ini` file because when the `libsodium` extension is installed, it uses `sodium.so` dynamic library instead of `libsodium.so` which is set by default and PHP throws an error that it cannot load this library because it does not exist. In the post-install hook, we edit this file to point to the correct library name so everything goes smoothly. 416d37503c9bb47af44b1f6f6debb2249c14f68f

## Fix for Magento 2.4.2
When you open Magento Admin panel some pictures might not load, as well as css, js and other files, open devtools, network tab and see following picture:
![Screenshot_20210426_192138](https://user-images.githubusercontent.com/18352350/116117224-a95a4b80-a6c4-11eb-87ca-b86606969c62.png)

To fix this you will need to go to `vendor/magento/framework/Filesystem/Driver/File/Mime.php` and edit the method as follows:
![Screenshot_20210426_174623](https://user-images.githubusercontent.com/18352350/116102369-55953580-a6b7-11eb-94f1-0a362bcf3584.png)
add `if` statement to 116 line.
![Screenshot_20210426_174722](https://user-images.githubusercontent.com/18352350/116102532-765d8b00-a6b7-11eb-9258-46917ee93d0c.png)

After adding this `if` statement on line 116 it will work as expected.

The issue is opened on magento2 GitHub so we waiting for a workaround or straight up fix. https://github.com/magento/magento2/issues/32878
---

## v1.4.1 (13/04/2021)
# What's New

- [Logs](https://docs.create-magento-app.com/getting-started/available-commands/logs) command now mimics [docker logs](https://docs.docker.com/engine/reference/commandline/logs/#options) command options.
  So you can define how many lines to show in output and others. #22 

# Miscellaneous

- CMA will now add the default `cma.js` file correctly.
---

## create-magento-app@1.2.3 (13/04/2021)
# What's New

- Added `cma.js` file to template for CMA.
---

## v1.4.0 (06/04/2021)
# What's New

- Added support to installing **Magento Enterprise Edition**.
  To install enterprise edition you need to create a new CMA app, it should create the default `cma.js` file, set **magento.edition** to **enterprise** and then run the [start](https://docs.create-magento-app.com/getting-started/available-commands/start).
  > NOTE: You need access keys with Magento Enterprise on them to be able to install **enterprise edition**.
- CMA will now check if dependencies are installed on supported platforms: `macOS, Ubuntu, Linux Mint, Fedora, Centos, Arch Linux, Manjaro Linux`.
  If you don't have some dependency installed, CMA will prompt you to install, not install (installation will exit) or skip install (not recommended).
  If you select **install** you will need to write your root password and press **enter**. (Does not apply to macOS)
- On the Linux platform, CMA will use direct symlinks to mount data to the Nginx container instead of named volumes.
  If you have experiencing performance issues, please let us know!

# Bug Fixes

- Fixed error **The default website isn't defined. Set the website and try again**.
  Now setup should perform as smooth as possible.
- If Magento Schema is installed to the MySQL successfully from the first try, CMA will not install it a second time as it did before.

# Miscellaneous

- Hide duplicate "Using Magento" task title.
- Adjusted task titles to use **Present continuous** tense.
- Adjusted **Update to newer version** message.
- Adjusted task titles.
- Bumped dependency versions.
- Added typings to existing tasks via JSDoc.
---

## create-magento-app@1.2.2 (06/04/2021)

---

## v1.3.2-alpha.2 (31/03/2021)
# What's New

- CMA will now check if dependencies are installed on supported platforms: `MacOS, Ubuntu, Linux Mint, Fedora, CentOS, Arch Linux, Manjaro Linux`.
  If you don't have some dependency installed, CMA will prompt you to install, not install (installation will exit) and skip install (not recommended).
  If you select **yes** you will need to write your root password and press **enter**. (Does not apply to MacOS)
- Added support to installing **Magento Enterprise Edition**.
  To install enterprise edition you need to create a new CMA app and then run the [start](https://docs.create-magento-app.com/getting-started/available-commands/start) command with argument `-e enterprise` (or `--edition enterprise`). This will create `cma.js` file with `magento.edition` field set to **enterprise** and install enterprise edition.
  > NOTE: You need access keys with Magento Enterprise on them to be able to install **enterprise edition**.

# Bug Fixes

- If Magento Schema is installed to the MySQL successfully from the first try, CMA will not install it a second time as it did before.
---

## v1.3.2-alpha.1 (25/03/2021)
# What's New

- Added dependency checks for each supported platform: macOS, Arch Linux, Ubuntu, Linux Mint, Fedora and CentOS.
  Now before startup CMA will check if required packages are installed and if some packages are missing will print an error with a command to install missing packages.

# Miscellaneous
- Adjusted task titles.
- Bumped dependency versions.
- Added typings to existing tasks via JSDoc.

# Alpha-specific.

- Enabled CPU architecture support for `arm64`.
---

## v1.3.3-alpha.5 (23/03/2021)
# What's New

- Fixed error **The default website isn't defined. Set the website and try again**.
  Now setup should perform as smooth as possible. e00be8a3a875a0bdb3a2e2a4e4c427ab4c04e84c

# Miscellaneous

- Hide duplicate "Using Magento" task title. 8ea19a589a464ef6ebf16ade5a6806a0722d2a0d
- Adjusted task titles to use **Present continuous** tense. 931246c5ea406a49b6058301df2ff0484014f34c
- Adjusted **Update to newer version** message. fb71d2b94aacf10740da3ddf5e1f08763acbdcee
---

## v1.3.2 (22/03/2021)
# What's New

- Added [config file](https://docs.create-magento-app.com/getting-started/config-file) validator.
  Now CMA will check if your config file is using the correct syntax.
- Added support for accessing CMA instance on the local network.
  Documentation available [here](https://docs.create-magento-app.com/usage-guide/setup-public-access).

# Bug Fixes

- Fixed theme restore after database dump import if no theme configuration was set before. (which means that the CMA instance is super-fresh and don't have a theme selected.) #20 

# Miscellaneous

- Fixed some typos on task titles.
- Removed duplicate PHP configuration task from PHP installation.
---

## v1.3.1 (16/03/2021)
# What's New

- `magento-scripts` are now able to update the `app/etc/env.php` file too!
  This is necessary to ensure that Magento will use the correct ports for MySQL and Redis connection. Previously, if ports for those services have changed for some reason, you had to either delete the `app/etc/env.php` file or update it manually which is not very convenient. cd97603eb29ea9b122a3d35caf7e3071b2e1ed72
- Added theme restoration after dump import.
  Now after you import database dump successfully `magento-scripts` will restore previous theme configuration from the old database. dc76803c4cc96471999b79288f8b3bf2e4f1bb06
- Increased admin session lifetime to around 1 month so you can develop more comfortably without need to constantly login into the Magento admin panel. 368374f7b0597f8bf4a0baf6782177a412fa616f
- Some Magento tasks that are called during runtime now will give more info about which commands they are actually executing under the hood with logs. 368374f7b0597f8bf4a0baf6782177a412fa616f
- `Update to latest version` message will now provide a correct command to update `magento-scripts`. 5e1ea10b9d190fd9e743e11ceb9c16812f4840df

# Bug Fixes

- Fixed error when importing database from dump file using [import-db](https://docs.create-magento-app.com/getting-started/available-commands/import-db) command. #20 
  The problem was that fix db task is required a MySQL connection in the code, but none was provided. 7457bb3f5cd0c9ce59dd9727e6f8bbb7830ae0cb
---

## v1.3.0 (12/03/2021)
# What's New

- New command `import-db`!
  This command allows importing database dump in MySQL in a single command. You don't need to do basically anything manually anymore. `magento-scripts` will apply all necessary patches to ensure that the database will work with the current configuration!
  Documentation available [here](https://docs.create-magento-app.com/getting-started/available-commands/import-db).
 - `start` command received new option `--import-db`.
  It does the same thing as the `import-db` command but allows to import database dump during start.
  Documentation available [here](https://docs.create-magento-app.com/getting-started/available-commands/start#import-db).
- When running `cli` command now will be printed in console available aliases and shortcuts so you don't forget them!
- Removed deprecation warning in `cli` command on macOS Catalina and newer.
- Improved PHP extensions version detection.
  Now, `magento-scripts` will correctly identify missing extensions for the project and if the existing extension version is not correct for the project will install the correct version.
  [Our guide](https://docs.create-magento-app.com/getting-started/config-file/configuring-php#installing-php-extensions) for working with PHP extensions!
- Now `magento-scripts` will validate the connection to MySQL before it starts running Magento setup.
This eliminates the famous **MySQL server has gone away** error during the first install and start of the project.
Also, this connection is used to setup Magento configurations for ElasticSearch, base URL and URL rewrites so the whole startup process received a *speed boost*.

# Bug Fixes
- Fixed once and forever problem with tunability CMA project to start after system shut down without stopping CMA projects.

# Miscellaneous 
- Bumped XDebug version to [3.0.3](https://xdebug.org/announcements/2021-02-22).
- Added check for ElasticSearch port configuration.
- Improved support for Magento version picker. [Magento 2.4.2](https://devdocs.magento.com/guides/v2.4/release-notes/open-source-2-4-2.html) support is coming soon.
- Alpha versions now will be published on NPM using an `alpha` tag.
  To install an alpha version: `npm i @scandipwa/magento-scripts@alpha`
---

## create-magento-app@1.2.0 (12/03/2021)
Added command `import-db` to the scripts list.
---

## @scandipwa/magento-scripts@1.2.3-alpha.2 (10/03/2021)
This pre-release contains the following changes:

- `magento-scripts` will now strictly check PHP extensions defined in the configuration file and install the correct version.|
  Previously, to upgrade XDebug, for example, you had to manually disable the extension with PHPBrew.
- Now when running [cli](https://docs.create-magento-app.com/usage-guide/cli) command, in the console will be printed message with available aliases, such as `php`, `magento`, `composer`, and shortcuts: `m` for `magento` and `c` for `composer`.
- Enabled [OPCache](https://www.php.net/manual/en/book.opcache.php) (Temporarily).
- Improved support for Magento version picker. [Magento 2.4.2](https://devdocs.magento.com/guides/v2.4/release-notes/open-source-2-4-2.html) support is coming soon.
- Bumped XDebug version to 3.0.3. ([Changelog](https://xdebug.org/announcements/2021-02-22))
---

## @scandipwa/magento-scripts@1.2.3-alpha.1 (09/03/2021)
This pre-release contains the following changes:

- Update command now recognizes if a newer version is available but it is a pre-release alpha version.
- Updated MySQL container health-check command. Now it should report the correct heath state.
- Fixed type errors in a new setup with MySQL connection. #19 
---

## @scandipwa/magento-scripts@1.2.3-alpha.0 (08/03/2021)
This pre-release contains the following changes:

- Now `magento-scripts` will validate the connection to MySQL before it starts running Magento setup.
  This eliminates the famous **MySQL server has gone away** error during the first install and start of the project.
  Also, this connection is used to setup Magento configurations for ElasticSearch, base URL and URL rewrites so the whole startup process received a *speed boost*.
- Added check for ElasticSearch port configuration.
- Fixed once and forever problem with tunability CMA project to start after system shut down without stopping CMA projects.
---

## Bug Fixes and Improvements (26/02/2021)
# What is New
- Now `magento-scripts` can choose available ports not only if they are free on the system, but also if they are not used by other CMA instances.
To enable this feature, set `useNonOverlappingPorts` property to `true` in config file.
- Configuration file for the [cli command](https://docs.create-magento-app.com/getting-started/available-commands/cli) is now a template file that will be stored in the cache folder. This is needed if you are using a custom PHP version, rather default PHP version by `magento-scripts`, which currently is `7.4.13`.

# Bug Fixes
- Fixed inability for CMA project to start after the system is shut down without manually stopping CMA projects. #16 
---

## @scandipwa/magento-scripts@1.2.2-alpha.0 (23/02/2021)
This release contains the following changes:
- Now `magento-scripts` will choose available ports not only if they are free on the system, but also if they are not used by other CMA instances.
No more `app/etc/env.php` file deletion of ports have changed while your project was offline during other projects development.
- Configuration file for `cli` command is now a template file that will be stored in the cache folder. This is needed if you are using custom PHP version, rather default PHP version by `magento-scripts`, which currently is `7.4.13`.
---

## Prefixes and automatic theme installation! (19/02/2021)
# What is New
- :clap: Prefixes :clap:
Previously, if you have 2 folders with the same name in but located different places (for example `/home/user/my-cma-app` and `/home/user/test/my-cma-app` you might experience strange behaviour, like 404 errors in Nginx or ` failed to mount local volume: no such file or directory`. Now, CMA will **by default** append a unique prefix to the docker container names and volume names which should prevent errors described previously from appearing and allow to smoothly running CMA in non-unique folder names.
⚠️ Since prefixes are enabled **by default**, you might encounter problems during the upgrading to the version. We recommend disabling prefixes if this is the case through the config file, set the `prefix` property to `false`.
- Automatic theme installation.
Now if your Magento is not installed and you starting the CMA project, magento-scripts will try to detect if you already have a theme installed in `composer.json` or not, and if it is then it will automatically link it after startup is complete.

# Bug Fixes
- If magento-scripts are out-of-date, console message said to run a command `npm upgrade -g ${package name}` even if a package is installed locally. Now it will print the correct command if a package is installed locally or globally.
---

## Configuration file is here! (12/02/2021)
# What's new

- Configuration file is finally here! :clap:
Now when running `start` command will be automatically created `cma.js` file inside your project root directory. This file contains Magento configuration, docker services configuration, host and SSL configuration.
  > NOTE: If you are upgrading existing CMA project old Magento configuration from the file `app-config.json` will be converted to  `magento` field in `cma.js`.

  More about the configuration file can be found in docs: https://docs.create-magento-app.com/getting-started/config-file.
- `status` command will now also display containers environment variables. Useful when you need to get MySQL credentials for example.



---

## @scandipwa/magento-scripts@1.2.0-alpha.5 (11/02/2021)
This release fixes when linking theme CMA was choosing the wrong port for redis persistent query configuration.
---

## @scandipwa/magento-scripts@1.2.0-alpha.4 (11/02/2021)
Added support for custom `host` field in the configuration file. This field is controlling default base_url in Magento.

> NOTE: if you are using `host` configuration and some custom port that is not 80 or 8080, browsers can throw an error **ERR_UNSAFE_PORT**: https://superuser.com/questions/188006/how-to-fix-err-unsafe-port-error-on-chrome-when-browsing-to-unsafe-ports
---

## @scandipwa/magento-scripts@1.2.0-alpha.3 (10/02/2021)
Legacy Magento configuration from `cache-folder/app-config.json` file will be automatically transferred to the new config file located in the projects root directory.
---

## @scandipwa/magento-scripts@1.2.0-alpha.2 (09/02/2021)
This alpha version brings proper support for the configuration file.
Now Magento configuration file `app-config.json` is moved to `cma.js` file which is located in the projects root folder, this should allow easier access to the configuration and brings access to the configuration of CMA project itself!
With `cma.js` you can:
- Update versions of Nginx, MySQL, ElasticSearch and Redis containers.
- Use custom nginx configuration file.
- Use custom PHP configuration file. 
- Add PHP extensions or override existing ones. (like updating XDebug version)

In the future, we're also planning on adding support to override environmental variables for MySQL and ES containers.
---

## MySQL 8.0 and XDebug 3.0.2 and bug fixes! (05/02/2021)
# Bug Fixes
- Previously, some docker volume names could interfere between themselves which caused `Couldn't mount volume, no such file or directory` docker error. (For example volume name for nginx in `be` directory will be `be_nginx-data`, and if you try to create new CMA project in a directory with name `additional-name-be` it will not create new docker volume for nginx and throw an error.) #9 
This update fixes that.
- Command `link` tasks for check folder and run setup persistent cache received titles.

# What is new
- MySQL version was bumped to 8.0 ([migration guide from MySQL 5.7](https://devdocs.magento.com/guides/v2.4/install-gde/prereq/mysql.html#upgrading-from-mysql-57-to-mysql-8)), XDebug version to 3.0.2.
- Bumped node dependencies versions.

---

## MySQL 8.0 and XDebug 3.0.2 (30/01/2021)
This version includes bugfixes from version **1.1.5**, MySQL version **8.0** as well as XDebug **3.0.2**.
---

## Bug Fixes (30/01/2021)
This release is small but important:
- There was some small bug in command execution utility that leads to issues in command response processing logic, for example in checking in current instance is using `url-rewrites` or not.
Also, setting `url-rewrites` task had no name, so it was invisible to the user.
---

## Bug Fixes (22/01/2021)
This release is small but important:
- In magento-scripts@1.1.1 `php.ini` was moved from the user's home directory to the project cache folder, but commands wrappers that were using PHP for Composer and Magento commands execution still used the default `php.ini` in users home directory which caused memory-limit errors across the app. Now with correct `php.ini` configuration file, there should be no such issues.
---

## Bug Fixes (21/01/2021)
This release is small but important:
- `create-magento-app` had a typo inside package.json template for `exec` command.
- `magento-scripts` was replacing existing `composer.json` file if it detected that magento is not installed. #6 
Now it will not replace `composer.json` but install missing dependencies for magento and setup composer repository to `repo.magento.com`.