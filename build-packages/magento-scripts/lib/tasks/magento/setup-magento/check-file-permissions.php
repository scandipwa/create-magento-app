<?php
$directories = [
    '/var',
    '/generated',
    '/vendor',
    '/pub/static',
    '/pub/media',
    '/app/etc',
];

$results = [];

foreach ($directories as $dir) {
    $directory = getcwd() . $dir;
    $result = [];
    $result['exists'] = file_exists($directory);
    $result['writable'] = is_writable($directory);
    $result['readable'] = is_readable($directory);

    if ($result['exists']) {
        $result['owner'] = posix_getpwuid(fileowner($directory));
        $result['group'] = posix_getgrgid(filegroup($directory));
        $result['current_user'] = posix_getpwuid(posix_geteuid());

        $result['permissions'] =substr(sprintf('%o', fileperms($directory)), -4);
        $result['is_current_user_directory_owner'] = $result['current_user'] === $result['owner'];
    }

    $results[] = $result;
}

echo json_encode($results, JSON_PRETTY_PRINT);
