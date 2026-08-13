<?php
/**
 * Hardens Composer against spurious opendir() ENOENT failures.
 *
 * On some hosts (observed with the project directory bind-mounted from a btrfs
 * volume) opendir() intermittently reports ENOENT for a directory that exists.
 * Composer\Util\Filesystem::isDirEmpty() lets the resulting UnexpectedValueException
 * escape, which aborts `composer install` with a misleading
 * "Install of <package> failed" + RecursiveDirectoryIterator error, even though
 * every package was installed correctly.
 *
 * This rewrites isDirEmpty() inside composer.phar so it retries before giving up.
 *
 * Usage: php -d phar.readonly=0 cma-patch-composer.php [path-to-composer]
 */

$composerPath = $argv[1] ?? '/usr/local/bin/composer';
$entry = 'src/Composer/Util/Filesystem.php';
$marker = 'cmaIsDirEmptyUnpatched';

function warn(string $message): void
{
    fwrite(STDERR, "cma-patch-composer: WARNING: $message\n");
    fwrite(STDERR, "cma-patch-composer: composer left unpatched, `composer install` may fail spuriously\n");
}

if (ini_get('phar.readonly')) {
    warn('phar.readonly is on, re-run with `php -d phar.readonly=0`');
    exit(0);
}

if (!is_file($composerPath)) {
    warn("$composerPath not found");
    exit(0);
}

$work = sys_get_temp_dir() . '/cma-composer-patch.phar';
@unlink($work);

if (!copy($composerPath, $work)) {
    warn("could not copy $composerPath to $work");
    exit(0);
}

try {
    $phar = new Phar($work);
} catch (Throwable $e) {
    warn('could not open composer.phar: ' . $e->getMessage());
    exit(0);
}

if (!isset($phar[$entry])) {
    warn("$entry not found inside composer.phar");
    exit(0);
}

$source = $phar[$entry]->getContent();

if (strpos($source, $marker) !== false) {
    echo "cma-patch-composer: composer.phar is already patched\n";
    exit(0);
}

$signature = '/public function isDirEmpty\(\s*(?:string\s+)?(?P<var>\$\w+)\s*\)(?P<ret>\s*:\s*[^\s{]+)?\s*\{/';

if (!preg_match($signature, $source, $m)) {
    warn('Filesystem::isDirEmpty() signature not recognised (composer internals changed?)');
    exit(0);
}

$var = $m['var'];
$ret = $m['ret'] ?? '';

$wrapper = <<<PHP
public function isDirEmpty($var)$ret
{
for (\$cmaAttempt = 0; ; \$cmaAttempt++) {
try {
return \$this->$marker($var);
} catch (\\UnexpectedValueException \$cmaError) {
clearstatcache(true, $var);
if (\$cmaAttempt >= 5 || !is_dir($var)) {
throw \$cmaError;
}
if (getenv('CMA_COMPOSER_PATCH_DEBUG')) {
fwrite(STDERR, "cma-patch-composer: retrying isDirEmpty(" . $var . ") after spurious failure: " . \$cmaError->getMessage() . "\\n");
}
usleep(2000 << \$cmaAttempt);
}
}
}

private function $marker($var)$ret
{
PHP;

$patched = preg_replace($signature, $wrapper, $source, 1, $count);

if ($count !== 1 || $patched === null) {
    warn('failed to rewrite Filesystem::isDirEmpty()');
    exit(0);
}

$phar[$entry] = $patched;
unset($phar);

$check = [];
exec(escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg($work) . ' --version 2>&1', $check, $status);

if ($status !== 0) {
    warn('patched composer.phar failed its smoke test: ' . implode(' ', $check));
    @unlink($work);
    exit(0);
}

if (!copy($work, $composerPath)) {
    warn("could not write patched composer back to $composerPath");
    @unlink($work);
    exit(0);
}

@unlink($work);
chmod($composerPath, 0755);

echo "cma-patch-composer: patched Filesystem::isDirEmpty() in $composerPath (" . trim($check[0] ?? '') . ")\n";
