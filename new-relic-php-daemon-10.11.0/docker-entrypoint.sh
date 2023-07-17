#!/bin/sh
#------------------------------------------------------------------------------
# Copyright [2019] New Relic Corporation. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#------------------------------------------------------------------------------
set -e

defaultArgs=" --logfile /proc/self/fd/1 --watchdog-foreground --address=$(hostname):31339"

case "$1" in
  -*)
    #args start with a flag
    set -- /usr/bin/newrelic-daemon $defaultArgs "$@"
    ;;
  '/usr/bin/newrelic-daemon')
    # Remove the first element from the arguments
    shift 1
    set -- /usr/bin/newrelic-daemon $defaultArgs "$@"
    ;;
  *)
    #likely invalid args, but the daemon will handle it with graceful messages.
    set -- /usr/bin/newrelic-daemon $defaultArgs "$@"
    ;;
esac

exec "$@"
