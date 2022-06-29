<?php

function varexport($expression, $return=false): string
{
    $export = var_export($expression, true);
    $export = preg_replace("/^([ ]*)(.*)/m", '$1$1$2', $export);
    $array = preg_split("/\r\n|\n|\r/", $export);
    $array = preg_replace(["/\s*array\s\($/", "/\)(,)?$/", "/\s=>\s$/"], [null, ']$1', ' => ['], $array);
    $export = join(PHP_EOL, array_filter(["["] + $array));
    if ((bool)$return) {
        return $export;
    } else {
        echo $export;
    }
}

function joinpaths(): string
{
    $paths = array();

    foreach (func_get_args() as $arg) {
        if ($arg !== '') {
            $paths[] = $arg;
        }
    }

    return preg_replace('#/+#', '/', join('/', $paths));
}

class EnvUpdater
{

    /**
     * @var array
     */
    private $config;

    /**
     * @var mixed
     */
    private $portConfig;

    public function loadConfig()
    {
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

    public function loadPortConfig()
    {
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

    public function modifyConfig()
    {
        // set admin uri
        $this->config['backend']['frontName'] = getenv('ADMIN_URI');

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
        if (getenv('SETUP_PQ') == '1') {
            $cacheConfig = &$this->config['cache'];
            $redisPort = getenv('REDIS_PORT');

            if (isset($cacheConfig) && isset($cacheConfig['persisted-query']) && isset($cacheConfig['persisted-query']['redis']) && $cacheConfig['persisted-query']['redis']['port'] != $redisPort) {
                $cacheConfig['persisted-query']['redis']['port'] = $redisPort;
            } else {
                if (!isset($cacheConfig)) {
                    $this->config['cache'] = [];
                }
                $this->config['cache']['persisted-query'] = [
                    'redis' => [
                        'host' => 'localhost',
                        'port' => $redisPort,
                        'database' => '5',
                        'scheme' => 'tcp'
                    ]
                ];
            }
        } else {
            unset($this->config['cache']['persisted-query']);
        }

        // set varnish config
        $httpCacheHosts = &$this->config['http_cache_hosts'];
        $httpCacheHosts = [];

        if (getenv('USE_VARNISH') == '1') {
            $varnishHost = getenv('VARNISH_HOST');
            $varnishPort = getenv('VARNISH_PORT');
            $previousVarnishPort = getenv('PREVIOUS_VARNISH_PORT');
            $varnishConfig = [
                'host' => $varnishHost,
                'port' => $varnishPort
            ];

            if (isset($httpCacheHosts)) {
                $varnishHostExists = false;
                foreach ($httpCacheHosts as $host) {
                    if ($host['host'] == $varnishHost && $host['port'] == $previousVarnishPort) {
                        $host['port'] = $varnishPort;
                        $varnishHostExists = true;
                        break;
                    }
                }

                if (!$varnishHostExists) {
                    $httpCacheHosts = [$varnishConfig];
                }
            } else {
                $this->config['http_cache_hosts'] = [$varnishConfig];
            }
        } else {
            unset($this->config['http_cache_hosts']);
        }
    }

    public function saveConfig(string $filePath)
    {
        file_put_contents(
            $filePath,
            '<?php'.PHP_EOL.'return '.varexport($this->config, true).';' . PHP_EOL
        );
    }

    public function update()
    {
        $this->loadConfig();
        $this->loadPortConfig();
        $this->modifyConfig();
        $this->saveConfig(joinpaths(getcwd(), './app/etc/env.php'));
    }
}

$updater = new EnvUpdater();

$updater->update();
