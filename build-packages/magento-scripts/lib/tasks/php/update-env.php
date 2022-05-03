<?php

function varexport($expression, $return=FALSE): string
{
    $export = var_export($expression, TRUE);
    $export = preg_replace("/^([ ]*)(.*)/m", '$1$1$2', $export);
    $array = preg_split("/\r\n|\n|\r/", $export);
    $array = preg_replace(["/\s*array\s\($/", "/\)(,)?$/", "/\s=>\s$/"], [NULL, ']$1', ' => ['], $array);
    $export = join(PHP_EOL, array_filter(["["] + $array));
    if ((bool)$return) return $export; else echo $export;
}

function joinpaths(): string
{
    $paths = array();

    foreach (func_get_args() as $arg) {
        if ($arg !== '') { $paths[] = $arg; }
    }

    return preg_replace('#/+#','/',join('/', $paths));
}

class EnvUpdater {

    /**
     * @var array
     */
    private $config;

    /**
     * @var mixed
     */
    private $portConfig;

    public function loadConfig() {
        $this->config = require './app/etc/env.php';
    }

    /**
     * @return mixed
     */
    public function getConfig(): array
    {
        return $this->config;
    }

    /**
     * @return mixed
     */
    public function getPortConfig(): mixed
    {
        return $this->portConfig;
    }

    public function loadPortConfig() {
        $portConfigContent = file_get_contents('./node_modules/.create-magento-app-cache/port-config.json');
        if ($portConfigContent === false) {
            throw new Error('Port config file does not exists in cache directory');
        }

        $portConfigJsonData = json_decode($portConfigContent, true);
        if ($portConfigJsonData === null) {
            throw new Error('Port config file is not content');
        }

        $this->portConfig = $portConfigJsonData;
    }

    public function modifyConfig() {
        // update mysql config
        if (isset($this->config['db']['connection']['default'])) {
            $conn = &$this->config['db']['connection']['default'];
            if (
                isset($conn['engine']) &&
                isset($conn['host']) &&
                $conn['engine'] === 'innodb' &&
                $conn['host'] !== '127.0.0.1:' . $this->portConfig['mysql']
            ) {
                $conn['host'] = '127.0.0.1:' . $this->portConfig['mysql'];
            }
        }

        // update redis session config
        if (
            isset($this->config['session']) &&
            $this->config['session']['save'] === 'redis' &&
            $this->config['session']['redis']['port'] !== strval($this->portConfig['redis'])
        ) {
            $this->config['session']['redis']['port'] = strval($this->portConfig['redis']);
        }

        if (
            isset($this->config['session']) &&
            $this->config['session']['save'] === 'redis' &&
            $this->config['session']['redis']['host'] !== '127.0.0.1'
        ) {
            $this->config['session']['redis']['host'] = '127.0.0.1';
        }

        // update redis frontend config
        if (isset($this->config['cache']['frontend']['default'])) {
            $frontendCache = &$this->config['cache']['frontend']['default'];
            if ($frontendCache['backend_options']['port'] !== strval($this->portConfig['redis'])) {
                $frontendCache['backend_options']['port'] = strval($this->portConfig['redis']);
            }
            if ($frontendCache['backend_options']['server'] !== '127.0.0.1') {
                $frontendCache['backend_options']['server'] = '127.0.0.1';
            }
        }

        // update persisted query redis config
        if (isset($this->config['cache']['persisted-query'])) {
            $persistedQuery = &$this->config['cache']['persisted-query'];

            if (isset($persistedQuery['redis'])) {
                if ($persistedQuery['redis']['port'] !== strval($this->portConfig['redis'])) {
                    $persistedQuery['redis']['port'] = strval($this->portConfig['redis']);
                }
                if ($persistedQuery['redis']['host'] !== 'localhost') {
                    $persistedQuery['redis']['host'] = 'localhost';
                }
            }
        }

        if (getenv('USE_VARNISH') == '1') {
            $httpCacheHosts = &$this->config['http_cache_hosts'];
            $varnishHost = getenv('VARNISH_HOST');
            $varnishPort = getenv('VARNISH_PORT');
            $varnishConfig = [
                'host' => $varnishHost,
                'port' => $varnishPort
            ];

            if (isset($httpCacheHosts)) {
                $varnishHostExists = false;
                foreach ($httpCacheHosts as $host) {
                    if ($host['host'] == $varnishHost && $host['port'] == $varnishPort) {
                        $varnishHostExists = true;
                        break;
                    }
                }

                if (!$varnishHostExists) {
                    if (size($httpCacheHosts) === 1) {
                        $httpCacheHosts = [
                            $varnishConfig
                        ];
                    } else {
                        $httpCacheHosts[] = $varnishConfig;
                    }
                }
            } else {
                $this->config['http_cache_hosts'] = [];
                $this->config['http_cache_hosts'][] = $varnishConfig;
            }
        }
    }

    public function saveConfig(string $filePath){
        file_put_contents(
            $filePath,
            '<?php'.PHP_EOL.'return '.varexport($this->config, true).';' . PHP_EOL
        );
    }

    public function update(){
        $this->loadConfig();
        $this->loadPortConfig();
        $this->modifyConfig();
        $this->saveConfig(joinpaths(getcwd(), './app/etc/env.php'));
    }
}

$updater = new EnvUpdater();

$updater->update();
