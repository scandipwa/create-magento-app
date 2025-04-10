#/bin/sh

SYNC_FROM_DIR=${SYNC_FROM_DIR:-/data-to}
SYNC_TO_DIR=${SYNC_TO_DIR:-/data-from}

# First we need to sync directories to ensure that the initial state is the same

echo "Syncing directories..."
# Check if the source directory exists
if [ ! -d "${SYNC_FROM_DIR}" ]; then
    echo "Source directory ${SYNC_FROM_DIR} does not exist. Exiting."
    exit 1
fi
# Check if the destination directory exists
if [ ! -d "${SYNC_TO_DIR}" ]; then
    echo "Destination directory ${SYNC_TO_DIR} does not exist. Exiting."
    exit 1
fi

# Sync the directories using rsync with hashing to ensure that the files are identical
rsync -av --delete --checksum "${SYNC_FROM_DIR}/" "${SYNC_TO_DIR}/"

# Check if the rsync command was successful
if [ $? -ne 0 ]; then
    echo "Error syncing directories. Exiting."
    exit 1
fi

echo "Directories synced successfully."

# Now we need to watch for changes in the directory and sync them to the other directory

# This script will run in the container and watch for changes in the directory defined by SYNC_FROM_DIR.
# When a change is detected, it will sync the changes to the directory defined by SYNC_TO_DIR. Only actual events (create, modify, delete) will be synced.
# The script uses rsync to perform the synchronization.
# The script uses inotifywait to monitor the directory for changes.

inotifywait -m -r -e create,modify,delete --format '%w%f' --timeout 2 "${SYNC_FROM_DIR}" | while read FILE
do
    # Check if the file is a directory
    if [ -d "${FILE}" ]; then
        # Track time took for syncing
        START_TIME=$(date +%s)
        # Sync the directory to the destination directory
        rsync -av --delete "${FILE}/" "${SYNC_TO_DIR}/"
        # Check if the rsync command was successful
        if [ $? -ne 0 ]; then
            echo "Error syncing directory ${FILE}. Exiting."
            exit 1
        fi
        # Calculate the time taken for syncing
        END_TIME=$(date +%s)
        TIME_TAKEN=$((END_TIME - START_TIME))
        echo "Directory ${FILE} synced successfully in ${TIME_TAKEN} seconds."
    else
        # Track time took for syncing
        START_TIME=$(date +%s)
        # Sync the file to the destination directory
        rsync -av --delete "${FILE}" "${SYNC_TO_DIR}/"
        # Check if the rsync command was successful
        if [ $? -ne 0 ]; then
            echo "Error syncing file ${FILE}. Exiting."
            exit 1
        fi
        # Calculate the time taken for syncing
        END_TIME=$(date +%s)
        TIME_TAKEN=$((END_TIME - START_TIME))
        echo "File ${FILE} synced successfully in ${TIME_TAKEN} seconds."
    fi
done
