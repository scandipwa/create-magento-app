<?php declare(strict_types=1);


namespace Scandiweb\TutorialImport\Model\Import;

use Magento\Catalog\Model\ProductFactory;
use Magento\Catalog\Model\ResourceModel\Product\CollectionFactory;
use Scandiweb\TutorialImport\Model\FakeStoreApiClient;

class ProductImporter
{
    /** @var FakeStoreApiClient */
    protected FakeStoreApiClient $client;

    /** @var CollectionFactory */
    protected CollectionFactory $productCollectionFactory;

    /** @var ProductFactory */
    protected ProductFactory $productFactory;

    /**
     * ProductImporter constructor.
     * @param FakeStoreApiClient $client
     * @param CollectionFactory $productCollectionFactory
     * @param ProductFactory $productFactory
     */
    public function __construct(FakeStoreApiClient $client, CollectionFactory $productCollectionFactory, ProductFactory $productFactory)
    {
        $this->client = $client;
        $this->productCollectionFactory = $productCollectionFactory;
        $this->productFactory = $productFactory;
    }

    public function importProducts()
    {
        $data = $this->client->requestProducts();
        $collection = $this->dataToProductCollection($data);
        $collection->save();
    }

    protected function dataToProductCollection($data): \Magento\Catalog\Model\ResourceModel\Product\Collection
    {
        // new empty collection
        $collection = $this->productCollectionFactory->create();

        // go through all of the data items
        foreach ($data as $item) {
            // new "empty" product
            $product = $this->productFactory->create();

            // assign values from the data array to the project
            // make sure you map the correct properties to the correct product attributes
            // this will vary from API to API
            $product->setSku(strval($item['id']));
            $product->setName($item['title']);
            $product->setPrice($item['price']);
            $product->setBasePrice($item['price']);
            $product->setCustomAttribute('description', $item['description']);

            // some properties are the same for all products
            // we can't leave these at the default values, because Magento is dumb
            $product->setAttributeSetId(4);
            $product->setStatus(1);
            $product->setVisibility(4);
            $product->setTaxClassId(0);
            $product->setTypeId('simple');

            // now, append the newly-created product to the collection
            $collection->addItem($product);
        }

        // return the collection we created. it should have all the products now!
        return $collection;
    }
}
