<?php declare(strict_types=1);

namespace Scandiweb\TutorialImport\Console\Command;

use Magento\Framework\App\Area;
use Magento\Framework\App\State;
use Magento\Store\Model\App\Emulation;
use Scandiweb\TutorialImport\Model\Import\ProductImporter;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class ImportCommand extends Command
{
    /** @var ProductImporter */
    protected ProductImporter $importer;

    /** @var State **/
    protected State $state;

    /**
     * ImportCommand constructor.
     * @param ProductImporter $importer
     * @param Emulation $emulation
     * @param State $state
     */
    public function __construct(ProductImporter $importer, Emulation $emulation, State $state)
    {
        parent::__construct();

        $this->importer = $importer;
        $this->state = $state;
    }


    protected function configure()
    {
        $this->setName('fakestore:product:import');
        $this->setDescription('Import products from the Fake Store API');

        parent::configure();
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $output->writeln('<comment>Importing...</comment>');

        $this->state->setAreaCode(Area::AREA_ADMINHTML);
        $this->importer->importProducts();

        $output->writeln('<info>Import complete.</info>');
    }
}
