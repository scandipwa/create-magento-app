<?php
// receive directories from command line arguments
$directories = explode(",", $argv[1]);

$results = [];

foreach ($directories as $directory) {
    $result = [];
    $result['directory'] = $directory;
    $result['exists'] = file_exists($directory);
    $result['writable'] = is_writable($directory);
    $result['readable'] = is_readable($directory);

    if ($result['exists']) {
        $result['owner'] = posix_getpwuid(fileowner($directory));
        $result['group'] = posix_getgrgid(filegroup($directory));
        $result['current_user'] = posix_getpwuid(posix_geteuid());

        // Check if current user is in the group
        if ($result['group']['members'] && is_array($result['group']['members'])) {
            $result['current_user_in_group'] = in_array($result['current_user']['name'], $result['group']['members']);
        } else {
            $result['current_user_in_group'] = false;
        }

        // Check if the directory has group write permissions (g+w)
        $permissions = fileperms($directory);
        $result['has_group_write_permissions'] = ($permissions & 0x0010) !== 0;

        $result['permissions'] = substr(sprintf('%o', fileperms($directory)), -4);
        $result['is_current_user_directory_owner'] = $result['current_user'] === $result['owner'];

        if ($result['writable']) {
            // Check if new files inherit the directory's group
            try {
                $tempFile = $directory . DIRECTORY_SEPARATOR . '.temp_file_' . uniqid();
                touch($tempFile);

                $tempFileGroup = posix_getgrgid(filegroup($tempFile));
                $result['new_files_inherit_group'] = $tempFileGroup === $result['group'];
            } catch (Exception $e) {
                $result['new_files_inherit_group'] = false;
            } finally {
                // Clean up the temporary file
                if (file_exists($tempFile)) {
                    unlink($tempFile);
                }
            }
        }
    }

    $results[] = $result;
}

echo json_encode($results, JSON_PRETTY_PRINT);