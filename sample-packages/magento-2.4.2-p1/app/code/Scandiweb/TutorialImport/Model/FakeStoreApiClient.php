<?php declare(strict_types=1);

namespace Scandiweb\TutorialImport\Model;

use Magento\Framework\App\Config;
use Magento\Framework\HTTP\ZendClientFactory;
use Magento\Framework\Json\Helper\Data;
use Magento\Framework\Serialize\Serializer\Json;

class FakeStoreApiClient
{
    // the base URL of our API
    const API_URL = 'https://fakestoreapi.com/';

    // the endpoint for fetching products
    const RESOURCE_PRODUCTS = 'products';

    // the configuration key
    // this is what we'll use to get the configuration we created in the previous step.
    const API_KEY_CONFIG_PATH = 'tutorial_import/api/auth_token';

    /** @var ZendClientFactory */
    protected ZendClientFactory $zendClientFactory;

    /** @var Data */
    protected $jsonHelper;

    /** @var Config */
    protected Config $config;

    /**
     * FakeStoreApiClient constructor.
     * @param ZendClientFactory $zendClientFactory
     * @param Json $jsonHelper
     * @param Config $config
     */
    public function __construct(ZendClientFactory $zendClientFactory, Json $jsonHelper, Config $config)
    {
        $this->zendClientFactory = $zendClientFactory;
        $this->jsonHelper = $jsonHelper;
        $this->config = $config;
    }

    protected function getApiToken()  {
        // get the API Token from the configuration
        return $this->config->getValue(self::API_KEY_CONFIG_PATH);
    }

    /**
     * @param $uri
     * @param $method
     * @return Zend_Http_Response
     * @throws Zend_Http_Client_Exception
     */
    protected function makeRequest($uri, $method): Zend_Http_Response
    {
        // create a new client
        /** @var ZendClient $zendClient */
        $zendClient = $this->zendClientFactory->create();
        $token = $this->getApiToken();

        // configure the request by specifying the URL,
        // HTTP method (get/post), as well as any headers the API might need
        $zendClient
            ->setUri(sprintf("%s%s", self::API_URL, $uri))
            ->setMethod($method)
            ->setHeaders([
                'Accept: application/json',
                sprintf("Authorization: Bearer %s", $token)
            ]);

        // make the request and return the response
        return $zendClient->request();
    }

    public function requestProducts()
    {
        $response =  $this->makeRequest(self::RESOURCE_PRODUCTS, ZendClient::GET);
        return $this->decodeResponse($response);
    }

    protected function decodeResponse(Zend_Http_Response $response) {
        return $this->jsonHelper->jsonDecode($response->getBody());
    }
}
