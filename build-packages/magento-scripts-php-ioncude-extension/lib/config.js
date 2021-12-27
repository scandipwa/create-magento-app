const linuxArchives = {
    x64: 'https://downloads.ioncube.com/loader_downloads/ioncube_loaders_lin_x86-64.tar.gz',
    arm64: 'https://downloads.ioncube.com/loader_downloads/ioncube_loaders_lin_aarch64.tar.gz'
};

const darwinArchives = {
    x64: 'https://downloads.ioncube.com/loader_downloads/ioncube_loaders_mac_x86-64.tar.gz'
};

module.exports = {
    links: {
        linux: linuxArchives,
        darwin: darwinArchives
    }
};
