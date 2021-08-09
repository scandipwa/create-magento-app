<?php

namespace Scandiweb\TutorialImport\Controller\Adminhtml\Import;

use Exception;
use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Magento\Framework\Controller\ResultFactory;
use Magento\Framework\Message\ManagerInterface;
use Magento\Framework\View\Result\PageFactory;
use Scandiweb\TutorialImport\Model\Import\ProductImporter;

class Index extends Action
{
    // dependencies:
    /** @var PageFactory */
    protected PageFactory $resultPageFactory;

    /** @var ManagerInterface */
    protected $messageManager;

    /** @var ProductImporter */
    protected ProductImporter $productImporter;

    /**
     * Index constructor.
     * @param Context $context
     * @param PageFactory $resultPageFactory
     * @param ManagerInterface $messageManager
     * @param ProductImporter $productImporter
     */
    public function __construct(Context $context, PageFactory $resultPageFactory, ManagerInterface $messageManager, ProductImporter $productImporter)
    {
        $this->resultPageFactory = $resultPageFactory;
        $this->messageManager = $messageManager;
        $this->productImporter = $productImporter;
        return parent::__construct($context);
    }

    public function execute()
    {
        $resultRedirect = $this->resultFactory->create(ResultFactory::TYPE_REDIRECT);
        $resultRedirect->setUrl($this->_redirect->getRefererUrl());
        try {
            $this->productImporter->importProducts();
            $this->messageManager->addSuccessMessage('Products imported');
        } catch (Exception $exception) {
            $this->messageManager->addErrorMessage('Could not import products: ' . $exception->getMessage());
        }
        return $resultRedirect;
    }
}
