<?php
$directories = [
    __DIR__ . '/var',
    __DIR__ . '/generated',
    __DIR__ . '/vendor',
    __DIR__ . '/pub/static',
    __DIR__ . '/pub/media',
    __DIR__ . '/app/etc',
];

$results = [];

foreach ($directories as $directory) {
    $result = [];
    $result['exists'] = file_exists($directory);
    if ($result['exists']) {
        $result['owner'] = posix_getpwuid(fileowner($directory));
        $result['group'] = posix_getgrgid(filegroup($directory));
        $result['current_user'] = posix_getpwuid(posix_geteuid());

        $result['writable'] = is_writable($directory);
        $result['readable'] = is_readable($directory);
        $result['permissions'] =substr(sprintf('%o', fileperms($directory)), -4);
        $result['is_current_user_directory_owner'] = $result['current_user'] === $result['owner'];
    }

    $results[] = $result;
}

echo json_encode($results, JSON_PRETTY_PRINT);
