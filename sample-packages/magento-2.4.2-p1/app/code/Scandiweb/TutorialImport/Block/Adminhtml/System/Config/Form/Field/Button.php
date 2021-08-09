<?php declare(strict_types=1);


namespace Scandiweb\TutorialImport\Block\Adminhtml\System\Config\Form\Field;


use Magento\Backend\Block\Template\Context;
use Magento\Config\Block\System\Config\Form\Field;
use Magento\Framework\Data\Form\Element\AbstractElement;

class Button extends Field
{
    public function __construct(
        Context $context,
        array $data = []
    ) {
        parent::__construct($context, $data);
    }

    protected function _prepareLayout(): Button
    {
        parent::_prepareLayout();
        if (!$this->getTemplate()) {
            $this->setTemplate('system/config/fieldset/import_button.phtml');
        }

        return $this;
    }

    protected function _getElementHtml(AbstractElement $element)
    {
        return $this->_toHtml();
    }

    public function getImportControllerUrl(): string
    {
        return $this->getUrl('tutorial_import/import/index');
    }
}
