# Changelog

## v1.8.0 (09/07/2021)
# IMPORTANT COMPATIBILITY CHANGES, Improved XDebug 2 support, compressing for `import-db` from remote databases and more!

## Important Changes

Recently was discovered a bug in prefix generation.

In general, if you installs and runs a CMA project in a directory with a name that contains dots (.) this was treated as a file name, so everything after a dot was thrown away.
This could lead to interference between projects since `project-2.4.1` was using the same prefix as `project-2.4.2`, although with folder name we use folder creation timestamp, so the chance of this very low.

For that reason, since **this release** this issue is fixed, now the full folder name is used and old MySQL, ElasticSearch and Redis volumes will be automatically converted to new use new prefixes when you run [start](https://docs.create-magento-app.com/getting-started/available-commands/start) command.

However, IF you try downgrading to an older version CMA, your setup will not have data from new volumes.

## What's New

- XDebug 2 support!
  Previously only XDebug 3 configuration was used so it might not be working with XDebug 2. Now it should work as expected.
- XDebug extension is not installed **by default**.
  Previously, XDebug was installed but disabled through options in `php.ini` file. Now it's not installed and enabled unless you run project in **debug** mode.
- Importing database from a remote server (ssh) now uses dump compression **by default**.
  If, for some reason, you don't want to use compression, use the new option `no-compress`.
- Docker can be automatically installed on the supported platform: Linux!
  For macOS and Windows, you will still get a message with instructions on installing Docker on your system.

## Miscellaneous

- Improved validation of local `auth.json` file.
- [start](https://docs.create-magento-app.com/getting-started/available-commands/start) command received new option `-v, --verbose`.
  Now **by default** logs from Magento install & setup & upgrade will not be shown in the console, but if you need them, use this option.

## Bug FIxes

- ElasticSearch container option `xpack.ml.enabled` is now enabled correctly on macOS systems. 71c67cb1646b316424c23cf0a4ee0b1f16b5fbe3

---

## v1.7.0 (02/07/2021)
# Magento version 2.3.x support, automatic PHPBrew install and more!

## What's New

- Magento version 2.3.x are supported now!
  This includes all released versions as well as patches.
- Magento 2.4.2-p1 is now supported as well!
- PHPBrew will now install automatically for each supported platform!
- `auth.json` file is now supported as well!
  Using the global `COMPOSER_AUTH` environmental variable is not required anymore.

## Miscellaneous

- `update-env` script is also checking for redis session & cache host values.
- Magento `setup:install` now will use `--cleanup-database` option only if the install was unsuccessful on the first try.
- In the `import-db` command `magento index:reindex` command will run only after the Magento setup is finished using the new dump.
- Added error handlers for JSON parsers so error messages are more meaningful.
- Docker network for the project is now removed during the stop task.
  This should prevent docker networks from flooding.
  [See limitations docs](https://docs.create-magento-app.com/getting-started/limitations).
- Converting legacy [magento-docker](https://github.com/scandipwa/magento-docker) setup to CMA [guide is already available](https://docs.create-magento-app.com/usage-guide/converting-legacy-docker-setup-to-cma)!
- Our repository now has every ScandiPWA supported Magento version in [sample-packages](https://github.com/scandipwa/create-magento-app/tree/master/sample-packages) folder!

## Bug Fixes

- Fixed `safe-regex-extract` throwing an error if no result was found. b4de6cd5d7b52b807af0ddfb5b5c0ee6eef4d366
---

## v.1.6.1 (22/06/2021)
# Quality of Life improvements!

## What's New

- [import-db](https://docs.create-magento-app.com/getting-started/available-commands/import-db) command now has [--with-customers-data](https://docs.create-magento-app.com/getting-started/available-commands/import-db#with-customers-data) option, which will include customers and orders data into dump files and won't delete them while optimising the database task.
- When importing remote database using [import-db](https://docs.create-magento-app.com/getting-started/available-commands/import-db) command, CMA will check if dump files already exist on the remote server and ask the user if he wants to make a new dump or use existing on the remote server.

## Miscellaneous 

- 9003 port is added to the permanent port ignore list for CMA because otherwise PHP-FPM can take it and it will be impossible to debug the project.
  **NOTE** If your PHP-FPM instance already using port 9003, you need to manually alter the `port-config.json` file in the `node_modules/.create-magento-app-cache` folder or update to this version your instances.
- Internal calls for magento `setup:install` and `setup:upgrade` commands now include `--no-interaction` options, so it should prevent Magento installation and migration from freezing.
- Connection to MySQL now checks if MySQL container is starting and extends connection time and tells the user about it.

## Bug Fixes

- Added startup option to MySQL container `--default-authentication-plugin=mysql_native_password` which should resolve error **Response: SQLSTATE[HY000] [2054] The server requested authentication method unknown to the client**
  **NOTE** If you are experiencing this issue and you updated to this version, you will need to delete MySQL volume so it will initialize using the correct authentication method.
---

## v1.6.0 (18/06/2021)
## What's New

- [Import db](https://docs.create-magento-app.com/getting-started/available-commands/import-db) command now has [--remote-db](https://docs.create-magento-app.com/getting-started/available-commands/import-db#r-remote-db) option to import database dumps from remote servers.
  Usage example:
  ```bash
  yarn run import-db --remote-db ssh://my-ssh-username@my-ssh-server.com
  ```
  Now it will connect via ssh to your server, create dump files (`dump-0.sql` and `dump-1.sql`), download them to your projects root folder, merge them to single `dump.sql` and import them to your local instance with applied fixes.

  Note, that the dump file created by this command is much smaller than dump files that are created by default. This is because we omit **orders** and **customers** data when we're creating dump file so it comes in a much smaller size.

  For example, previously a dump from a database could weigh 2.7GB, now using this import feature size will be reduced to 4MB.
- [start](https://docs.create-magento-app.com/getting-started/available-commands/start) command now have [--recompile-php](https://docs.create-magento-app.com/getting-started/available-commands/start#recompile-php) option to recompile PHP, if needed.
  Sometimes, for example on macOS when dynamic dependencies are updated, PHP might break. To fix this issue you had to manually delete the PHP binary in `~/.phpbrew/php/php-<version>`, so CMA will detect it and compile it.
  Now, you just need to pass this option in the start command and CMA will take care of everything.
-  Refactored start command tasks display and execution view.
  Now it should look less cluttered with unnecessary information and also show timestamps for the tasks.
- Windows platform is now also supported through WSL!
  Docs available [here](https://docs.create-magento-app.com/getting-started/prerequisites/windows-requirements).

## Miscellaneous

- Refactored [link](https://docs.create-magento-app.com/getting-started/available-commands/link) command logic.
- Link command now also automatically start the project if it was stopped.
- If no connection string was supplied to import-db command with remote-db option, CMA will ask for it during runtime.
- Adjusted Magento configuration task execution order.
- Persisted query setup for ScandiPWA theme is now also executed during the Magento configuration task.
- Start command will print into command output `magento-scripts` version.

## Bug Fixes

- Setup persisted query task will now use correct PHP version on your project. 93df0bf4843f430a1dbc3a3ec974b0f1adb76cf3
- `start php-fpm` task will now will not break if php-fpm already running and just skip this step. 650c8c693f0146bb281541ba922d40af1199613a
- MySQL connection will now print errors instead of only hardcoded message about the error.
---

## v1.5.4-alpha.3 (18/06/2021)
- Fixed import errors.
- MySQL connection will now print errors instead of only hardcoded message about the error.
---

## v1.5.4-alpha.2 (17/06/2021)
# Recompile PHP option, import remote db improvements and bug fixes!

## What's New

- Removed check for readymage server on import-db, added support for any ssh servers with mysqldump installed on them.
  CMA will ask the same things to connect to a remote server via ssh, then it will ask to alter (if needed) mysqldump command so the user will provide correct credentials for it. Then, the process will continue as follows: CMA will make 2 dump files (**dump-0.sql** and **dump-1.sql**), download them, concat them into a single **dump.sql** file and continue to import into your local instance.
- [start](https://docs.create-magento-app.com/getting-started/available-commands/start) command now have `--recompile-php` option to recompile PHP, if needed.
  Sometimes, on macOS when dynamic dependencies are updated, PHP might break. To fix this issue you had to manually delete the PHP binary in `~/.phpbrew/php/php-<version>`, so CMA will detect it and compile it.
  Now, you just need to pass this option in the start command and CMA will take care of everything.
- [import-db](https://docs.create-magento-app.com/getting-started/available-commands/import-db) command **remote-db** option now has an alias **-r**.
  So, to import remote db command can look like this: `npm run import-db -r <connection string>` or `npm run import-db --remote-db <connection string>`
- If no connection string was supplied to import-db command with remote-db option, CMA will ask for it during runtime.

## Bug Fixes

- Setup persisted query task will now use correct PHP version on your project. 93df0bf4843f430a1dbc3a3ec974b0f1adb76cf3
- `start php-fpm` task will now will not break if php-fpm already running and just skip this step. 650c8c693f0146bb281541ba922d40af1199613a
---

## v1.5.4-alpha.1 (11/06/2021)
# What's New

- [Import db](https://docs.create-magento-app.com/getting-started/available-commands/import-db) command now has `--remote-db` option to import database dumps from remote servers.
  At the moment, **only readymage ssh is supported**.
  Usage example:
  ```bash
  yarn run import-db --remote-db ssh://my-ssh-username@ssh.readymage.com
  ```
  Now it will connect via ssh to readymage instance, create dump files (`dump-0.sql` and `dump-1.sql`), download them to your projects root folder, merge them to single `dump.sql` and import to your local instance with applied fixes.

  Note, that the dump file created by this command is much smaller than dump files that are created by default on readymage. This is because we omit orders and customers data when we're creating dump file so it comes in much smaller size.

- Start command will also print into command output `magento-scripts` version.
  Printing the` magento-scripts` version is helpful for error reporting if something goes wrong.
---

## v1.5.4-alpha.0 (08/06/2021)
# Adjusted start command output and some under the hood changes

-  Refactored start command tasks display and execution view.
  Now it should look less cluttered with unnecessary information and also show timestamps for the tasks.
  Before:
  ![Screenshot_20210608_190347](https://user-images.githubusercontent.com/18352350/121219348-45fb3600-c88c-11eb-8698-ef598b6b83ce.png)

   After:
   ![Screenshot_20210608_190506](https://user-images.githubusercontent.com/18352350/121219512-717e2080-c88c-11eb-97d5-88ae22aa53d7.png)

- Refactored [link](https://docs.create-magento-app.com/getting-started/available-commands/link) command logic.
- Link command now also automatically start the project if it was stopped.
- Adjusted Magento configuration task execution order.
- Persisted query setup for ScandiPWA theme is now also executed during the Magento configuration task.

---

## create-magento-app@1.2.4 (08/06/2021)
- Bump dependencies version.
---

## v1.5.3 (08/06/2021)
# Bug Fixes!

- Fixed [exec](https://docs.create-magento-app.com/getting-started/available-commands/exec) and [logs](https://docs.create-magento-app.com/getting-started/available-commands/logs) command throwing an error about `docker.getContainers not a function`.

# Miscelarrious

- Bump dependencies version.

---

## v1.5.2 (31/05/2021)
# Bug Fixes!

- Fixed `docker.getContainers is not a function`  error that caused the application to unable to properly start or stop. 56e3d28b43782ce96f778b9781d247163b3cbf47
---

## V1.5.1 (28/05/2021)
# System config, Bug Fixes and Performance Improvements!

## What is New

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

## Bug Fixes

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